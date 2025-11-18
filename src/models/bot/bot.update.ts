import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/common/config/database/database.service';
import {
    getMainMenu,
    helpMatn
} from 'src/common/utils/helper';
import { handleContact } from 'src/common/utils/helperfunction/ handleContact';
import { handleCallbackQuery } from 'src/common/utils/helperfunction/handleCallbackQuery';
import { handleStart } from 'src/common/utils/helperfunction/handleStart';
import { handleTextMessage } from 'src/common/utils/helperfunction/handleTextMessage';
import { seedDefaultCategories } from 'src/common/utils/helperfunction/seed';
import { showBalance } from 'src/common/utils/helperfunction/showBalance';
import { startExpenseFlow } from 'src/common/utils/helperfunction/startExpenseFlow';
import { startIncomeFlow } from 'src/common/utils/helperfunction/startIncomeFlow';
import { startLimitFlow } from 'src/common/utils/helperfunction/startLimitFlow';
import { startReportFlow } from 'src/common/utils/helperfunction/startReportFlow';
import { ExpenseService } from '../service/Expense.Service';
import { IncomeService } from '../service/Income.Service';
import { ReminderService } from '../service/Reminder.Service';
import { ReportService } from '../service/Report.Service';
import { BotService } from './bot.service';
import { showAllExpenses } from 'src/common/utils/helperfunction/showAllExpenses';

interface UserSession {
    step?: string;
    data?: any;
}

@Injectable()
export class BotUpdate implements OnModuleInit {
    private sessions: Map<number, UserSession> = new Map();

    constructor(
        private botService: BotService,
        private prisma: DatabaseService,
        private expenseService: ExpenseService,
        private incomeService: IncomeService,
        private reportService: ReportService,
        private reminderService: ReminderService,
    ) { }

    async onModuleInit() {
        const bot = this.botService.getBot();

        // Default kategoriyalarni yaratish
        await seedDefaultCategories(this.prisma);

        // /start komandasi
        bot.command('start', async (ctx) => {
            await handleStart(ctx, this.prisma);
        });

        // /help komandasi
        bot.command('help', async (ctx) => {
            await ctx.reply(helpMatn, { reply_markup: getMainMenu() });
        });

        // /add_expense komandasi
        bot.command('add_expense', async (ctx) => {
            await startExpenseFlow(ctx, this.prisma, this.sessions);
        });

        // /add_income komandasi
        bot.command('add_income', async (ctx) => {
            await startIncomeFlow(ctx, this.prisma, this.sessions);
        });

        // /balance komandasi
        bot.command('balance', async (ctx) => {
            await showBalance(ctx, this.prisma, this.reportService);
        });

        // /report komandasi
        bot.command('report', async (ctx) => {
            await startReportFlow(ctx);
        });

        // /set_limit komandasi
        bot.command('set_limit', async (ctx) => {
            await startLimitFlow(ctx, this.prisma, this.sessions);
        });

        // /cancel komandasi - bekor qilish
        bot.command('cancel', async (ctx) => {
            const tgId = ctx.from?.id;
            if (tgId) {
                this.sessions.delete(tgId);
                await ctx.reply('❌ Amal bekor qilindi.', {
                    reply_markup: getMainMenu(),
                });
            }
        });
        // /all_expenses komandasi
        bot.command('all_expenses', async (ctx) => {
            await showAllExpenses(ctx, this.prisma);
        });


        // ===== TUGMALAR BILAN ISHLASH =====

        // 💸 Xarajat qo'shish tugmasi
        bot.hears('💸 Xarajat qo\'shish', async (ctx) => {
            await startExpenseFlow(ctx, this.prisma, this.sessions);
        });

        // 💰 Daromad qo'shish tugmasi
        bot.hears('💰 Daromad qo\'shish', async (ctx) => {
            await startIncomeFlow(ctx, this.prisma, this.sessions);
        });

        // 💼 Balans tugmasi
        bot.hears('💼 Balans', async (ctx) => {
            await showBalance(ctx, this.prisma, this.reportService);
        });

        // 📊 Hisobot tugmasi
        bot.hears('📊 Hisobot', async (ctx) => {
            await startReportFlow(ctx);
        });

        // ⚙️ Sozlamalar tugmasi
        bot.hears('⚙️ Sozlamalar', async (ctx) => {
            await ctx.reply(
                '⚙️ Sozlamalar:\n\n' +
                '/set_limit - Xarajat limiti belgilash',
                { reply_markup: getMainMenu() }
            );
        });

        // ℹ️ Yordam tugmasi
        bot.hears('ℹ️ Yordam', async (ctx) => {
            await ctx.reply(helpMatn, { reply_markup: getMainMenu() });
        });

        // Tugma bilan ishlash uchun
        bot.hears("📂 Barcha xarajatlar", async (ctx) => {
            await showAllExpenses(ctx, this.prisma);
        });

        // Tugmalar bilan ishlash (inline keyboard)
        bot.on('callback_query:data', async (ctx) => {
            await handleCallbackQuery(ctx, this.prisma, this.sessions, this.expenseService, this.reportService, this.reminderService);
        });

        // Telefon raqami va kontakt
        bot.on('message:contact', async (ctx) => {
            await handleContact(ctx, this.prisma);
        });

        // Matnli xabarlar (oxirida bo'lishi kerak!)
        bot.on('message:text', async (ctx) => {
            await handleTextMessage(ctx, this.prisma, this.sessions, this.expenseService, this.incomeService, this.reminderService);
        });

      
        
    }

}