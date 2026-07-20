'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { upload } from "@imagekit/next";
import Loading from "../../components/Loading";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import upload_area from "../../../public/upload_area.svg";
import axios from "axios";

const authenticator = async () => {
    const res = await fetch("/api/imagekit-auth");
    if (!res.ok) {
        throw new Error("Authentication failed");
    }
    return await res.json();
};

export default function CreateStore() {
    const { user } = useUser();
    const router = useRouter();
    const { getToken } = useAuth();
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/store/create", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!data.success) {
                toast.error("Failed to fetch store status.");
                return;
            }

            if (!data.exists) {
                setAlreadySubmitted(false);
                setStatus("");
                setMessage("");
                return;
            }

            setAlreadySubmitted(true);
            setStatus(data.status);

            if (data.status === "pending") {
                setMessage(
                    "Your store details have been submitted for review. Please wait for admin approval."
                );
            } else if (data.status === "approved") {
                setMessage("Your store has been approved!");

                setTimeout(() => {
                    router.push("/store");
                }, 3000);
            } else if (data.status === "rejected") {
                setMessage(
                    "Your store request has been rejected. Please contact support or submit again."
                );
            }
        } catch (error) {
            toast.error("Failed to fetch seller status.");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login first.");
            return;
        }
        if (!storeInfo.image) {
            toast.error("Please upload a store logo.");
            return;
        }

        try {
            const { token, expire, signature, publicKey } = await authenticator();

            const uploadedImage = await upload({
                expire,
                token,
                signature,
                publicKey,
                file: storeInfo.image,
                fileName: storeInfo.image.name,
            });
            console.log("Uploaded Image:", uploadedImage);

            const clerktoken = await getToken();

            const formData = new FormData();

            formData.append("name", storeInfo.name);
            formData.append("username", storeInfo.username);
            formData.append("description", storeInfo.description);
            formData.append("email", storeInfo.email);
            formData.append("contact", storeInfo.contact);
            formData.append("address", storeInfo.address);

            formData.append("logoUrl", uploadedImage.url);
            formData.append("logoFileId", uploadedImage.fileId);

            const { data } = await axios.post(
                "/api/store/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${clerktoken}`,
                    },
                }
            );

            if (!data.success) {
                toast.error(data.error || "Something went wrong.");
                return;
            }

            toast.success(data.message || "Store submitted successfully.");
            await fetchSellerStatus();

        } catch (error) {
            console.log(error.response?.data);

            toast.error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message
            );
        }
    };

    useEffect(() => {
        if (user) {
            fetchSellerStatus()
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                <h1 className="text-2xl font-semibold">Please login to Continue</h1>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={onSubmitHandler} className="max-w-xl flex flex-col gap-4">
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on GoCart, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <button className="bg-slate-800 text-white py-2 rounded mt-10 active:scale-95 hover:bg-slate-900 transition ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">3 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}