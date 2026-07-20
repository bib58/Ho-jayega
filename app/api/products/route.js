import { NextResponse } from 'next/server';
import Product from '../../Schemas/Product';
import Store from '../../Schemas/Store';
import Rating from '../../Schemas/Rating';
import User from '../../Schemas/User';
import connectDB from '../../middleware/connectDB';


export async function GET() {
    try {
        await connectDB();
        let products = await Product.find({ inStock: true })
            .sort({ createdAt: -1 })
            .populate({
                path: "storeId",
                match: { isActive: true },
            })
            .populate({
                path: "rating",
                select: "createdAt rating review user",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "user",
                    select: "name image_url",
                },
            });

        products = products.filter(product => product.storeId);
        return NextResponse.json({ products });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server occured" }, { status: 500 });
    }
}