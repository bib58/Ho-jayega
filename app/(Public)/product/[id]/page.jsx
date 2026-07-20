'use client'
import ProductDescription from "../../../components/ProductDescription";
import ProductDetails from "../../../components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";


export default function Product() {
    const { id } = useParams();
    console.log("Product ID:", id);
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        const product = products.find((product) => product._id.toString() === id);
        setProduct(product);
    }

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [id,products]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>
                {product && (<ProductDetails product={product} />)}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}