// startReportFlow.ts
import { Context } from "grammy";
import { getReportPeriodKeyboard } from "src/common/utils/helper";

export async function startReportFlow(ctx: Context) {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    await ctx.reply("📊 Qaysi davr uchun hisobot olmoqchisiz?", {
        reply_markup: getReportPeriodKeyboard(),
    });
}
