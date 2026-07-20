import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import Order from '../../../Schemas/Order';
import User from '../../../Schemas/User';
import Product from '../../../Schemas/Product';
import Rating from '../../../Schemas/Rating';
import connectDB from "../../../middleware/connectDB";
import mongoose from "mongoose";
import authSeller from "../../../middleware/authSeller";


export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({ error: "No store found" }, { status: 401 });
        }
        const strId = new mongoose.Types.ObjectId(storeId);
        const orders = await Store.findById(strId).populate('orders'); 

        const products = await Store.findById(strId).populate('products');

        const ratings = await Rating.find({ productId: { $in: products.products.map(product => product.id) } })
            .populate("user")
            .populate("product");
            
         if(!ratings) {
            return NextResponse.json({ error: "No ratings found" }, { status: 404 });
         }
         const store = await Store.findById(strId).populate("orders");
        const DashboardData = {
            ratings,
            totalOrders: orders.orders.length,
            totalEarnings: store.orders.reduce((sum, order) => sum + order.total, 0),
            totalProducts: products.products.length,
        };
        return NextResponse.json({ aagya:DashboardData });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

