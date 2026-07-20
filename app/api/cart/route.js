import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from '../../Schemas/User';
import connectDB from '../../middleware/connectDB';

export async function POST(req) {
    try {
        await connectDB();
        const { userId } = await auth();
        const { cart } = await req.json();

        await User.findOneAndUpdate(
            { id: userId },
            { cart: cart },
            { new: true }
        );
        return NextResponse.json({ message: 'Cart updated successfully' });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();
        const user = await User.findOne({ id: userId });
        if (!user) {
            return NextResponse.json({ cart: {} });
        }
        return NextResponse.json({ cart: user.cart || {} });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
