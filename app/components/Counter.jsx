'use client'
import { addToCart, removeFromCart } from "../lib/features/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId }) => {

    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const product = products.find(p => p._id === productId || p.id === productId);
    const stock = product ? (product.stock !== undefined ? product.stock : 0) : Infinity;

    const dispatch = useDispatch();

    const addToCartHandler = () => {
        if (cartItems[productId] < stock) {
            dispatch(addToCart({ productId }))
        }
    }

    const removeFromCartHandler = () => {
        dispatch(removeFromCart({ productId }))
    }

    const isMaxStockReached = cartItems[productId] >= stock;

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[productId]}</p>
            <button 
                disabled={isMaxStockReached} 
                onClick={addToCartHandler} 
                className="p-1 select-none disabled:text-slate-300 disabled:cursor-not-allowed"
            >
                +
            </button>
        </div>
    )
}

export default Counter