"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmailAuth } from '@/contexts/EmailAuthContext';

export default function EmailProtectedRoute({ children }) {
    const router = useRouter();
    const { currentUser: emailUser, loading: emailLoading } = useEmailAuth();

    useEffect(() => {
        if (!emailLoading && !emailUser) {
            router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }
    }, [emailUser, emailLoading, router]);

    if (emailLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!emailUser) {
        return null;
    }

    return children;
}