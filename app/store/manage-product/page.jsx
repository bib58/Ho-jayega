'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "../../components/Loading"
import { useAuth, useUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import axios from "axios";
import { Trash2 } from "lucide-react"

export default function StoreManageProducts() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const currency = '$';
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/product', { headers: { Authorization: `Bearer ${token}` } });
            setProducts(data.products);
        }
        catch (error) {
            console.log(error.response?.data);
            toast.error(error.response?.data?.error || error.response?.data?.message || error.message);
        }
        finally {
            setLoading(false);
        }
    }
    const toggleStock = async (productId) => {
        try {
            const token = await getToken();
            const { data } = await axios.post(
                '/api/store/stock-toggle',
                { productId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProducts(prev =>
                prev.map(pro =>
                    pro._id === productId
                        ? { ...pro, inStock: !pro.inStock }
                        : pro
                )
            );
        } catch (err) {
            console.log(err);
            toast.error("Error in toggling stock");
        }
    };

    const handleStockChange = (productId, newStock) => {
        setProducts(prev =>
            prev.map(pro =>
                pro._id === productId
                    ? { ...pro, stock: newStock }
                    : pro
            )
        );
    };

    const handleUpdateStock = async (productId, stockNum) => {
        const token = await getToken();
        await axios.post(
            '/api/store/update-stock',
            { productId, stock: stockNum },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setProducts(prev =>
            prev.map(pro =>
                pro._id === productId
                    ? { ...pro, inStock: stockNum > 0 }
                    : pro
            )
        );
    };

    const deleteProduct = async (productId) => {
        try {
            const token = await getToken();
            const { data } = await axios.delete(
                "/api/store/delete-product",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: { productId },
                }
            );

            setProducts(prev =>
                prev.filter(product => product._id !== productId)
            );

            toast.success(data.message);
        } 
        catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Failed to delete product"
            );
        }
    };

    useEffect(() => {
        if (user) {
            fetchProducts()
        }
    }, [user])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Manage <span className="text-slate-800 font-medium">Products</span></h1>
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product._id || product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0].url} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {product.mrp.toLocaleString()}</td>
                            <td className="px-4 py-3">{currency} {product.price.toLocaleString()}</td>
                            <td className="px-4 py-3">
                                 <div className="flex items-center gap-1.5">
                                     <input 
                                         type="number" 
                                         min="0" 
                                         className="w-16 border border-slate-300 rounded p-1 text-center outline-none focus:border-slate-500" 
                                         value={product.stock !== undefined ? product.stock : 0} 
                                         onChange={(e) => handleStockChange(product._id, parseInt(e.target.value) || 0)} 
                                     />
                                     <button 
                                         onClick={() => 
                                             toast.promise(handleUpdateStock(product._id, product.stock !== undefined ? product.stock : 0), {
                                                 loading: "Updating Stock...",
                                                 success: "Stock level updated",
                                                 error: "Failed to update stock",
                                             })
                                         } 
                                         className="bg-slate-700 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded transition active:scale-95 cursor-pointer font-medium"
                                     >
                                         Save
                                     </button>
                                 </div>
                             </td>
                             <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={product.inStock}
                                            onChange={() =>
                                                toast.promise(toggleStock(product._id), {
                                                    loading: "Updating...",
                                                    success: "Stock updated",
                                                    error: "Failed to update stock",
                                                })
                                            }
                                        />
                                        <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                                        <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                    </label>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Delete this product?")) {
                                                deleteProduct(product._id);
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                        title="Delete Product"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}