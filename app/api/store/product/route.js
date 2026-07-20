import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import User from '../../../Schemas/User';
import Product from '../../../Schemas/Product';
import connectDB from "../../../middleware/connectDB";
import axios from "axios";
import mongoose from "mongoose";
import authSeller from "../../../middleware/authSeller";

export async function POST(req) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                { status: 401 }
            );
        }
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();

        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const imageUrls = formData.getAll("imageUrls");
        const imageFileIds = formData.getAll("imageFileIds");
        const stock = Number(formData.get("stock") || 0);
        const inStock = stock > 0;

        const images = imageUrls.map((url, index) => ({
            url,
            fileId: imageFileIds[index],
        }));

        console.log({
            name,
            description,
            mrp,
            price,
            category,
            images,
        });

        if (
            !name ||
            !description ||
            !mrp ||
            !price ||
            !category
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required.",
                },
                { status: 400 }
            );
        }

        const newProduct = {
            name,
            description,
            mrp,
            price,
            category,
            images,
            storeId,
            inStock,
            stock
        };

        const result = await mongoose.connection.db
            .collection("products")
            .insertOne(newProduct);

        // Update store's products array
        await mongoose.connection.db.collection("stores").updateOne(
            { _id: new mongoose.Types.ObjectId(storeId) },
            {
                $addToSet: {
                    products: result.insertedId,
                },
            }
        );
        return new NextResponse({ success: true, message: "Product created successfully" }, { status: 201 });
    }
    catch (error) {
        console.log(error);
        return new NextResponse({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}


export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const stId = await authSeller(userId);
        if (!stId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
        console.log(stId);
        const products = await Product.find({ storeId: stId })
        return NextResponse.json({ success: true, products }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                error: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

