// handleTextMessage.ts
import { PrismaClient } from "@prisma/client/extension";
import { Context } from "grammy";
import { getCategoryKeyboard, getMainMenu } from "src/common/utils/helper";
import { ExpenseService } from "src/models/service/Expense.Service";
import { IncomeService } from "src/models/service/Income.Service";
import { ReminderService } from "src/models/service/Reminder.Service";

interface SessionsMap {
    get(tgId: number): any;
    set(tgId: number, value: any): void;
    delete(tgId: number): void;
}

// interface Prisma {
//     user: {
//         findUnique(args: { where: { telegramId: string } }): Promise<any | null>;
//         category: {
//             findMany(): Promise<any[]>;
//             upsert(args: { where: { name: string }; update: {}; create: { name: string } }): Promise<any>;
//         };
//     };
// }

export async function handleTextMessage(
    ctx: Context,
    prisma: PrismaClient,
    sessions: SessionsMap,
    expenseService: ExpenseService,
    incomeService: IncomeService,
    reminderService: ReminderService
) {
    const tgId = ctx.from?.id;
    const text = ctx.message?.text;
    if (!tgId || !text) return;

    const session = sessions.get(tgId);

    // Agar session yo'q bo'lsa, hech narsa qilmaymiz
    if (!session) return;

    const user = await prisma.user.findUnique({ where: { telegramId: String(tgId) } });
    if (!user) return;

    // XARAJAT QO'SHISH OQIMI
    if (session.step === "expense_name") {
        sessions.set(tgId, { step: "expense_amount", data: { name: text, userId: user.id } });
        await ctx.reply("💵 Summani kiriting (so'mda):\n\nBekor qilish uchun /cancel");
        return;
    }

    if (session.step === "expense_amount") {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) {
            await ctx.reply("❌ Iltimos, to'g'ri raqam kiriting:\n\nBekor qilish uchun /cancel");
            return;
        }

        sessions.set(tgId, { step: "expense_category", data: { ...session.data, amount } });

        const categories = await prisma.category.findMany();
        await ctx.reply("📂 Kategoriyani tanlang:", { reply_markup: getCategoryKeyboard(categories) });
        return;
    }

    // Yangi kategoriya nomi
    if (session.step === "new_category_name") {
        const categoryName = text;
        const category = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName },
        });

        await expenseService.createExpense(
            session.data.userId,
            session.data.name,
            session.data.amount,
            category.id
        );

        await ctx.reply(
            `✅ Xarajat muvaffaqiyatli qo'shildi!\n\n📝 Nomi: ${session.data.name}\n💵 Summa: ${session.data.amount.toLocaleString()} so'm\n📂 Kategoriya: ${category.name}`,
            { reply_markup: getMainMenu() }
        );

        sessions.delete(tgId);

        await reminderService.checkExpenseLimit(session.data.userId, ctx);
        return;
    }

    // DAROMAD QO'SHISH OQIMI
    if (session.step === "income_source") {
        sessions.set(tgId, { step: "income_amount", data: { source: text, userId: user.id } });
        await ctx.reply("💵 Summani kiriting (so'mda):\n\nBekor qilish uchun /cancel");
        return;
    }

    if (session.step === "income_amount") {
        const amount = parseFloat(text);
        if (isNaN(amount) || amount <= 0) {
            await ctx.reply("❌ Iltimos, to'g'ri raqam kiriting:\n\nBekor qilish uchun /cancel");
            return;
        }

        await incomeService.createIncome(session.data.userId, session.data.source, amount);

        await ctx.reply(
            `✅ Daromad muvaffaqiyatli qo'shildi!\n\n📝 Manba: ${session.data.source}\n💵 Summa: ${amount.toLocaleString()} so'm`,
            { reply_markup: getMainMenu() }
        );

        sessions.delete(tgId);
        return;
    }

    // LIMIT BELGILASH
    if (session.step === "set_limit") {
        const limit = parseFloat(text);
        if (isNaN(limit) || limit <= 0) {
            await ctx.reply("❌ Iltimos, to'g'ri raqam kiriting:\n\nBekor qilish uchun /cancel");
            return;
        }

        await reminderService.setExpenseLimit(user.id, limit);
        await ctx.reply(`✅ Limit ${limit.toLocaleString()} so'm ga belgilandi!`, { reply_markup: getMainMenu() });

        sessions.delete(tgId);
        return;
    }
}
