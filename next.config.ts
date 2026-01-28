import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
    // Remove standalone output for now to fix deployment
    // output: 'standalone',
    
    // Image optimization for Vercel
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },
    
    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
    
    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    
    // Headers for better caching
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

export default withPWA(nextConfig);
