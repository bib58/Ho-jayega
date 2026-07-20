'use client'
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

const StoreNavbar = () => {
    const { user } = useUser();

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-3xl sm:text-4xl font-semibold text-slate-600">
                <span className="text-green-600">Cart</span>hub<span className="text-green-600 text-4xl sm:text-5xl leading-none">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">store</p>
            </Link>
            <div className="flex items-center gap-3 font-semibold">
                <p>Hi, {user.firstName}</p>
                <UserButton />
            </div>
        </div>
    )
}

export default StoreNavbar;