'use client'
import PageTitle from "../../components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "../../components/OrderItem";
import Loading from "../../components/Loading";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function Orders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.orders) {
                const formattedOrders = data.orders.map(order => ({
                    ...order,
                    orderItems: (order.orderItems || []).filter(Boolean).map(item => {
                        const imageUrl = item.product?.images?.[0]?.url || item.product?.images?.[0] || item.images?.[0]?.url || item.images?.[0] || '';
                        const productId = item.product?._id || item.product?.id || item.productId || item._id;
                        return {
                            ...item,
                            productId: productId,
                            product: item.product ? {
                                ...item.product,
                                name: item.product?.name || item.name || '',
                                _id: item.product?._id || item.product?.id || productId || '',
                                id: item.product?.id || item.product?._id || productId || '',
                                images: imageUrl ? [imageUrl] : (item.product?.images || [])
                            } : {
                                name: item.name || '',
                                _id: productId || '',
                                id: productId || '',
                                images: imageUrl ? [imageUrl] : []
                            }
                        };
                    })
                }));
                setOrders(formattedOrders);
            } else {
                console.error(data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn) {
                fetchOrders();
            } else {
                setLoading(false);
            }
        }
    }, [isLoaded, isSignedIn]);

    if (!isLoaded || loading) {
        return <Loading />;
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-4">
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-800">Please sign in to view your orders</h1>
                <p className="text-slate-600 max-w-md">You need to be signed in to see your order history and manage your purchases.</p>
                <SignInButton mode="modal">
                    <button className="px-8 py-3 bg-green-600 hover:bg-green-700 transition text-white font-medium rounded-full cursor-pointer shadow-md text-sm mt-2">
                        Sign In / Register
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order._id || order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}