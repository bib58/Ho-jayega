"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Menu, Search, ShoppingCart, X, StoreIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Show, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Package } from "lucide-react";
import './index.css';

const Navbar = () => {
    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const cartTotal = useSelector((state: any) => state.cart.total);
    const { has, isLoaded } = useAuth();
    if (!isLoaded) return null


    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/shop?search=${encodeURIComponent(search)}`);
        setIsMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-black">
            <div className="max-w-300 mx-auto py-2 px-5">
                <div className="flex justify-between items-center">
                    <Link href="/" className="relative text-3xl sm:text-4xl font-semibold text-slate-600">
                        <span className="text-green-600">Cart</span>hub
                        <span className="text-green-600 text-4xl sm:text-5xl leading-none">.</span>
                        {has({ plan: 'plus' }) && <p className="absolute text-xs font-semibold top-0 -right-10 px-2.5 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">plus</p>}
                    </Link>
                    <div className="flex items-center gap-6 text-white text-md desktop-menu">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/create-store">Create Store</Link>
                        <Link href="/admin">Admin Dashboard</Link>
                        <form onSubmit={handleSearch} className="flex items-center w-64 text-sm gap-2 bg-slate-100 px-4 py-2 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent text-black outline-none placeholder-gray-800" type="text" placeholder="Search products" value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} required />
                        </form>
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartTotal || 0}</span>
                        </Link>
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full cursor-pointer">Login</button>
                            </SignInButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action label="My Orders" labelIcon={<Package size={16} />} onClick={() => router.push("/orders")} />
                                </UserButton.MenuItems>
                                <UserButton.MenuItems>
                                    <UserButton.Action label="Create Store" labelIcon={<StoreIcon size={16} />} onClick={() => router.push("/create-store")} />
                                </UserButton.MenuItems>
                            </UserButton>
                        </Show>
                    </div>
                    <div className="mobile-header">
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full cursor-pointer">Login</button>
                            </SignInButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action
                                        label="My Orders"
                                        labelIcon={<Package size={16} />}
                                        onClick={() => router.push("/orders")}
                                    />
                                    <UserButton.Action
                                        label="Create Store"
                                        labelIcon={<StoreIcon size={16} />}
                                        onClick={() => router.push("/create-store")}
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        </Show>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-btn">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="mobile-menu">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link href="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                        <Link href="/create-store" onClick={() => setIsMenuOpen(false)}>Create Store</Link>
                        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                        <form onSubmit={handleSearch} className="flex items-center w-[90%] text-sm gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full text-black bg-transparent outline-none placeholder-gray-800" type="text" placeholder="Search products" value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartTotal || 0}</span>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
