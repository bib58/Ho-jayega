import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import connectDB from '../../middleware/connectDB';
import Order from '../../Schemas/Order';
import User from '../../Schemas/User';

export async function POST(req) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    try {
        await connectDB();
        const payload = await req.text();
        const sig = req.headers.get('stripe-signature');
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        const handlePaymenIntent = async (paymentIntentId, isPaid) => {
            const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId });
            if (sessions.data.length == 0) return NextResponse.json({ received: false, message: 'Session not found' }, { status: 400 });

            const { orderIds, userId, appId } = sessions.data[0].metadata;
            console.log(orderIds, userId, appId);

            if (appId !== 'carthub') return NextResponse.json({ received: false, message: 'Invalid app ID' }, { status: 400 });

            const orderIdsarray = orderIds.split(',');
            if (isPaid) {
                await Promise.all(
                    orderIdsarray.map(async (id) => {
                        await Order.updateOne(
                            { _id: id },
                            { $set: { isPaid } }
                        );
                    })
                );
                await User.findOneAndUpdate({ id: userId }, { cart: {} });
            }
            else {
                await Promise.all(
                    orderIdsarray.map(async (id) => {
                        await Order.deleteOne({ _id: id });
                    })
                );
            }
            return NextResponse.json({ received: true });
        }

        const handlePaymentIntentCanceled = async (paymentIntentId, isPaid) => {
            const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId });
            if (sessions.data.length == 0) return NextResponse.json({ received: false, message: 'Session not found' }, { status: 400 });

            const { orderIds, userId, appId } = sessions.data[0].metadata;
            console.log(orderIds, userId, appId);

            if (appId !== 'carthub') return NextResponse.json({ received: false, message: 'Invalid app ID' }, { status: 400 });

            const orderIdsarray = orderIds.split(',');
            await Promise.all(
                orderIdsarray.map(async (id) => {
                    await Order.deleteOne({ _id: id });
                })
            );
            return NextResponse.json({ received: true });
        }

        if (event.type === 'payment_intent.succeeded') {
            return await handlePaymenIntent(event.data.object.id, true);
        }
        else if (event.type === 'payment_intent.canceled') {
            return await handlePaymentIntentCanceled(event.data.object.id, false);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('Error handling stripe webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
