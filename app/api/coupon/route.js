import { auth } from '@clerk/nextjs/server';
import connectDB from '../../middleware/connectDB';
import Coupon from '../../Schemas/Coupon';
import Order from '../../Schemas/Order';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await connectDB();
        const { userId, has } = await auth();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            expiresAt: { $gt: new Date() }
        });

        if (!coupon) {
            return NextResponse.json({ message: 'Invalid or expired coupon code' }, { status: 400 });
        }
        const isMember = has({ plan: "plus" });
        const isNewUser = (await Order.countDocuments({ userId })) === 0;

        if (coupon.forMember || coupon.forNewUser) {
            if (
                (coupon.forMember && isMember) ||
                (coupon.forNewUser && isNewUser)
            ) {

            } else {
                return NextResponse.json(
                    {
                        message:
                            "This coupon is only valid for eligible members or new users."
                    },
                    { status: 400 }
                );
            }
        }
        return NextResponse.json({ coupon }, { status: 200 });
    }

    catch (error) {
        console.error('Error processing coupon:', error);
        return NextResponse.json({ message: 'An error occurred while processing the coupon' }, { status: 500 });
    }
}
