import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { EmailAuthProvider } from "@/contexts/EmailAuthContext";

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
                    <Header />
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <Footer />
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
                        }}
                    />
                </EmailAuthProvider>
            </body>
        </html>
    );
}
