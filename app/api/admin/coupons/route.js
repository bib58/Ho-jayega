import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "../../../middleware/authAdmin";
import Coupon from "../../../Schemas/Coupon";
import { inngest } from "../../../inngest/client";
import connectDB from "../../../middleware/connectDB";

export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        await connectDB();
        const coupon = await req.json();
        coupon.code = coupon.code.toUpperCase();
        const coup = await Coupon.create(coupon);

        await inngest.send({
            name: "coupon-created",
            data: { couponId: coup._id },
        });
        return NextResponse.json({ message: "Coupon created successfully" }, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        await connectDB();
        const { searchParams } = req.nextUrl;
        const code = searchParams.get("code");

        const deletedCoupon = await Coupon.findOneAndDelete({
            code: code.toUpperCase()
        });
        if (!deletedCoupon) {
            return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        await connectDB();
        const coupons = await Coupon.find();
        return NextResponse.json(coupons, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

