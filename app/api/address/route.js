import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Address from '../../Schemas/Address';
import User from '../../Schemas/User';
import connectDB from '../../middleware/connectDB';

export async function POST(req) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized', error: 'Unauthorized' }, { status: 401 });
        }
        const { address } = await req.json();
        
        const dbUser = await User.findOne({ id: userId });
        if (!dbUser) {
            return NextResponse.json({ message: 'User profile not found in database', error: 'User profile not found in database' }, { status: 404 });
        }

        address.userId = userId;
        address.user = dbUser._id;

        const newAddress = await Address.create(address);

        dbUser.Address.push(newAddress._id);
        await dbUser.save();

        return NextResponse.json({ newAddress, message: 'Address updated successfully' });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message, message: error.message }, { status: 400 })
    }
}

export async function GET() {
    try {
        await connectDB();
        const { userId } = await auth();

        const addresses = await Address.find({ userId });
        return NextResponse.json({ addresses });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

