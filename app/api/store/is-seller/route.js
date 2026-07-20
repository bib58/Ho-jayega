import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import connectDB from "../../../middleware/connectDB";
import authSeller from "../../../middleware/authSeller";

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        console.log("Authenticated user:", userId);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized", isSeller: false },
                { status: 401 }
            );
        }

        const storeId = await authSeller(userId);
        console.log("Store ID:", storeId);
        if (!storeId) {
            return NextResponse.json({ isSeller: false }, { status: 200 });
        }

        const storeInfo = await Store.findById(storeId);
        if (!storeInfo) {
            return NextResponse.json({ isSeller: false }, { status: 200 });
        }

        return NextResponse.json({ isSeller: true, store: storeInfo });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error", isSeller: false }, { status: 500 });
    }
}

