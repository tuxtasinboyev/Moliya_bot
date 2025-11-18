// startLimitFlow.ts
import { Context } from "grammy";

interface SessionsMap {
    set(tgId: number, value: { step: string; data?: any }): void;
}

interface User {
    id: number;
}

interface Prisma {
    user: {
        findUnique(args: { where: { telegramId: string } }): Promise<User | null>;
    };
}

export async function startLimitFlow(ctx: Context, prisma: Prisma, sessions: SessionsMap) {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    const user = await prisma.user.findUnique({
        where: { telegramId: String(tgId) },
    });

    if (!user) {
        await ctx.reply("Iltimos, avval /start buyrug'ini yuboring.");
        return;
    }

    sessions.set(tgId, { step: "set_limit", data: { userId: user.id } });

    await ctx.reply(
        "⚠️ Xarajat limitini kiriting (so'mda):\n\n" + "Bekor qilish uchun /cancel",
        { reply_markup: { remove_keyboard: true } }
    );
}
