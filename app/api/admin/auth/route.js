import { auth } from "@clerk/nextjs/server";
import authAdmin from "../../../middleware/authAdmin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const isAdmin = await authAdmin(userId);

        return NextResponse.json({
            isAdmin,
            message: isAdmin
                ? "Admin authenticated successfully"
                : "Unauthorized Admin",
        }, isAdmin ? { status: 200 } : { status: 401 });
    } catch (error) {
        console.error("Error in admin auth route:", error);

        return NextResponse.json(
            { error: "Error in admin auth route" },
            { status: 400 }
        );
    }
}