import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {

        const { token, expire, signature } = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY
        })
        return NextResponse.json({ token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY })
    }

    catch (error) {
        console.error("Error generating ImageKit auth params:", error);
        return NextResponse.json({ success: false, error: "Failed to generate auth params" }, { status: 500 });
    }
}
