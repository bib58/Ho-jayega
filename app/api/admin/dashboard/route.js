import { currentUser } from "@clerk/nextjs/server";
import authAdmin from "../../../middleware/authAdmin";
import { NextResponse } from "next/server";
import Store from "../../../Schemas/Store";
import Order from "../../../Schemas/Order";
import mongoose from "mongoose";
import Product from "../../../Schemas/Product";
import connectDB from "../../../middleware/connectDB";

export async function GET(req) {
    try {
        await connectDB();
        console.log("Database connected");
        
        const user = await currentUser()
        const userId = user?.id;
        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }
        
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Fetching orders count...");
        const orders = await Order.countDocuments();
        console.log("Orders count:", orders);

        console.log("Fetching approved stores count...");
        const stores = await Store.countDocuments({ status: "approved" });
        console.log("Stores count:", stores);

        console.log("Fetching all orders...");
        const allOrders = await Order.find({}, {
            createdAt: 1,
            total: 1,
        });
        console.log("All orders fetched:", allOrders.length);

        let totalRevenue = 0;
        allOrders.forEach(ord => {
            const orderTotal = Number(ord.total) || 0;
            totalRevenue += orderTotal;
        })
        const revenue = totalRevenue.toFixed(2);
        console.log("Total revenue:", revenue);

        console.log("Fetching products count...");
        const products = await Product.countDocuments();
        console.log("Products count:", products);

        const dashData = {
            orders, stores, products, revenue, allOrders
        }
        return NextResponse.json({ dashData });
    } catch (error) {
        console.error("Dashboard error:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
