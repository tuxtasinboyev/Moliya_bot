// showBalance.ts
import { Context } from "grammy";
import { DatabaseService } from "src/common/config/database/database.service";
import { ReportService } from "src/models/service/Report.Service";
import { getMainMenu } from "src/common/utils/helper";

export async function showBalance(
    ctx: Context,
    prisma: DatabaseService,
    reportService: ReportService
) {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    const user = await prisma.user.findUnique({
        where: { telegramId: String(tgId) },
    });

    if (!user) {
        await ctx.reply("Iltimos, avval /start buyrug'ini yuboring.");
        return;
    }

    const balance = await reportService.getBalance(user.id);

    const balanceEmoji = balance.balance >= 0 ? "✅" : "❌";
    const balanceStatus = balance.balance >= 0 ? "Ijobiy" : "Salbiy";

    await ctx.reply(
        `💼 Sizning balansingiz:\n\n` +
        `💰 Jami daromad: ${balance.totalIncome.toLocaleString()} so'm\n` +
        `💸 Jami xarajat: ${balance.totalExpense.toLocaleString()} so'm\n` +
        `━━━━━━━━━━━━━━━\n` +
        `${balanceEmoji} Balans: ${balance.balance.toLocaleString()} so'm\n` +
        `📊 Holat: ${balanceStatus}`,
        { reply_markup: getMainMenu() }
    );
}
