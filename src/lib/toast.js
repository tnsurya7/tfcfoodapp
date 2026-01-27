import toast from 'react-hot-toast';

// Premium success toast with enhanced effects
export const showSuccessToast = (message, options = {}) => {
    return toast.success(message, {
        duration: 4000,
        style: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
        },
        iconTheme: {
            primary: '#ffffff',
            secondary: '#10B981',
        },
        className: 'toast-success glow-success',
        ...options
    });
};

// Premium error toast with enhanced effects
export const showErrorToast = (message, options = {}) => {
    return toast.error(message, {
        duration: 5000,
        style: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.4), 0 10px 10px -5px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
        },
        iconTheme: {
            primary: '#ffffff',
            secondary: '#EF4444',
        },
        className: 'toast-error glow-error',
        ...options
    });
};

// Premium loading toast
export const showLoadingToast = (message, options = {}) => {
    return toast.loading(message, {
        style: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
        },
        iconTheme: {
            primary: '#ffffff',
            secondary: '#3B82F6',
        },
        className: 'toast-loading glow-info',
        ...options
    });
};

// Premium info toast
export const showInfoToast = (message, options = {}) => {
    return toast(message, {
        duration: 4000,
        style: {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.4), 0 10px 10px -5px rgba(139, 92, 246, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
        },
        icon: '💡',
        className: 'toast-info glow-info',
        ...options
    });
};

// Premium warning toast
export const showWarningToast = (message, options = {}) => {
    return toast(message, {
        duration: 4500,
        style: {
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.4), 0 10px 10px -5px rgba(245, 158, 11, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '400px',
            position: 'relative',
            overflow: 'hidden',
        },
        icon: '⚠️',
        className: 'toast-warning',
        ...options
    });
};

// Custom toast with action buttons
export const showActionToast = (message, actions, options = {}) => {
    return toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.4), 0 10px 10px -5px rgba(99, 102, 241, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                            {message}
                        </p>
                        <div className="mt-3 flex space-x-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick();
                                        toast.dismiss(t.id);
                                    }}
                                    className={`text-sm font-medium px-3 py-1 rounded ${action.style || 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 focus:outline-none"
                >
                    ✕
                </button>
            </div>
        </div>
    ), {
        duration: 6000,
        ...options
    });
};

// Export the original toast for backward compatibility
export { toast };

// Default export with all premium methods
export default {
    success: showSuccessToast,
    error: showErrorToast,
    loading: showLoadingToast,
    info: showInfoToast,
    warning: showWarningToast,
    action: showActionToast,
    dismiss: toast.dismiss,
    remove: toast.remove,
};