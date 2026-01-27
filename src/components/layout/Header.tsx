'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from "@/lib/toast";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());
    const { currentUser: emailUser, logout: emailLogout } = useEmailAuth();

    const handleLogout = async () => {
        try {
            emailLogout();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'Menu' },
        { href: '/cart', label: 'Cart' },
        { href: '/admin', label: 'Admin' },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg'
                : 'bg-white'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <div className="relative w-20 h-20 transform transition-transform group-hover:scale-110">
                            <Image
                                src="/logo.png"
                                alt="TFC Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-700 hover:text-primary font-medium transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Icon */}
                        <Link
                            href="/?search=true"
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Search className="w-5 h-5 text-gray-700" />
                        </Link>

                        {/* Cart Icon */}
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            {mounted && totalItems > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in"
                                >
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Auth Section */}
                        {emailUser ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/profile"
                                    className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">
                                        {emailUser.name}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-medium transition-colors"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden border-t border-gray-200"
                        >
                            <div className="py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                
                                {/* Mobile Auth */}
                                {emailUser ? (
                                    <div className="px-4 py-3 border-t border-gray-200">
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors mb-3"
                                        >
                                            <User className="w-4 h-4" />
                                            <span className="text-sm">
                                                {emailUser.name} - View Profile
                                            </span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium border-t border-gray-200"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
