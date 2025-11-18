// sessions.ts
export interface IncomeSession { step?: 'source' | 'amount'; source?: string; amount?: number }
export interface ExpenseSession { step?: 'name' | 'amount' | 'category'; name?: string; amount?: number; category?: string }

export const incomeSessions: Record<number, IncomeSession> = {};
export const expenseSessions: Record<number, ExpenseSession> = {};
