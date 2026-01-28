'use client';

import { useEffect, useState } from 'react';
import { checkMigrationNeeded, autoMigrateIfNeeded } from '@/lib/dataMigration';
import toast from '@/lib/toast';

export const useMigration = (autoMigrate: boolean = false) => {
    const [migrationNeeded, setMigrationNeeded] = useState(false);
    const [migrationChecked, setMigrationChecked] = useState(false);
    const [migrationInProgress, setMigrationInProgress] = useState(false);

    useEffect(() => {
        const checkMigration = async () => {
            try {
                const needed = checkMigrationNeeded();
                setMigrationNeeded(needed);
                setMigrationChecked(true);

                if (needed && autoMigrate && !migrationInProgress) {
                    console.log('🔄 Auto-migration enabled, starting migration...');
                    setMigrationInProgress(true);
                    
                    try {
                        await autoMigrateIfNeeded();
                        // Recheck after migration
                        setMigrationNeeded(checkMigrationNeeded());
                    } catch (error) {
                        console.error('Auto-migration failed:', error);
                    } finally {
                        setMigrationInProgress(false);
                    }
                } else if (needed && !autoMigrate) {
                    // Show notification about available migration
                    setTimeout(() => {
                        toast.info(
                            'localStorage data detected! Visit Admin Dashboard → Migration to transfer data to Firebase.',
                            { duration: 8000 }
                        );
                    }, 3000);
                }
            } catch (error) {
                console.error('Migration check failed:', error);
            }
        };

        // Only check once when the hook is first used
        if (!migrationChecked) {
            checkMigration();
        }
    }, [autoMigrate, migrationChecked, migrationInProgress]);

    return {
        migrationNeeded,
        migrationChecked,
        migrationInProgress,
        checkMigration: () => {
            const needed = checkMigrationNeeded();
            setMigrationNeeded(needed);
            return needed;
        }
    };
};