// startIncomeFlow.ts
import { Context } from "grammy";
import { DatabaseService } from "src/common/config/database/database.service";

export async function startIncomeFlow(
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

    sessions.set(tgId, { step: "income_source" });

    await ctx.reply(
        "💰 Daromad manbaini kiriting (masalan: Ish haqi, Qo'shimcha ish):\n\nBekor qilish uchun /cancel",
        { reply_markup: { remove_keyboard: true } }
    );
}
