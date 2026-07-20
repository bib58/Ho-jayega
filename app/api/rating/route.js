import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../middleware/connectDB";
import Rating from "../../Schemas/Rating";
import User from "../../Schemas/User";
import Product from "../../Schemas/Product";

export async function POST(req) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { rating, review, productId, orderId } = await req.json();

        if (rating === undefined || rating === null || !review || !productId || !orderId) {
            return NextResponse.json({ message: "Missing required fields", error: "Missing required fields" }, { status: 400 });
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
            return NextResponse.json({ message: "Invalid rating value", error: "Invalid rating value" }, { status: 400 });
        }

        const dbUser = await User.findOne({ id: userId });
        if (!dbUser) {
            return NextResponse.json({ message: "User profile not found in database", error: "User profile not found in database" }, { status: 404 });
        }

        const dbProduct = await Product.findOne({
            $or: [
                { _id: mongoose.isValidObjectId(productId) ? productId : null },
                { id: productId }
            ]
        });
        if (!dbProduct) {
            return NextResponse.json({ message: "Product not found", error: "Product not found" }, { status: 404 });
        }

        const possibleProductIds = Array.from(new Set([productId, dbProduct._id.toString(), dbProduct.id].filter(Boolean)));
        const existingRating = await Rating.findOne({
            userId,
            orderId: String(orderId),
            productId: { $in: possibleProductIds }
        });
        if (existingRating) {
            return NextResponse.json({ message: "You have already rated this product for this order", error: "Duplicate rating" }, { status: 400 });
        }

        const canonicalProductId = dbProduct._id.toString();
        const newRating = await Rating.create({
            rating: numericRating,
            review: review.trim(),
            userId,
            productId: canonicalProductId,
            orderId: String(orderId),
            user: dbUser._id,
            product: dbProduct._id
        });

        if (!dbUser.ratings) {
            dbUser.ratings = [];
        }
        dbUser.ratings.push(newRating._id);
        await dbUser.save();

        if (!dbProduct.rating) {
            dbProduct.rating = [];
        }
        dbProduct.rating.push(newRating._id);
        await dbProduct.save();

        return NextResponse.json({ rating: newRating, message: "Rating submitted successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating rating:", error);
        return NextResponse.json({ error: error.message, message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const ratings = await Rating.find({ userId });
        return NextResponse.json({ ratings });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return NextResponse.json({ error: "Internal Server Error", message: "Internal Server Error" }, { status: 500 });
    }
}
