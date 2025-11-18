// startExpenseFlow.ts
import { Context } from "grammy";
import { DatabaseService } from "src/common/config/database/database.service";

export async function startExpenseFlow(
    ctx: Context,
    prisma: DatabaseService,
    sessions: Map<number, any>
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

    sessions.set(tgId, { step: "expense_name" });

    await ctx.reply(
        "📝 Xarajat nomini kiriting:\n\nBekor qilish uchun /cancel",
        { reply_markup: { remove_keyboard: true } }
    );
}
