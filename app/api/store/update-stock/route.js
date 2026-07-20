import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from '../../../Schemas/Product';
import connectDB from "../../../middleware/connectDB";
import mongoose from "mongoose";
import authSeller from "../../../middleware/authSeller";

export async function POST(request) {
    try {
        await connectDB();
        const { userId } = await auth();
        const { productId, stock } = await request.json();

        if (!productId || stock === undefined || stock === null) {
            return new NextResponse("Product ID and stock level are required", { status: 400 });
        }

        const stockNum = Number(stock);
        if (isNaN(stockNum) || stockNum < 0) {
            return new NextResponse("Stock level must be a non-negative number", { status: 400 });
        }

        console.log("Updating stock for Product ID:", productId, "to", stockNum);

        const stId = await authSeller(userId);
        if (!stId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const objectId = new mongoose.Types.ObjectId(productId);
        const product = await Product.findOne({
            _id: objectId,
            storeId: stId,
        });

        if (!product) {
            return new NextResponse("Product not found or not owned by seller", { status: 404 });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            { 
                $set: { 
                    stock: stockNum, 
                    inStock: stockNum > 0 
                } 
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            stock: updatedProduct.stock,
            inStock: updatedProduct.inStock,
            message: `Product stock updated to ${updatedProduct.stock}.`,
        });
    }
    catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
