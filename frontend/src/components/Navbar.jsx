"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';
import { ShoppingCart, User, LogOut, Menu, Sun, Moon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { items } = useCartStore();
    const { theme, toggleTheme } = useThemeStore();

    const [isMounted, setIsMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/#hero' },
        { name: 'Recipes', href: '/#recipes' },
        { name: 'About', href: '/#about' },
        { name: 'News', href: '/#news' },
    ];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="bg-white border-b border-gray-100 z-50 fixed top-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center"
                    >
                        <Link href="/" className="flex-shrink-0 flex items-center group">
                            <span className="text-delfood-dark font-black text-3xl tracking-tighter group-hover:text-delfood-blue transition-colors font-['Cinzel',serif]">
                                AHAR
                            </span>
                        </Link>
                    </motion.div>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-black text-delfood-dark hover:text-delfood-blue transition-colors tracking-widest uppercase"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-100 mx-4" />

                    <div className="flex items-center space-x-6">
                        {isMounted && user?.role === 'admin' && (
                            <Link href="/admin/dashboard" className="text-sm font-black text-delfood-dark hover:text-delfood-blue transition-colors tracking-tight uppercase border-b-2 border-delfood-yellow">
                                Admin
                            </Link>
                        )}

                        {isMounted && user?.role === 'restaurant_owner' && (
                            <>
                                <Link href="/restaurant/dashboard" className="text-sm font-black text-gray-700 hover:text-delfood-blue transition-colors tracking-tight uppercase">
                                    Dashboard
                                </Link>
                                <Link href="/restaurant/orders" className="text-sm font-black text-gray-700 hover:text-delfood-blue transition-colors tracking-tight uppercase">
                                    Orders
                                </Link>
                            </>
                        )}

                        {isMounted && isAuthenticated && user?.role === 'customer' && (
                            <Link href="/orders" className="text-sm font-black text-delfood-dark hover:text-delfood-blue transition-colors tracking-tight uppercase">
                                My Orders
                            </Link>
                        )}
                    </div>

                    <div className="h-6 w-px bg-gray-100 mx-2" />

                    <div className="flex items-center space-x-4">
                        {isMounted && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl text-delfood-dark hover:text-delfood-blue hover:bg-gray-50 transition-all"
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </motion.button>
                        )}

                        <Link href="/cart" className="relative group p-2.5 rounded-xl hover:bg-gray-50 transition-all">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-delfood-blue transition-colors" />
                            </motion.div>
                            {isMounted && cartItemsCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1 bg-delfood-yellow text-delfood-dark text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-lg"
                                >
                                    {cartItemsCount}
                                </motion.span>
                            )}
                        </Link>

                        {isMounted && isAuthenticated ? (
                            <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                <Link href="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-delfood-blue/10 flex items-center justify-center border border-delfood-blue/20">
                                        <User className="w-4 h-4 text-delfood-blue" />
                                    </div>
                                    <span className="text-sm font-black text-gray-800 group-hover:text-delfood-blue">{user?.name}</span>
                                </Link>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={logout}
                                    className="p-2 rounded-xl text-gray-400 hover:text-error hover:bg-error/10 transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </motion.button>
                            </div>
                        ) : (
                            isMounted && (
                                <div className="flex items-center gap-2">
                                    <Link href="/login" className="text-sm font-black text-delfood-dark hover:text-delfood-blue px-4 py-2 transition-colors">
                                        Log in
                                    </Link>
                                    <Link href="/signup" className="bg-delfood-yellow text-delfood-dark font-black text-sm px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-wider">
                                        Sign Up
                                    </Link>
                                </div>
                            )
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        {isMounted && (
                            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-delfood-dark hover:text-delfood-blue">
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                        )}
                        <Link href="/cart" className="relative p-2.5 rounded-xl">
                            <ShoppingCart className="w-5 h-5 text-gray-700" />
                            {isMounted && cartItemsCount > 0 && (
                                <span className="absolute top-1 right-1 bg-delfood-yellow text-delfood-dark text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-700"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </motion.button>
                    </div>
                </div>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden py-6 border-t border-gray-100 flex flex-col space-y-4 bg-white rounded-b-2xl mt-2 shadow-2xl"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-black text-delfood-dark hover:text-delfood-blue px-4 uppercase tracking-wider"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 mx-4" />
                            {isMounted && user?.role === 'admin' && (
                                <Link href="/admin/dashboard" className="text-lg font-black text-delfood-dark hover:text-delfood-blue px-4">Admin Panel</Link>
                            )}
                            {isMounted && user?.role === 'restaurant_owner' && (
                                <>
                                    <Link href="/restaurant/dashboard" className="text-lg font-black text-delfood-dark hover:text-delfood-blue px-4">Dashboard</Link>
                                    <Link href="/restaurant/orders" className="text-lg font-black text-delfood-dark hover:text-delfood-blue px-4">Orders</Link>
                                </>
                            )}
                            {isMounted && isAuthenticated && user?.role === 'customer' && (
                                <Link href="/orders" className="text-lg font-black text-delfood-dark hover:text-delfood-blue px-4">My Orders</Link>
                            )}
                            {isMounted && isAuthenticated ? (
                                <div className="space-y-4 pt-4 border-t border-gray-100 px-4">
                                    <Link href="/profile" className="flex items-center gap-3 text-delfood-dark hover:text-delfood-blue">
                                        <div className="w-10 h-10 rounded-full bg-delfood-blue/10 flex items-center justify-center border border-delfood-blue/20">
                                            <User className="w-5 h-5 text-delfood-blue" />
                                        </div>
                                        <span className="font-bold text-lg">{user?.name}</span>
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-2 text-error font-black text-lg pt-2 uppercase tracking-wider">
                                        <LogOut className="w-5 h-5" />
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                isMounted && (
                                    <div className="flex flex-col gap-3 pt-2 px-4">
                                        <Link href="/login" className="text-center font-black text-delfood-dark py-3 bg-gray-50 rounded-xl border border-gray-100">Log in</Link>
                                        <Link href="/signup" className="text-center font-black text-delfood-dark py-3 bg-delfood-yellow rounded-xl shadow-lg">Sign Up</Link>
                                    </div>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
