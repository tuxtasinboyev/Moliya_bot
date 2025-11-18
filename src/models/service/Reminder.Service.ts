import { Injectable } from '@nestjs/common';
import { Context } from 'grammy';
import { ExpenseService } from './Expense.Service';
import { DatabaseService } from 'src/common/config/database/database.service';

@Injectable()
export class ReminderService {
    constructor(
        private prisma: DatabaseService,
        private expenseService: ExpenseService,
    ) { }

    async setExpenseLimit(userId: number, limit: number) {
        // Oldingi limitni o'chirish
        await this.prisma.reminder.deleteMany({
            where: {
                userId,
                type: 'EXPENSE_LIMIT',
            },
        });

        // Yangi limit yaratish
        return await this.prisma.reminder.create({
            data: {
                userId,
                type: 'EXPENSE_LIMIT',
                limit,
                message: `Sizning xarajat limitingiz: ${limit.toLocaleString()} so'm`,
            },
        });
    }

    async checkExpenseLimitBeforeAdding(
        userId: number,
        newExpenseAmount: number,
        ctx: Context
    ): Promise<boolean> {
        // Foydalanuvchining limitini olish (reminder jadvalidan)
        const reminder = await this.getExpenseLimit(userId);

        if (!reminder || !reminder.limit) {
            // Limit belgilanmagan bo'lsa, xarajat qo'shishga ruxsat
            return true;
        }

        // Joriy oydagi jami xarajatni hisoblash
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalExpense = await this.expenseService.getTotalExpenses(
            userId,
            startOfMonth,
            now,
        );

        const newTotal = totalExpense + newExpenseAmount;

        // Limitdan oshib ketishini tekshirish
        if (newTotal > reminder.limit) {
            const remaining = reminder.limit - totalExpense;
            const overLimit = newTotal - reminder.limit;

            await ctx.reply(
                `⚠️ DIQQAT! Limit oshib ketadi!\n\n` +
                `💰 Limitingiz: ${reminder.limit.toLocaleString()} so'm\n` +
                `💸 Joriy xarajat: ${totalExpense.toLocaleString()} so'm\n` +
                `➕ Yangi xarajat: ${newExpenseAmount.toLocaleString()} so'm\n` +
                `━━━━━━━━━━━━━━━\n` +
                `📊 Jami bo'ladi: ${newTotal.toLocaleString()} so'm\n` +
                `❌ Limitdan oshiq: ${overLimit.toLocaleString()} so'm\n\n` +
                `✋ Qolgan limit: ${remaining.toLocaleString()} so'm\n\n` +
                `🚫 Xarajat qo'shilmadi!`
            );

            return false; // Xarajat qo'shishga ruxsat yo'q
        }

        return true; // Xarajat qo'shishga ruxsat
    }

    async getExpenseLimit(userId: number) {
        return await this.prisma.reminder.findFirst({
            where: {
                userId,
                type: 'EXPENSE_LIMIT',
            },
        });
    }

    async checkExpenseLimit(userId: number, ctx: Context) {
        const reminder = await this.getExpenseLimit(userId);
        if (!reminder || !reminder.limit) return;

        // Joriy oyning boshidan boshlab xarajatlarni hisoblash
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalExpense = await this.expenseService.getTotalExpenses(
            userId,
            startOfMonth,
            now,
        );

        // Limitdan oshib ketganmi tekshirish
        if (totalExpense >= reminder.limit) {
            const percentage = ((totalExpense / reminder.limit) * 100).toFixed(1);
            const overLimit = totalExpense - reminder.limit;
            await ctx.reply(
                `⚠️ DIQQAT!\n\n` +
                `Sizning xarajatingiz limitdan oshib ketdi!\n\n` +
                `💸 Joriy xarajat: ${totalExpense.toLocaleString()} so'm\n` +
                `⚠️ Belgilangan limit: ${reminder.limit.toLocaleString()} so'm\n` +
                `❌ Limitdan oshiq: ${overLimit.toLocaleString()} so'm\n` +
                `📊 Limit: ${percentage}%`,
            );
        } else if (totalExpense >= reminder.limit * 0.8) {
            // 80% dan oshsa ogohlantirish
            const remaining = reminder.limit - totalExpense;
            const percentage = ((totalExpense / reminder.limit) * 100).toFixed(1);
            await ctx.reply(
                `⚠️ Ogohlantirish!\n\n` +
                `Siz limitingizning 80% dan ko'prog'ini sarfladingiz.\n\n` +
                `💸 Joriy xarajat: ${totalExpense.toLocaleString()} so'm\n` +
                `⚠️ Limit: ${reminder.limit.toLocaleString()} so'm\n` +
                `📊 Foiz: ${percentage}%\n` +
                `✅ Qolgan: ${remaining.toLocaleString()} so'm`,
            );
        }
    }
}