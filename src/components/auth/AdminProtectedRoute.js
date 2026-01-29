"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
    const router = useRouter();
    const { currentAdmin, loading } = useAdminAuth();

    useEffect(() => {
        if (!loading && !currentAdmin) {
            router.push('/admin');
        }
    }, [currentAdmin, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!currentAdmin) {
        return null;
    }

    return children;
}