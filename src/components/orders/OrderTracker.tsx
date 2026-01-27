'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, 
    Package, 
    Truck, 
    CheckCircle, 
    X,
    AlertCircle
} from 'lucide-react';

interface OrderTrackerProps {
    status: string;
    createdAt: string;
    statusHistory?: Record<string, string>;
}

export default function OrderTracker({ status, createdAt, statusHistory = {} }: OrderTrackerProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            key: 'pending',
            label: 'Order Placed',
            icon: Clock,
            description: 'Your order has been received'
        },
        {
            key: 'preparing',
            label: 'Preparing',
            icon: Package,
            description: 'Your food is being prepared'
        },
        {
            key: 'out for delivery',
            label: 'Out for Delivery',
            icon: Truck,
            description: 'Your order is on the way'
        },
        {
            key: 'delivered',
            label: 'Delivered',
            icon: CheckCircle,
            description: 'Order delivered successfully'
        }
    ];

    useEffect(() => {
        const statusLower = status.toLowerCase();
        const stepIndex = steps.findIndex(step => step.key === statusLower);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
    }, [status]);

    const getStepStatus = (stepIndex: number) => {
        if (status.toLowerCase() === 'cancelled') {
            return stepIndex === 0 ? 'completed' : 'cancelled';
        }
        
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'current';
        return 'pending';
    };

    const getStepTime = (stepKey: string) => {
        if (stepKey === 'pending') {
            return new Date(createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        if (statusHistory[stepKey]) {
            return new Date(statusHistory[stepKey]).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        return '';
    };

    if (status.toLowerCase() === 'cancelled') {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-300">Order Cancelled</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            This order has been cancelled
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(index);
                const Icon = step.icon;
                const stepTime = getStepTime(step.key);

                return (
                    <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4"
                    >
                        {/* Step Icon */}
                        <div className="relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    stepStatus === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : stepStatus === 'current'
                                        ? 'bg-primary text-white animate-pulse'
                                        : stepStatus === 'cancelled'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                }`}
                            >
                                {stepStatus === 'completed' ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : stepStatus === 'cancelled' ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            
                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 transition-all duration-300 ${
                                        stepStatus === 'completed'
                                            ? 'bg-green-500'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                />
                            )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3
                                    className={`font-semibold transition-colors ${
                                        stepStatus === 'completed' || stepStatus === 'current'
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {step.label}
                                </h3>
                                {stepTime && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {stepTime}
                                    </span>
                                )}
                            </div>
                            <p
                                className={`text-sm transition-colors ${
                                    stepStatus === 'completed' || stepStatus === 'current'
                                        ? 'text-gray-600 dark:text-gray-300'
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {step.description}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}