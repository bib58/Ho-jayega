'use client'
import ProductCard from "../../../components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "../../../components/Loading"
import Image from "next/image"
import Link from "next/link"

export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStoreData = async () => {
        try {
            const res = await fetch(`/api/store/data?username=${username}`);
            const data = await res.json();
            if (res.ok && data.store) {
                setStoreInfo(data.store);
                setProducts(data.store.products || []);
            } else {
                console.error(data.message || "Failed to fetch store data");
                setStoreInfo(null);
            }
        } catch (err) {
            console.error("Error fetching store info:", err);
            setStoreInfo(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (username) {
            fetchStoreData()
        }
    }, [username])

    if (loading) {
        return <Loading />
    }

    if (!storeInfo) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 gap-4">
                <h2 className="text-3xl font-semibold text-slate-800">Store Not Found</h2>
                <p className="text-slate-600 max-w-md">
                    We couldn't find an active store with the username "<span className="font-semibold text-green-600">{username}</span>". Please check the spelling or return to the home page.
                </p>
                <Link href="/" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 transition text-white font-medium rounded-full shadow-md text-sm mt-2">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                <Image
                    src={storeInfo.logo?.url || storeInfo.logo}
                    alt={storeInfo.name}
                    className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                    width={200}
                    height={200}
                />
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                    <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                    <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                    <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <span>{storeInfo.address}</span>
                        </div>
                        <div className="flex items-center">
                            <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <span>{storeInfo.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                {products.length > 0 ? (
                    <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
                        {products.map((product) => (
                            <ProductCard key={product._id || product.id} prod={product} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 text-center py-20 border border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-500 text-lg">No products available in this store yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}