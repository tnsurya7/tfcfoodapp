import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

// Generate random 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via EmailJS
export const sendOTPEmail = async (email, otp) => {
    try {
        const templateParams = {
            to_email: email,
            otp: otp,
            from_name: 'TFC Food Ordering'
        };

        const response = await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return { success: true, response };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

// OTP validation helpers - using sessionStorage for temporary data only
export const storeOTP = (email, otp) => {
    const otpData = {
        otp,
        timestamp: Date.now(),
        email
    };
    sessionStorage.setItem('tfc_otp_data', JSON.stringify(otpData));
};

export const validateOTP = (email, enteredOTP) => {
    try {
        const storedData = sessionStorage.getItem('tfc_otp_data');
        if (!storedData) {
            return { valid: false, error: 'No OTP found. Please request a new one.' };
        }

        const otpData = JSON.parse(storedData);
        
        // Check if OTP is for the same email
        if (otpData.email !== email) {
            return { valid: false, error: 'OTP mismatch. Please request a new one.' };
        }

        // Check if OTP has expired (5 minutes = 300000 ms)
        const currentTime = Date.now();
        const otpAge = currentTime - otpData.timestamp;
        if (otpAge > 300000) {
            sessionStorage.removeItem('tfc_otp_data');
            return { valid: false, error: 'OTP has expired. Please request a new one.' };
        }

        // Check if OTP matches
        if (otpData.otp === enteredOTP) {
            sessionStorage.removeItem('tfc_otp_data');
            return { valid: true };
        } else {
            return { valid: false, error: 'Invalid OTP. Please check and try again.' };
        }
    } catch (error) {
        return { valid: false, error: 'Error validating OTP. Please try again.' };
    }
};

export const canRequestNewOTP = () => {
    try {
        const lastRequestTime = sessionStorage.getItem('tfc_last_otp_request');
        if (!lastRequestTime) return true;

        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(lastRequestTime);
        
        // 30 seconds = 30000 ms
        return timeDiff > 30000;
    } catch (error) {
        return true;
    }
};

export const setOTPRequestTime = () => {
    sessionStorage.setItem('tfc_last_otp_request', Date.now().toString());
};