"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-delfood-dark text-white border-t border-white/5 mt-auto pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="inline-block group">
                            <span className="text-delfood-yellow font-black text-3xl tracking-tighter hover:text-white transition-colors font-['Cinzel',serif]">
                                AHAR
                            </span>
                        </Link>
                        <p className="mt-6 text-textMuted text-lg font-medium leading-relaxed">
                            Taste the future of food delivery. Fast, fresh, and curated for you.
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-delfood-yellow hover:bg-white/10 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase mb-8">Company</h3>
                        <ul className="space-y-4 text-white/60">
                            {['About Us', 'Careers', 'Blog', 'Press'].map(item => (
                                <li key={item}>
                                    <Link href="/" className="hover:text-delfood-yellow transition-colors font-medium">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase mb-8">Partner</h3>
                        <ul className="space-y-4 text-white/60">
                            <li><Link href="/restaurant/signup" className="hover:text-delfood-yellow transition-colors font-medium text-delfood-yellow">For Restaurants</Link></li>
                            <li><Link href="/" className="hover:text-delfood-yellow transition-colors font-medium">For Drivers</Link></li>
                            <li><Link href="/" className="hover:text-delfood-yellow transition-colors font-medium">Corporate Accounts</Link></li>
                        </ul>
                    </div>

                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                            Get Updates <Mail className="w-4 h-4 text-delfood-yellow" />
                        </h3>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">Be the first to know about new restaurants and exclusive offers.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full bg-delfood-dark/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-delfood-yellow transition-colors pr-12 text-white"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-delfood-yellow text-delfood-dark px-3 rounded-lg font-black text-xs hover:scale-105 transition-transform">GO</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-textMuted font-medium">
                        &copy; {new Date().getFullYear()} AHAR Inc. Built for foodies.
                    </p>
                    <div className="flex gap-8 text-xs font-bold text-textMuted tracking-widest uppercase">
                        <Link href="/" className="hover:text-primary">Privacy</Link>
                        <Link href="/" className="hover:text-primary">Terms</Link>
                        <Link href="/support" className="hover:text-primary">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
