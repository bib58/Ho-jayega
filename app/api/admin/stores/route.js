import { auth } from "@clerk/nextjs/server";
import authAdmin from "../../../middleware/authAdmin";
import { NextResponse } from "next/server";
import Store from "../../../Schemas/Store";
import User from "../../../Schemas/User";
import connectDB from "../../../middleware/connectDB";

export async function GET() {
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

    const stores = await Store.find({
        status: { $in: ["approved"] },
    }).populate("user");
    return NextResponse.json({ stores }, { status: 200 });
}

