import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import User from '../../../Schemas/User';
import Product from '../../../Schemas/Product';
import connectDB from "../../../middleware/connectDB";
import mongoose from "mongoose";
import authSeller from "../../../middleware/authSeller";


export async function POST(request) {
    try {
        await connectDB();
        const { userId } = await auth();
        const { productId } = await request.json();
        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }
        console.log("Product ID:", productId);

        const stId = await authSeller(userId);
        if (!stId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const objectId = new mongoose.Types.ObjectId(productId);
        const product = await Product.findOne({
            _id: objectId,
            storeId: stId,
        });

        await Product.findByIdAndUpdate(
        product._id,
            { $set: { inStock: !product.inStock } }
        );
        return NextResponse.json({
            success: true, inStock: product.inStock, message: `Product is now ${product.inStock ? "In Stock" : "Out of Stock"}`,
        });
    }
    catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

