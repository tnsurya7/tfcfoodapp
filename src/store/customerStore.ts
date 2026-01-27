import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
    createdAt: string;
    lastLogin: string;
    totalOrders: number;
    totalSpent: number;
}

interface CustomerStore {
    customers: Customer[];
    addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'lastLogin' | 'totalOrders' | 'totalSpent'>) => void;
    updateCustomer: (id: string, customer: Partial<Customer>) => void;
    getCustomerByEmail: (email: string) => Customer | undefined;
    updateCustomerStats: (email: string, orderAmount: number) => void;
    getTotalCustomers: () => number;
}

export const useCustomerStore = create<CustomerStore>()(
    persist(
        (set, get) => ({
            customers: [],
            
            addCustomer: (customerData) => {
                const existingCustomer = get().customers.find(c => c.email === customerData.email);
                
                if (!existingCustomer) {
                    const newCustomer: Customer = {
                        ...customerData,
                        id: Date.now().toString(),
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        totalOrders: 0,
                        totalSpent: 0,
                    };
                    
                    set((state) => ({
                        customers: [...state.customers, newCustomer],
                    }));
                } else {
                    // Update last login
                    set((state) => ({
                        customers: state.customers.map(customer =>
                            customer.email === customerData.email
                                ? { ...customer, lastLogin: new Date().toISOString(), name: customerData.name, phone: customerData.phone }
                                : customer
                        ),
                    }));
                }
            },
            
            updateCustomer: (id, updatedCustomer) => {
                set((state) => ({
                    customers: state.customers.map((customer) =>
                        customer.id === id ? { ...customer, ...updatedCustomer } : customer
                    ),
                }));
            },
            
            getCustomerByEmail: (email) => {
                return get().customers.find((customer) => customer.email === email);
            },
            
            updateCustomerStats: (email, orderAmount) => {
                set((state) => ({
                    customers: state.customers.map((customer) =>
                        customer.email === email
                            ? {
                                ...customer,
                                totalOrders: customer.totalOrders + 1,
                                totalSpent: customer.totalSpent + orderAmount,
                                lastLogin: new Date().toISOString(),
                            }
                            : customer
                    ),
                }));
            },
            
            getTotalCustomers: () => {
                return get().customers.length;
            },
        }),
        {
            name: 'customer-storage',
        }
    )
);