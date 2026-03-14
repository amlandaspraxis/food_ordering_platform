"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const res = await api.post('/admin/login', {
                username: data.username,
                password: data.password,
            });

            const { token } = res.data;
            setAuth(
                { id: 'admin', name: 'Admin', email: 'admin@admin.com', role: 'admin' },
                token,
                ''
            );

            toast.success('Admin access granted');
            router.push('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-darkBg relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="card p-8 md:p-10 border-t-0 bg-cardBg/80 backdrop-blur-2xl relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ rotateY: 180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-12"
                        >
                            <Shield className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center"
                        >
                            <h1 className="text-3xl font-black text-textPrimary tracking-tighter mb-2">Central Authority</h1>
                            <p className="text-textMuted text-xs font-bold uppercase tracking-[0.2em]">Secure Infrastructure Portal</p>
                        </motion.div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="relative group">
                                <div className="absolute left-4 top-[3.1rem] text-textMuted group-focus-within:text-primary transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <Input
                                    label="System Username"
                                    type="text"
                                    placeholder="Enter username"
                                    className="pl-11"
                                    {...register('username', { required: 'Username required' })}
                                    error={errors.username?.message}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="relative group">
                                <div className="absolute left-4 top-[3.1rem] text-textMuted group-focus-within:text-secondary transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input
                                    label="Security Key"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-11"
                                    {...register('password', { required: 'Password required' })}
                                    error={errors.password?.message}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <Button
                                type="submit"
                                className="w-full py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all group"
                                isLoading={isLoading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Initialize Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </motion.div>
                    </form>

                </div>
            </motion.div>
        </div>
    );
}
