'use client';

import { useMigration } from '@/hooks/useMigration';

export default function MigrationChecker() {
    // Enable auto-migration on app startup
    useMigration(true);
    
    // This component doesn't render anything, it just runs the migration check
    return null;
}