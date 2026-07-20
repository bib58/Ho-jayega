import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Store from '../../../Schemas/Store';
import User from '../../../Schemas/User';
import connectDB from "../../../middleware/connectDB";

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

        const formData = await req.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const logoUrl = formData.get("logoUrl");
        const logoFileId = formData.get("logoFileId");

        console.log({
            name: formData.get("name"),
            username: formData.get("username"),
            description: formData.get("description"),
            email: formData.get("email"),
            contact: formData.get("contact"),
            address: formData.get("address"),
            logoUrl: formData.get("logoUrl"),
            logoFileId: formData.get("logoFileId"),
        });


        if (
            !name ||
            !username ||
            !description ||
            !email ||
            !contact ||
            !address ||
            !logoUrl || !logoFileId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "All fields are required.",
                },
                { status: 400 }
            );
        }

        const existingStore = await Store.findOne({ userId });

        if (existingStore) {
            return NextResponse.json(
                {
                    success: false,
                    error: "You already have a store.",
                    status: existingStore.status,
                },
                { status: 400 }
            );
        }

        const usernameTaken = await Store.findOne({ username });

        if (usernameTaken) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Username already exists.",
                },
                { status: 400 }
            );
        }

        // Change this according to your User schema
        const user = await User.findOne({ id: userId });

        console.log("User:", user);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "User not found.",
                },
                { status: 404 }
            );
        }

        console.log("1. User found");

        const store = await Store.create({
            userId,
            user: user._id,
            name,
            username,
            description,
            email,
            contact,
            address,
            logo: {
                url: logoUrl,
                fileId: logoFileId,
            },
        });

        console.log("2. Store created");
        return NextResponse.json(
            {
                success: true,
                message: "Store created successfully.",
                store,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("STORE CREATE ERROR:");
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                error: err.message,
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const existingStore = await Store.findOne({ userId });
        if (!existingStore) {
            return NextResponse.json({ success: true, exists: false }, { status: 200 });
        }

        return NextResponse.json({ success: true, exists: true, status: existingStore.status }, { status: 200 });
    } catch (err) {
        console.error("GET Store Error:", err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}


