import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import User from '../../../Schemas/User';
import connectDB from "../../../middleware/connectDB";

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }
        const store = await Store.findOne({ username, isActive: true })
            .collation({ locale: 'en', strength: 2 })
            .populate({
                path: "products",
                match: { inStock: true },
                populate: {path: "rating"}
            });

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 });
        }
        return NextResponse.json({ store });
    }
    catch (error) {
        return NextResponse.json({error: error.message }, { status: 400 });
    }
}
