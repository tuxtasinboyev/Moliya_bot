// showAllExpenses.ts
import { Context } from "grammy";
import { PrismaClient } from "@prisma/client/extension";
import { getMainMenu } from "src/common/utils/helper";

export async function showAllExpenses(ctx: Context, prisma: PrismaClient) {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    const user = await prisma.user.findUnique({
        where: { telegramId: String(tgId) },
    });

    if (!user) {
        await ctx.reply("Iltimos, avval /start buyrug'ini yuboring.");
        return;
    }

    const expenses = await prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    if (expenses.length === 0) {
        await ctx.reply("Sizda hech qanday xarajat mavjud emas.", { reply_markup: getMainMenu() });
        return;
    }

    let message = "📝 Sizning barcha xarajatlaringiz:\n\n";

    expenses.forEach((exp, i) => {
        message += `${i + 1}. ${exp.name} - ${exp.amount.toLocaleString()} so'm\n`;
    });

    await ctx.reply(message, { reply_markup: getMainMenu() });
}
