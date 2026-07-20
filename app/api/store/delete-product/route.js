import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../../middleware/connectDB";
import Product from "../../../Schemas/Product";
import User from "../../../Schemas/User";
import Store from "../../../Schemas/Store";
import authSeller from "../../../middleware/authSeller";

export async function DELETE(request) {
    try {
        await connectDB();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { message: "Product ID is required" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json(
                { message: "Invalid Product ID" },
                { status: 400 }
            );
        }

        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const product = await Product.findOne({
            _id: new mongoose.Types.ObjectId(productId),
            storeId: storeId,
        });

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404 }
            );
        }

        await Product.deleteOne({ _id: product._id });

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}