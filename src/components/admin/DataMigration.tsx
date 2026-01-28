'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { migrateLocalStorageToFirebase, clearLocalStorageAfterMigration, checkMigrationNeeded } from '@/lib/dataMigration';
import toast from '@/lib/toast';

export default function DataMigration() {
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResults, setMigrationResults] = useState<any>(null);
    const [hasMigrationData, setHasMigrationData] = useState(checkMigrationNeeded());

    const handleMigration = async () => {
        setIsMigrating(true);
        try {
            const results = await migrateLocalStorageToFirebase();
            setMigrationResults(results.results || results);
            setHasMigrationData(checkMigrationNeeded()); // Refresh check
        } catch (error: any) {
            toast.error('Migration failed: ' + error.message);
        } finally {
            setIsMigrating(false);
        }
    };

    const handleClearLocalStorage = () => {
        clearLocalStorageAfterMigration();
        setHasMigrationData(false);
        setMigrationResults(null);
    };

    const checkForData = () => {
        setHasMigrationData(checkMigrationNeeded());
        if (checkMigrationNeeded()) {
            toast.success('localStorage data detected!');
        } else {
            toast.info('No localStorage data found to migrate');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Data Migration</h2>
                    <p className="text-gray-600 text-sm">
                        Migrate localStorage data to Firebase database
                    </p>
                </div>
            </div>

            {/* Migration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className={`w-5 h-5 ${hasMigrationData ? 'text-yellow-500' : 'text-green-500'}`} />
                        <span className="font-semibold">
                            {hasMigrationData ? 'Migration Needed' : 'No Migration Needed'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {hasMigrationData 
                            ? 'localStorage data detected' 
                            : 'All data is in Firebase'
                        }
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">Firebase Ready</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Database connection active
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className={`w-5 h-5 ${migrationResults ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="font-semibold">
                            {migrationResults ? 'Migration Complete' : 'Ready to Migrate'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {migrationResults ? 'Data successfully migrated' : 'Click migrate to start'}
                    </p>
                </div>
            </div>

            {/* Migration Results */}
            {migrationResults && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                >
                    <h3 className="font-semibold text-green-800 mb-3">Migration Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{migrationResults.foods}</div>
                            <div className="text-sm text-green-700">Foods</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{migrationResults.users}</div>
                            <div className="text-sm text-green-700">Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{migrationResults.cartItems}</div>
                            <div className="text-sm text-green-700">Cart Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{migrationResults.orders}</div>
                            <div className="text-sm text-green-700">Orders</div>
                        </div>
                    </div>
                    
                    {migrationResults.errors && migrationResults.errors.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <h4 className="font-semibold text-red-800 mb-2">Errors ({migrationResults.errors.length})</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                {migrationResults.errors.slice(0, 5).map((error: string, index: number) => (
                                    <li key={index}>• {error}</li>
                                ))}
                                {migrationResults.errors.length > 5 && (
                                    <li>• ... and {migrationResults.errors.length - 5} more errors</li>
                                )}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={checkForData}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <Database className="w-4 h-4" />
                    <span>Check for Data</span>
                </button>

                <button
                    onClick={handleMigration}
                    disabled={isMigrating || !hasMigrationData}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        hasMigrationData && !isMigrating
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <Upload className="w-4 h-4" />
                    <span>
                        {isMigrating ? 'Migrating...' : 'Migrate to Firebase'}
                    </span>
                </button>

                {migrationResults && (
                    <button
                        onClick={handleClearLocalStorage}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear localStorage</span>
                    </button>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Migration Instructions</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Click "Check for Data" to scan for localStorage data</li>
                    <li>2. Click "Migrate to Firebase" to transfer data to the database</li>
                    <li>3. Review migration results and check for any errors</li>
                    <li>4. Click "Clear localStorage" to remove old data (recommended)</li>
                    <li>5. Refresh the page to ensure all components use Firebase data</li>
                </ol>
            </div>
        </motion.div>
    );
}