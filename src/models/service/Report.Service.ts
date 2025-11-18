import { Injectable } from '@nestjs/common';
import { ExpenseService } from './Expense.Service';
import { IncomeService } from './Income.Service';

@Injectable()
export class ReportService {
    constructor(
        private expenseService: ExpenseService,
        private incomeService: IncomeService,
    ) { }

    async getBalance(userId: number) {
        const totalIncome = await this.incomeService.getTotalIncome(userId);
        const totalExpense = await this.expenseService.getTotalExpenses(userId);

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        };
    }

    async generateReport(userId: number, period: 'week' | 'month') {
        const now = new Date();
        let startDate: Date;

        if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const totalIncome = await this.incomeService.getTotalIncome(
            userId,
            startDate,
            now,
        );
        const totalExpense = await this.expenseService.getTotalExpenses(
            userId,
            startDate,
            now,
        );
        const expensesByCategory =
            await this.expenseService.getExpensesByCategory(userId, startDate, now);

        const periodName = period === 'week' ? 'Haftalik' : 'Oylik';

        let report = `📊 ${periodName} Hisobot\n\n`;
        report += `💰 Jami daromad: ${totalIncome.toLocaleString()} so'm\n`;
        report += `💸 Jami xarajat: ${totalExpense.toLocaleString()} so'm\n`;
        report += `📊 Sof balans: ${(totalIncome - totalExpense).toLocaleString()} so'm\n\n`;

        if (expensesByCategory.length > 0) {
            report += `📂 Xarajatlar kategoriyalar bo'yicha:\n\n`;
            expensesByCategory.forEach((item) => {
                const percentage = totalExpense > 0
                    ? ((item.total / totalExpense) * 100).toFixed(1)
                    : '0';
                report += `• ${item.category}: ${item.total.toLocaleString()} so'm (${percentage}%)\n`;
            });
        }

        return report;
    }
}