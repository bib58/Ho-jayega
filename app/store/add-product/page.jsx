'use client';

import upload_area from "../../../public/upload_area.svg";
import Image from "next/image";
import { useState } from "react"
import { toast } from "react-hot-toast";
import { upload } from "@imagekit/next";
import Loading from "../../components/Loading";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

const authenticator = async () => {
    const res = await fetch("/api/imagekit-auth");
    if (!res.ok) {
        throw new Error("Authentication failed");
    }
    return await res.json();
};

export default function StoreAddProduct() {
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        stock: 0,
    })
    const [loading, setLoading] = useState(false)
    const { user } = useUser();
    const router = useRouter();
    const { getToken } = useAuth();


    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            if (!images[1]) {
                return (toast.error("Please add atleast one image"))
            }
            setLoading(true);
            const { token, expire, signature, publicKey } = await authenticator();
            console.log("Authentication successful:", { token, expire, signature, publicKey });
            console.log("Starting upload images");

            const uploadedImages = await Promise.all(
                Object.values(images)
                    .filter((image) => image !== null)
                    .map(async (image) => {
                        try {
                            console.log("Uploading:", image.name, image.type, image.size);

                            const result = await upload({
                                expire,
                                token,
                                signature,
                                publicKey,
                                file: image,
                                fileName: image.name,
                            });

                            console.log("Upload success:", result.url);
                            console.log("Upload success:", result.fileId);
                            return result;
                        } catch (err) {
                            console.error("Upload failed:", err);
                            console.error("Response:", err.response);
                            throw err;
                        }
                    })
            );

            console.log(uploadedImages);
            const clerktoken = await getToken();
            const formData = new FormData();

            formData.append("name", productInfo.name);
            formData.append("description", productInfo.description);
            formData.append("mrp", productInfo.mrp);
            formData.append("price", productInfo.price);
            formData.append("category", productInfo.category);
            formData.append("stock", productInfo.stock);
            formData.append("imageUrls", uploadedImages[0].url);
            formData.append("imageFileIds", uploadedImages[0].fileId);

            const { data } = await axios.post("/api/store/product", formData, { headers: { Authorization: `Bearer ${clerktoken}` } });

            console.log("Resetting form...");
            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                category: "",
                stock: 0
            })
            setImages({ 1: null });
            router.refresh();
        }
        catch (error) {
            console.log(error.response?.data);
            toast.error(error.response?.data?.error || error.response?.data?.message || error.message);
        }
        finally {
            setLoading(false);
        }
    }

    return (!loading ? (
        <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div htmlFor="" className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <div className="flex gap-5">
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
                <label htmlFor="" className="flex flex-col gap-2 ">
                    Stock Level
                    <input type="number" min="0" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>
            </div>

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition cursor-pointer">Add Product</button>
        </form>) : <Loading />
    )
}