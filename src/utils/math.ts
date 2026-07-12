import { Expense, Grail } from '../context/FinanceContext';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateProjectedBalance = (
    targetDate: Date,
    currentBalance: number,
    monthlyIncome: number,
    expenses: Expense[],
    priorGrailCosts: number
): {
    projectedBalance: number;
    totalIncome: number;
    totalExpenses: number;
} => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    if (target < today) {
        return { projectedBalance: currentBalance, totalIncome: 0, totalExpenses: 0 };
    }

    // Calculate months between now and target
    let monthsPassed = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    if (target.getDate() < today.getDate()) monthsPassed -= 1;
    if (monthsPassed < 0) monthsPassed = 0;

    const totalIncome = monthsPassed * monthlyIncome;

    // Calculate Expenses
    let totalExpenses = 0;
    expenses.forEach(exp => {
        let months = monthsPassed;
        if (months === 0) {
            const daysDiff = Math.floor((target.getTime() - today.getTime()) / MS_PER_DAY);
            if (daysDiff > 5) months = 1;
        }
        totalExpenses += (exp.amount * months);
    });

    const projectedBalance = currentBalance + totalIncome - totalExpenses - priorGrailCosts;

    return {
        projectedBalance,
        totalIncome,
        totalExpenses
    };
};

export const getRiskLevel = (projectedBalance: number, monthlyIncome: number): 'safe' | 'warning' | 'danger' => {
    if (projectedBalance < 0) return 'danger';
    if (projectedBalance < (monthlyIncome * 0.2)) return 'warning';
    return 'safe';
};

// Timeline

export interface TimelineEvent {
    id: string;
    date: Date;
    type: 'INCOME' | 'EXPENSE' | 'INSTALLMENT' | 'DROP';
    name: string;
    amount: number;
}

export const generateTimelineEvents = (
    currentBalance: number,
    monthlyIncome: number,
    expenses: Expense[],
    grails: Grail[],
    horizonMonths: number = 6
): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const horizonDate = new Date(today);
    horizonDate.setMonth(horizonDate.getMonth() + horizonMonths);

    // 1. Monthly income (if set)
    if (monthlyIncome > 0) {
        for (let i = 1; i <= horizonMonths; i++) {
            const payDate = new Date(today);
            payDate.setMonth(payDate.getMonth() + i);
            payDate.setDate(1); // Assume 1st of month
            events.push({
                id: `income-${payDate.getTime()}`,
                date: new Date(payDate),
                type: 'INCOME',
                name: 'MONTHLY INCOME',
                amount: monthlyIncome
            });
        }
    }

    // 2. Fixed expenses (monthly)
    for (let i = 1; i <= horizonMonths; i++) {
        const expenseDate = new Date(today);
        expenseDate.setMonth(expenseDate.getMonth() + i);
        expenseDate.setDate(1);

        expenses.forEach(exp => {
            if (exp.name.toUpperCase().startsWith('INSTALLMENT:')) return; // Ignore legacy expenses for installments
            events.push({
                id: `expense-${exp.id}-${expenseDate.getTime()}`,
                date: new Date(expenseDate),
                type: 'EXPENSE',
                name: exp.name,
                amount: -exp.amount
            });
        });
    }

    // 3. Installments for acquired grails
    grails.filter(g => g.status === 'ACQUIRED' && g.paymentType === 'INSTALLMENTS').forEach(g => {
        if (g.installmentStartDate && g.installmentMonths) {
            const monthlyPayment = g.price / g.installmentMonths;
            for (let i = 1; i < g.installmentMonths; i++) {
                const installmentDate = new Date(g.installmentStartDate);
                installmentDate.setMonth(installmentDate.getMonth() + i);

                if (installmentDate >= today && installmentDate <= horizonDate) {
                    events.push({
                        id: `installment-${g.id}-${i}`,
                        date: new Date(installmentDate),
                        type: 'INSTALLMENT',
                        name: `INSTALLMENT: ${g.name}`,
                        amount: -monthlyPayment
                    });
                }
            }
        }
    });

    // 4. Planned drops
    grails.filter(g => g.status === 'PLANNED').forEach(g => {
        if (g.date >= today && g.date <= horizonDate) {
            events.push({
                id: `drop-${g.id}`,
                date: new Date(g.date),
                type: 'DROP',
                name: `DROP: ${g.name}`,
                amount: -g.price
            });
        }
    });

    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    return events;
};
