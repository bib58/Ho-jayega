import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../../middleware/connectDB";
import Order from '../../../Schemas/Order';
import User from "../../../Schemas/User";
import Address from "../../../Schemas/Address";
import OrderItem from "../../../Schemas/OrderItem";
import Product from "../../../Schemas/Product";
import authSeller from "../../../middleware/authSeller";

export async function POST(req) {
    try {
        const { userId } = await auth();
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({ error: "Not authorised" }, { status: 401 });
        }

        const { orderId, status } = await req.json();
        await connectDB();
        await Order.findOneAndUpdate(
            { $or: [{ id: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }] },
            { status: status }
        );

        return NextResponse.json({ message: "Order status updated" }, { status: 201 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.error || error.message }, { status: 402 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({ error: "Not authorised" }, { status: 401 });
        }
        const orders = await Order.find({ storeId: storeId.toString() })
            .populate("user")
            .populate("address")
            .populate({ path: "orderItems", populate: { path: "product" }});
            
        return NextResponse.json({ orders }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}