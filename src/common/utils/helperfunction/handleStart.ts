// handleStart.ts
import { Context } from "grammy";
import { DatabaseService } from "src/common/config/database/database.service";
import { getMainMenu, getPhoneKeyboard } from "src/common/utils/helper";

export async function handleStart(
    ctx: Context,
    prisma: DatabaseService
) {
    const tgId = ctx.from?.id;
    const username = ctx.from?.username;

    if (!tgId) return;

    let user = await prisma.user.findUnique({
        where: { telegramId: String(tgId) },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                telegramId: String(tgId),
                username: username ?? undefined,
            },
        });
    }

    if (user.phone) {
        await ctx.reply(
            `Salom, ${username ?? 'Foydalanuvchi'}! 👋\n\nMen sizning shaxsiy moliyaviy hisob-kitob botingizman.\n\nKomandalar:\n/add_expense - Xarajat qo'shish\n/add_income - Daromad qo'shish\n/balance - Balansni ko'rish\n/report - Hisobot olish\n/set_limit - Limit belgilash`,
            { reply_markup: getMainMenu() }
        );
    } else {
        await ctx.reply(
            `Salom, ${username ?? 'Foydalanuvchi'}! 👋\n\nMen sizning shaxsiy moliyaviy hisob-kitob botingizman.`,
        );
        await ctx.reply("Iltimos, telefon raqamingizni yuboring:", {
            reply_markup: getPhoneKeyboard(),
        });
    }
}
