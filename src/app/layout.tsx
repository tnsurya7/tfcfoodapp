import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { EmailAuthProvider } from "@/contexts/EmailAuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import emailjs from "@emailjs/browser";

// Initialize EmailJS once at app startup
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY) {
    emailjs.init(process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY);
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TFC Food Ordering - Delicious Food Delivered Fast",
    description: "Order your favorite food online with TFC. Fast delivery, great taste!",
    manifest: "/manifest.json",
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#D32F2F',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <EmailAuthProvider>
                    <AdminAuthProvider>
                        <Header />
                        <main className="min-h-screen">
                            {children}
                        </main>
                        <Footer />
                    </AdminAuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'transparent',
                                boxShadow: 'none',
                                padding: 0,
                                margin: 0,
                            },
                            success: {
                                duration: 4000,
                                style: {
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    color: '#ffffff',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    maxWidth: '400px',
                                    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#10B981',
                                },
                            },
                            error: {
                                duration: 5000,
                                style: {
                                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                    color: '#ffffff',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    maxWidth: '400px',
                                    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#EF4444',
                                },
                            },
                            loading: {
                                style: {
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                    color: '#ffffff',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    maxWidth: '400px',
                                    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                },
                                iconTheme: {
                                    primary: '#ffffff',
                                    secondary: '#3B82F6',
                                },
                            },
                        }}
                    />
                </EmailAuthProvider>
            </body>
        </html>
    );
}
