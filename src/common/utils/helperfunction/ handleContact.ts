// handleContact.ts
import { Context } from "grammy";
import { DatabaseService } from "src/common/config/database/database.service";
import { getMainMenu } from "src/common/utils/helper";

export async function handleContact(
    ctx: Context,
    prisma: DatabaseService
) {
    const tgId = ctx.from?.id;
    const contact = ctx.message?.contact;

    if (!tgId || !contact) return;

    const phone = contact.phone_number;

    await prisma.user.update({
        where: { telegramId: String(tgId) },
        data: { phone },
    });

    await ctx.reply("✅ Telefon raqamingiz saqlandi!", {
        reply_markup: getMainMenu(),
    });
}
