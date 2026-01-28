"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Phone, User, Shield, ArrowRight, Clock, CheckCircle } from "lucide-react";
import toast from "@/lib/toast";
import { generateOTP, sendOTPEmail, storeOTP, validateOTP, canRequestNewOTP, setOTPRequestTime } from "@/lib/emailService";
import { saveUser, generateUserId } from "@/lib/firebaseHelpers";
import { useEmailAuth } from "@/contexts/EmailAuthContext";

function EmailLoginContent() {
    const [step, setStep] = useState(1); // 1: User Details, 2: OTP Verification
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        otp: ""
    });
    const [generatedOtp, setGeneratedOtp] = useState(""); // Store generated OTP
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Check if user exists when form data changes
    useEffect(() => {
        const checkUser = async () => {
            if (formData.email) {
                const exists = await checkExistingUser();
                setIsExistingUser(exists);
            }
        };
        checkUser();
    }, [formData.email]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login: emailLogin } = useEmailAuth();
    
    const redirectTo = searchParams.get('redirect') || '/';

    // Check if user is already logged in
    useEffect(() => {
        const forceLogin = searchParams.get('force');
        if (!forceLogin) {
            const userEmail = sessionStorage.getItem('tfc_user_email');
            if (userEmail) {
                // User is already logged in, redirect them
                if (redirectTo === '/checkout') {
                    router.push('/checkout');
                } else {
                    router.push(redirectTo);
                }
            }
        }
    }, [router, redirectTo, searchParams]);

    // Countdown timer for OTP request cooldown
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Please enter your full name");
            return false;
        }
        if (!formData.phone.trim() || formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const checkExistingUser = async () => {
        try {
            const result = await getUser(formData.email);
            return result.success;
        } catch (error) {
            return false;
        }
    };

    // Remove saveRegisteredUser function as we're using Firebase only

    const loginDirectly = async () => {
        const userData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email
        };
        
        // Use EmailAuthContext login method
        await emailLogin(userData);
        
        toast.success("Welcome back! Logging you in...");
        
        setTimeout(() => {
            if (redirectTo === '/checkout') {
                window.location.href = '/checkout';
            } else {
                window.location.href = redirectTo;
            }
        }, 1000);
    };

    const sendOTP = async () => {
        if (!validateForm()) return;

        // Check if user is already registered in Firebase
        if (await checkExistingUser()) {
            await loginDirectly();
            return;
        }

        if (!canRequestNewOTP()) {
            toast.warning("Please wait 30 seconds before requesting a new OTP");
            return;
        }

        setLoading(true);
        
        try {
            // Generate OTP
            const otp = generateOTP();
            console.log("Generated OTP:", otp); // Debug log
            
            // Store generated OTP in state
            setGeneratedOtp(otp);
            
            // Send OTP via EmailJS
            const result = await sendOTPEmail(formData.email, otp);
            
            if (result.success) {
                // Store OTP locally as backup
                storeOTP(formData.email, otp);
                setOTPRequestTime();
                
                setStep(2);
                setOtpSent(true);
                setCountdown(30);
                toast.success("OTP sent to your email successfully!");
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error("Failed to send OTP. Please check your email and try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!formData.otp.trim()) {
            toast.error("Please enter the OTP");
            return;
        }

        if (formData.otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);

        // Simple string comparison
        const enteredOtp = String(formData.otp).trim();
        const storedOtp = String(generatedOtp).trim();
        
        console.log("Entered OTP:", enteredOtp); // Debug log
        console.log("Generated OTP:", storedOtp); // Debug log
        
        if (enteredOtp === storedOtp) {
            // Save user data using EmailAuthContext
            const userData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email
            };
            
            // Use EmailAuthContext login method
            await emailLogin(userData);
            
            toast.success("Login successful! Redirecting...");
            setLoading(false);
            
            // Redirect after short delay
            setTimeout(() => {
                if (redirectTo === '/checkout') {
                    window.location.href = '/checkout';
                } else {
                    window.location.href = redirectTo;
                }
            }, 1000);
        } else {
            setLoading(false);
            toast.error("Invalid OTP. Please check and try again.");
        }
    };

    const resendOTP = async () => {
        if (!canRequestNewOTP()) {
            toast.error(`Please wait ${countdown} seconds before requesting a new OTP`);
            return;
        }
        
        // Clear previous OTP
        setGeneratedOtp("");
        setFormData(prev => ({ ...prev, otp: "" }));
        
        await sendOTP();
    };

    const goBack = () => {
        setStep(1);
        setOtpSent(false);
        setGeneratedOtp("");
        setFormData(prev => ({ ...prev, otp: "" }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step === 1 ? (
                            <Mail className="w-8 h-8 text-primary" />
                        ) : (
                            <Shield className="w-8 h-8 text-primary" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">
                        {step === 1 ? "Login" : "Verify OTP"}
                    </h1>
                    <p className="text-gray-600">
                        {step === 1 
                            ? "Enter your details to receive OTP via email"
                            : `We've sent a 6-digit OTP to ${formData.email}`
                        }
                    </p>
                </div>

                {/* Step 1: User Details Form */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="input-field pl-11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData(prev => ({ ...prev, phone: value }));
                                        }}
                                        placeholder="Enter 10-digit mobile number"
                                        className="input-field pl-11 rounded-l-none"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email address"
                                    className="input-field pl-11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Send OTP Button */}
                        <button
                            onClick={sendOTP}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>
                                        {isExistingUser ? "Logging in..." : "Sending OTP..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>
                                        {isExistingUser ? "Login (No OTP Required)" : "Send OTP"}
                                    </span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Returning user indicator */}
                        {isExistingUser && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-800">
                                        Welcome back! No OTP required for returning users.
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        {/* User Info Display */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">OTP Sent Successfully</span>
                            </div>
                            <div className="text-sm text-green-700 space-y-1">
                                <p><strong>Name:</strong> {formData.name}</p>
                                <p><strong>Phone:</strong> +91{formData.phone}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Enter 6-Digit OTP *
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    placeholder="Enter OTP"
                                    className="input-field pl-11 text-center text-lg font-mono tracking-widest"
                                    maxLength="6"
                                    required
                                />
                            </div>
                        </div>

                        {/* OTP Expiry Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800">
                                    OTP expires in 5 minutes
                                </span>
                            </div>
                        </div>

                        {/* Verify OTP Button */}
                        <button
                            onClick={verifyOTP}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Verify OTP</span>
                                    <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Resend OTP */}
                        <div className="text-center space-y-3">
                            <button
                                onClick={resendOTP}
                                disabled={countdown > 0}
                                className="text-primary hover:text-primary-dark font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                            </button>
                            
                            <button
                                onClick={goBack}
                                className="block w-full text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Change Details
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Redirect Info */}
                {redirectTo !== '/checkout' && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            You'll be redirected after successful login
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function EmailLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-red-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-white">Loading...</p>
                </div>
            </div>
        }>
            <EmailLoginContent />
        </Suspense>
    );
}