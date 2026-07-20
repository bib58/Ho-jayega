'use client'
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../lib/features/productSlice";
import { fetchCart, uploadCart, clearCart } from "../lib/features/cartSlice";
import { fetchAddress } from "../lib/features/addressSlice";
import { fetchRatings } from "../lib/features/ratingSlice";
import { useAuth, useUser } from "@clerk/nextjs";

export default function PublicLayout({ children }) {
    const dispatch = useDispatch();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { cartItems, isCartLoaded } = useSelector((state) => state.cart);

    useEffect(() => {
        dispatch(fetchProducts({}));
    }, [])

    useEffect(() => {
        if (user) {
            dispatch(fetchCart({ getToken }));
            dispatch(fetchAddress({getToken}));
            dispatch(fetchRatings({ getToken }));
        } else {
            dispatch(clearCart());
        }
    }, [user])

    useEffect(() => {
        if (user && isCartLoaded) {
            dispatch(uploadCart({ getToken }));
        }
    }, [cartItems, isCartLoaded])

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}