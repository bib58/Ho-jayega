import { auth } from "@clerk/nextjs/server";
import authAdmin from "../../../middleware/authAdmin";
import { NextResponse } from "next/server";
import Store from "../../../Schemas/Store";
import User from "../../../Schemas/User";
import connectDB from "../../../middleware/connectDB";

export async function POST(request) {
    const { userId } = await auth();
    if (!userId) {
        console.log("No authenticated user.");
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    await connectDB();
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized Admin" }), { status: 401 });
    }

    const { storeId } = await request.json();
    if (!storeId) {
        return new NextResponse(JSON.stringify({ error: "Missing store ID" }), { status: 401 });

    }
    const store = await Store.findById(storeId);
    if (!store) {
        return new NextResponse(JSON.stringify({ error: "Store not found" }), { status: 404 });
    }
    await Store.findByIdAndUpdate(storeId, { isActive: !store.isActive });
    return NextResponse.json({ messgae: "store toggled successfully" }, { status: 200 });
}
