import { auth } from "@clerk/nextjs/server";
import connectDB from '../../middleware/connectDB';
import Coupon from '../../Schemas/Coupon';
import Order from '../../Schemas/Order';
import OrderItem from '../../Schemas/OrderItem';
import Product from "../../Schemas/Product";
import User from "../../Schemas/User";
import Store from "../../Schemas/Store";
import Address from "../../Schemas/Address";
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Stripe } from 'stripe';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, has } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { items, totalPrice, addressId, paymentMethod, couponCode } = await req.json();
    if (!items || !totalPrice || !addressId || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const dbUser = await User.findOne({ id: userId });
    if (!dbUser) {
      return NextResponse.json({ message: 'User profile not found in database' }, { status: 404 });
    }
    const addressDoc = await Address.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(addressId) ? addressId : null },
        { id: addressId }
      ]
    });
    if (!addressDoc) {
      return NextResponse.json({ message: 'Shipping address not found' }, { status: 404 });
    }

    let coup = null;
    if (couponCode) {
      coup = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        expiresAt: { $gt: new Date() }
      });
      if (!coup) {
        return NextResponse.json({ message: 'Invalid or expired coupon code' }, { status: 400 });
      }
    }

    const isMember = has({ plan: "plus" });
    const isNewUser = (await Order.countDocuments({ userId })) === 0;
    if (coup && (coup.forMember || coup.forNewUser)) {
      const isEligible = (coup.forMember && isMember) || (coup.forNewUser && isNewUser);

      if (!isEligible) {
        return NextResponse.json({ message: "This coupon is only valid for eligible members or new users." }, { status: 400 });
      }
    }

    const ordersByStore = new Map();

    for (const item of items) {
      const productId = item.productId || item._id || item.id;
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json({ message: `Product with ID ${productId} not found` }, { status: 404 });
      }

      const stock = product.stock !== undefined ? product.stock : 0;
      if (item.quantity > stock) {
        return NextResponse.json({ message: `Overbought: ${product.name}. Not that much available to vendor.` }, { status: 400 });
      }

      const storeId = product.storeId.toString();
      if (!ordersByStore.has(storeId)) {
        ordersByStore.set(storeId, []);
      }
      ordersByStore.get(storeId).push({
        product,
        quantity: item.quantity,
        price: product.price
      });
    }

    const orderId = [];
    let fullAmount = 0;
    let shippingAdded = false;

    for (const [storeId, storeItems] of ordersByStore.entries()) {
      let totalAmount = storeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      if (coup) {
        totalAmount = totalAmount - (totalAmount * coup.discount / 100);
      }
      if (!has({ plan: 'plus' }) && !shippingAdded) {
        totalAmount = totalAmount + 5;
        shippingAdded = true;
      }
      totalAmount = parseFloat(totalAmount.toFixed(2));
      fullAmount += totalAmount;

      const storeDoc = await Store.findById(storeId);
      if (!storeDoc) {
        return NextResponse.json({ message: `Store with ID ${storeId} not found` }, { status: 404 });
      }


      const order = new Order({
        total: totalAmount,
        userId: userId,
        storeId: storeId,
        addressId: addressId,
        paymentMethod: paymentMethod,
        isCouponUsed: coup ? true : false,
        coupon: coup ? { code: coup.code, discount: coup.discount } : {},
        user: dbUser._id,
        store: storeDoc._id,
        address: addressDoc._id,
        orderItems: []
      });
      await order.save();
      orderId.push(order._id);

      const orderItemIds = [];
      for (const item of storeItems) {
        const orderItem = new OrderItem({
          orderId: order.id,
          productId: item.product.id || item.product._id.toString(),
          quantity: item.quantity,
          price: item.price,
          order: order._id,
          product: item.product._id
        });
        await orderItem.save();
        orderItemIds.push(orderItem._id);

        const updatedProduct = await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (updatedProduct && updatedProduct.stock <= 0) {
          await Product.findByIdAndUpdate(item.product._id, {
            $set: { inStock: false, stock: 0 }
          });
        }
      }

      order.orderItems = orderItemIds;
      await order.save();

      storeDoc.orders.push(order._id);
      await storeDoc.save();

      dbUser.buyerOrders.push(order._id);
      await dbUser.save();
    }

    if (paymentMethod === 'COD') {
      await User.findOneAndUpdate({ id: userId }, { cart: {} });
    }

    const responseData = {
      message: 'Order placed successfully',
      orderId: orderId,
      fullAmount: parseFloat(fullAmount.toFixed(2))
    };

    if (paymentMethod === 'STRIPE') {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = await req.headers.get('origin');
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'CartHub Order Payment',
              },
              unit_amount: Math.round(fullAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/loading?nextUrl=/orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
          orderIds: orderId.join(','),
          userId,
          appId: 'carthub'
        }
      });
      responseData.session = session;
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ message: 'An error occurred while placing the order' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const rawOrders = await Order.find({ userId })
      .populate('store')
      .populate('address')
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product'
        }
      })
      .sort({ createdAt: -1 });

    const orders = await Promise.all(rawOrders.map(async (orderDoc) => {
      const orderObj = orderDoc.toObject();
      let items = orderObj.orderItems || [];

      if (items.length === 0 || items.some(item => !item || !item.product)) {
        const dbItems = await OrderItem.find({
          $or: [
            { order: orderDoc._id },
            { orderId: orderDoc.id },
            { orderId: orderDoc._id.toString() }
          ]
        }).populate('product');

        if (dbItems.length > 0) {
          items = dbItems.map(item => item.toObject());
        }
      }

      orderObj.orderItems = items;
      return orderObj;
    }));

    return NextResponse.json({ orders }, { status: 200 });
  }
  catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'An error occurred while fetching orders' }, { status: 500 });
  }
}
