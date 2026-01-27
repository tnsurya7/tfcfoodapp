// Utility functions for the app

export const formatPrice = (price: number): string => {
    return `₹₹{item.price.toFixed(0)}`;
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};
