'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {
    const currency = '$';
    const [ratingModal, setRatingModal] = useState(null);
    const { ratings } = useSelector(state => state.rating);

    const isDelivered = order.status?.toUpperCase() === 'DELIVERED';

    const getItemRating = (item) => {
        const orderIds = [order._id, order.id].filter(Boolean).map(String);
        const itemProduct = item.product || {};
        const productIds = Array.from(new Set([
            itemProduct._id,
            itemProduct.id,
            item.productId,
            item._id,
            typeof item.product === 'string' ? item.product : null
        ].filter(Boolean).map(String)));

        return ratings.find(rating =>
            orderIds.includes(String(rating.orderId)) && productIds.includes(String(rating.productId))
        );
    };

    const handleRateClick = (item) => {
        const productId = item.product?._id || item.product?.id || item.productId || (typeof item.product === 'string' ? item.product : '');
        const orderId = order._id || order.id;
        setRatingModal({ orderId, productId });
    };

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {(order.orderItems || []).map((item, index) => {
                            const existingRating = getItemRating(item);
                            return (
                                <div key={item._id || item.id || index} className="flex items-center gap-4">
                                    <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                        <img
                                            className="h-14 w-auto"
                                            src={item.product?.images?.[0]?.url || item.product?.images?.[0] || item.images?.[0]?.url || item.images?.[0] || ''}
                                            alt="product_img"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center text-sm">
                                        <p className="font-medium text-slate-600 text-base">{item.product?.name || item.name || ''}</p>
                                        <p>{currency}{item.price} Qty : {item.quantity} </p>
                                        <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                        <div>
                                            {existingRating ? (
                                                <Rating value={existingRating.rating} />
                                            ) : (
                                                <button
                                                    onClick={() => handleRateClick(item)}
                                                    className="text-green-500 hover:bg-green-50 px-2 py-1 rounded transition cursor-pointer text-sm font-medium"
                                                >
                                                    Rate Product
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address?.name}, {order.address?.street},</p>
                    <p>{order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country},</p>
                    <p>{order.address?.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${isDelivered
                            ? 'text-green-500 bg-green-100'
                            : (order.status?.toUpperCase() === 'ORDER_PLACED' || order.status?.toUpperCase() === 'CONFIRMED' || order.status?.toUpperCase() === 'PROCESSING')
                                ? 'text-yellow-500 bg-yellow-100'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status ? order.status.split('_').join(' ').toLowerCase() : ''}
                    </div>
                </td>
            </tr>
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address?.name}, {order.address?.street}</p>
                    <p>{order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country}</p>
                    <p>{order.address?.phone}</p>
                    <br />
                    <div className="flex items-center">
                        <span className='text-center mx-auto px-6 py-1.5 rounded bg-green-100 text-green-700' >
                            {order.status ? order.status.replace(/_/g, ' ').toLowerCase() : ''}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
            {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
        </>
    )
}

export default OrderItem