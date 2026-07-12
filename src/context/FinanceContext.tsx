import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
    id: string;
    name: string;
    amount: number;
}

export type PaymentType = 'CASH' | 'INSTALLMENTS';

export interface IncomeEntry {
    id: string;
    amount: number;
    note: string;
    date: Date;
}

export interface Grail {
    id: string;
    name: string;
    price: number;
    date: Date;
    status: 'PLANNED' | 'ACQUIRED';
    paymentType?: PaymentType;
    installmentMonths?: number;
    installmentStartDate?: Date;
}

interface FinanceContextType {
    // Balance is computed, not settable
    currentBalance: number;

    // Monthly fixed income (0 = no fixed job)
    monthlyIncome: number;
    setMonthlyIncome: (val: number) => void;

    // Manual income deposits
    incomeEntries: IncomeEntry[];
    addIncome: (amount: number, note: string) => void;

    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    removeExpense: (id: string) => void;

    grails: Grail[];
    addGrail: (grail: Omit<Grail, 'id' | 'status'>) => void;
    removeGrail: (id: string) => void;
    markGrailAcquired: (id: string, paymentType: PaymentType, installmentMonths?: number, installmentStartDate?: Date) => void;

    isLoading: boolean;
    isInitialized: boolean;
    hasSeenTour: boolean;
    completeOnboarding: (initialBalance: number, monthlyIncome: number) => void;
    completeTour: () => void;
    selectedItemId: string | null;
    setSelectedItemId: (id: string | null) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = '@hype_drop_finance_state_v2';

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [grails, setGrails] = useState<Grail[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(false);

    // Computed balance: total deposits - total cash purchases - total first installment payments
    const currentBalance = (() => {
        const totalDeposits = incomeEntries.reduce((sum, e) => sum + e.amount, 0);

        let totalSpent = 0;
        grails.forEach(g => {
            if (g.status === 'ACQUIRED') {
                if (g.paymentType === 'CASH') {
                    totalSpent += g.price;
                } else if (g.paymentType === 'INSTALLMENTS' && g.installmentMonths) {
                    // Only the first installment is deducted from balance immediately
                    totalSpent += g.price / g.installmentMonths;
                }
            }
        });

        return totalDeposits - totalSpent;
    })();

    // Initial Load
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedValue) {
                    const parsed = JSON.parse(storedValue);
                    setMonthlyIncome(parsed.monthlyIncome || 0);
                    setExpenses(parsed.expenses || []);
                    setIncomeEntries((parsed.incomeEntries || []).map((e: any) => ({
                        ...e,
                        date: new Date(e.date),
                    })));

                    const parsedGrails = (parsed.grails || []).map((g: any) => ({
                        ...g,
                        date: new Date(g.date),
                        installmentStartDate: g.installmentStartDate ? new Date(g.installmentStartDate) : undefined,
                    }));
                    setGrails(parsedGrails);

                    setIsInitialized(parsed.isInitialized || false);
                    setHasSeenTour(parsed.hasSeenTour || false);
                } else {
                    // No stored value means first launch
                    setIsInitialized(false);
                    setHasSeenTour(false);
                }
            } catch (e) {
                console.error("Failed to load finance data", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadPersistedData();
    }, []);

    // Auto-Save
    useEffect(() => {
        if (isLoading) return;

        const saveState = async () => {
            try {
                const stateToSave = {
                    monthlyIncome,
                    incomeEntries,
                    expenses,
                    grails,
                    isInitialized,
                    hasSeenTour,
                };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            } catch (e) {
                console.error("Failed to save finance data", e);
            }
        };

        saveState();
    }, [monthlyIncome, incomeEntries, expenses, grails, isLoading]);

    const addIncome = (amount: number, note: string) => {
        setIncomeEntries(prev => [...prev, {
            id: Date.now().toString(),
            amount,
            note,
            date: new Date(),
        }]);
    };

    const completeOnboarding = (initialBalance: number, newMonthlyIncome: number) => {
        if (initialBalance > 0) {
            addIncome(initialBalance, 'STASH INIT');
        }
        setMonthlyIncome(newMonthlyIncome);
        setIsInitialized(true);
    };

    const completeTour = () => {
        setHasSeenTour(true);
    };

    const addExpense = (newExpense: Omit<Expense, 'id'>) => {
        setExpenses(prev => [...prev, { ...newExpense, id: Date.now().toString() }]);
    };

    const removeExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const addGrail = (newGrail: Omit<Grail, 'id' | 'status'>) => {
        setGrails(prev => [...prev, { ...newGrail, status: 'PLANNED', id: Date.now().toString() }]);
    };

    const removeGrail = (id: string) => {
        setGrails(prev => prev.filter(g => g.id !== id));
    };

    const markGrailAcquired = (
        id: string,
        paymentType: PaymentType,
        installmentMonths: number = 3,
        installmentStartDate?: Date
    ) => {
        const grail = grails.find(g => g.id === id);
        if (!grail) return;

        // Installments are tracked on the grail itself.
        // The timeline generates payment events from grail data — no separate expense needed.

        setGrails(prev => prev.map(g => g.id === id ? {
            ...g,
            status: 'ACQUIRED' as const,
            paymentType,
            installmentMonths: paymentType === 'INSTALLMENTS' ? installmentMonths : undefined,
            installmentStartDate: paymentType === 'INSTALLMENTS' ? (installmentStartDate || new Date()) : undefined,
        } : g));
    };

    return (
        <FinanceContext.Provider value={{
            currentBalance,
            monthlyIncome,
            setMonthlyIncome,
            incomeEntries,
            addIncome,
            expenses,
            addExpense,
            removeExpense,
            grails,
            addGrail,
            removeGrail,
            markGrailAcquired,
            isLoading,
            isInitialized,
            hasSeenTour,
            completeOnboarding,
            completeTour,
            selectedItemId,
            setSelectedItemId,
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
