// handleCallbackQuery.ts
import { Context } from "grammy";
import { getMainMenu } from "src/common/utils/helper";
import { ExpenseService } from "src/models/service/Expense.Service";
import { ReminderService } from "src/models/service/Reminder.Service";
import { ReportService } from "src/models/service/Report.Service";

interface SessionsMap {
    get(tgId: number): any;
    set(tgId: number, value: any): void;
    delete(tgId: number): void;
}

interface Prisma {
    user: {
        findUnique(args: { where: { telegramId: string } }): Promise<{ id: number } | null>;
    };
}

export async function handleCallbackQuery(
    ctx: Context,
    prisma: Prisma,
    sessions: SessionsMap,
    expenseService: ExpenseService,
    reportService: ReportService,
    reminderService: ReminderService
) {
    const tgId = ctx.from?.id;
    const data = ctx.callbackQuery?.data;
    if (!tgId || !data) return;

    await ctx.answerCallbackQuery();

    // Kategoriya tanlash (xarajat uchun)
    if (data.startsWith("category_")) {
        const categoryId = parseInt(data.replace("category_", ""));
        const session = sessions.get(tgId);

        if (session && session.step === "expense_category") {
            await expenseService.createExpense(
                session.data.userId,
                session.data.name,
                session.data.amount,
                categoryId
            );

            await ctx.editMessageText("✅ Xarajat muvaffaqiyatli qo'shildi!");
            await ctx.reply("Boshqa nima qilmoqchisiz?", { reply_markup: getMainMenu() });

            sessions.delete(tgId);

            // Limitni tekshirish
            await reminderService.checkExpenseLimit(session.data.userId, ctx);
        }
    }

    // Yangi kategoriya qo'shish
    if (data === "new_category") {
        const session = sessions.get(tgId);
        if (session && session.step === "expense_category") {
            sessions.set(tgId, { ...session, step: "new_category_name" });

            await ctx.editMessageText(
                "➕ Yangi kategoriya nomini kiriting:\n\nBekor qilish uchun /cancel"
            );
        }
    }

    // Hisobot davri tanlash
    if (data === "report_week" || data === "report_month") {
        const user = await prisma.user.findUnique({
            where: { telegramId: String(tgId) },
        });
        if (!user) return;

        const period = data === "report_week" ? "week" : "month";
        const report = await reportService.generateReport(user.id, period);

        await ctx.editMessageText(report);
        await ctx.reply("Boshqa nima qilmoqchisiz?", { reply_markup: getMainMenu() });
    }
}
