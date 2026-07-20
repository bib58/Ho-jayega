import { auth } from "@clerk/nextjs/server";
import authAdmin from "../../../middleware/authAdmin";
import { NextResponse } from "next/server";
import Store from "../../../Schemas/Store";
import User from "../../../Schemas/User";
import connectDB from "../../../middleware/connectDB";
import mongoose from "mongoose";

export async function POST(req) {
    console.log("========== POST /api/admin/store ==========");

    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("DB connected.");

        const { userId } = await auth();
        console.log("Authenticated user:", userId);

        if (!userId) {
            console.log("No authenticated user.");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log("Checking admin...");
        const isAdmin = await authAdmin(userId);
        console.log("Is Admin:", isAdmin);

        if (!isAdmin) {
            console.log("Admin check failed.");
            return NextResponse.json(
                { error: "Unauthorized Admin" },
                { status: 401 }
            );
        }

        const body = await req.json();
        console.log("Request body:", body);

        let { storeId, status } = body;

        if (!storeId || !status) {
            return NextResponse.json(
                { error: "storeId and status are required" },
                { status: 400 }
            );
        }

        // Convert string ID to MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            console.log("Invalid ObjectId format:", storeId);
            return NextResponse.json(
                { error: "Invalid store ID format" },
                { status: 400 }
            );
        }

        const objectId = new mongoose.Types.ObjectId(storeId);
        console.log("Converted Store ID:", objectId, "Original:", storeId);

        // Check if store exists first
        const storeExists = await Store.findById(objectId);
        console.log("Store exists:", storeExists ? "yes" : "no", "Store ID:", objectId);

        if (!storeExists) {
            console.log("Available stores in DB:");
            const allStores = await Store.find({}).select("_id name status");
            allStores.forEach((s) => {
                console.log("  -", s._id, s.name, s.status);
            });
            return NextResponse.json(
                { error: "Store not found in database" },
                { status: 404 }
            );
        }

        if (status === "approved") {
            console.log("Approving store:", objectId);

            const updatedStore = await Store.findByIdAndUpdate(
                objectId,
                {
                    status: "approved",
                    isActive: true,
                },
                { new: true }
            );

            console.log("Updated Store:", updatedStore);
            if (!updatedStore) {
                return NextResponse.json(
                    { error: "Failed to update store" },
                    { status: 500 }
                );
            }

            // Update user's store reference
            if (updatedStore.user) {
                console.log("Updating user with store reference:", updatedStore.user);
                await User.findByIdAndUpdate(
                    updatedStore.user,
                    { store: objectId },
                    { new: true }
                );
                console.log("User store reference updated");
            }
        } else if (status === "rejected") {
            console.log("Rejecting store:", objectId);

            const updatedStore = await Store.findByIdAndUpdate(
                objectId,
                {
                    status: "rejected",
                    isActive: false,
                },
                { new: true }
            );

            console.log("Updated Store:", updatedStore);
            if (!updatedStore) {
                return NextResponse.json(
                    { error: "Failed to update store" },
                    { status: 500 }
                );
            }

            // Clear user's store reference on rejection
            if (updatedStore.user) {
                console.log("Clearing user store reference on rejection:", updatedStore.user);
                await User.findByIdAndUpdate(
                    updatedStore.user,
                    { store: null },
                    { new: true }
                );
                console.log("User store reference cleared");
            }
        } else {
            console.log("Invalid status:", status);
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        console.log("Store status updated successfully.");

        return NextResponse.json(
            { message: "Store status updated successfully" },
            { status: 200 }
        );
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// get all pending and rejected stores
export async function GET() {
    try {
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
        console.log("Is Admin:", isAdmin);

        if (!isAdmin) {
            console.log("Admin check failed.");
            return NextResponse.json(
                { error: "Unauthorized Admin" },
                { status: 401 }
            );
        }

        const stores = await Store.find({
            status: { $in: ["pending", "rejected"] },
        }).populate("user");

        console.log("Stores found:", stores.length);
        stores.forEach((store, idx) => {
            console.log(`Store ${idx}:`, store._id, "Status:", store.status, "Name:", store.name);
        });

        return NextResponse.json({ stores }, { status: 200 });
    } catch (err) {
        console.error("GET Error:", err);
        console.error("Message:", err.message);
        console.error("Stack:", err.stack);

        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
