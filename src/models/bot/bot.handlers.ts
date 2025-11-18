// import { PrismaClient } from '@prisma/client';
// import { Bot } from 'grammy';
// import { getMainMenu, getPhoneKeyboard, helpMatn, UserCommandState } from 'src/common/utils/helper';
// import { canExecuteCommand } from '../../common/utils/helperfunction/checkComand';
// import { getPhone } from '../../common/utils/helperfunction/getPhone';
// import { workWithButton } from '../../common/utils/helperfunction/menuButtons';

// export const commandState: UserCommandState = {};

// export function setupHandlers(bot: Bot, prisma: PrismaClient) {
//     // /start komandasi
//     bot.command('start', async (ctx) => {
//         const tgId = ctx.from?.id;
//         const username = ctx.from?.username;
//         if (!tgId) return;

//         // Komanda bloklangan bo'lsa xabar berish
//         if (!canExecuteCommand(tgId, 'start')) {
//             await ctx.reply('Siz juda tez-tez /start komandani ishlatyapsiz. Iltimos, biroz kuting.');
//             return;
//         }

//         // Foydalanuvchini topish yoki yaratish
//         let user = await prisma.user.findUnique({ where: { telegramId: String(tgId) } });
//         if (!user) {
//             user = await prisma.user.create({
//                 data: { telegramId: String(tgId), username: username ?? undefined }
//             });
//         }

//         // Agar telefon raqami mavjud bo'lsa, menyuni ko'rsatish
//         if (user.phone) {
//             await ctx.reply(
//                 `Salom, ${username ?? 'Foydalanuvchi'}! 👋\nSiz botdan to'liq foydalanishingiz mumkin!`,
//                 { reply_markup: getMainMenu() }
//             );
//         } else {
//             // Telefon raqamini so'rash
//             const infoMsg = await ctx.reply(`
// Salom, ${username ?? 'Foydalanuvchi'}! 👋
// Men sizning shaxsiy moliyaviy hisob-kitob botingizman.
//             `);

//             const phoneMsg = await ctx.reply('Iltimos, telefon raqamingizni yuboring:', {
//                 reply_markup: getPhoneKeyboard()
//             });

//             // 5 soniyadan keyin xabarlarni o'chirish
//             setTimeout(async () => {
//                 try { await ctx.api.deleteMessage(ctx.chat.id, infoMsg.message_id); } catch { }
//                 try { await ctx.api.deleteMessage(ctx.chat.id, phoneMsg.message_id); } catch { }
//             }, 5000);
//         }

//         // Command state update
//         if (!commandState[tgId]) commandState[tgId] = {};
//         if (!commandState[tgId]['start']) commandState[tgId]['start'] = { count: 0, lastTime: 0 };
//         commandState[tgId]['start'].count += 1;
//         commandState[tgId]['start'].lastTime = Date.now();
//     });

//     // Telefon raqamini olish
//     getPhone(bot, prisma);

//     // /help komandasi
//     bot.command('help', async (ctx) => {
//         const tgId = ctx.from?.id;
//         if (!tgId) return;

//         await ctx.reply(helpMatn, { reply_markup: getMainMenu() });

//         // Command state update
//         if (!commandState[tgId]) commandState[tgId] = {};
//         if (!commandState[tgId]['help']) commandState[tgId]['help'] = { count: 0, lastTime: 0 };
//         commandState[tgId]['help'].count += 1;
//         commandState[tgId]['help'].lastTime = Date.now();
//     });

//     // Menyudagi tugmalar bilan ishlash
//     workWithButton(bot, prisma);

//     // Limit belgilash
//     const limitSessions: Record<number, { step?: 'limit'; limit?: number }> = {};

//     bot.command('set_limit', async (ctx) => {
//         const tgId = ctx.from?.id;
//         if (!tgId) return;

//         limitSessions[tgId] = { step: 'limit' };
//         await ctx.reply('Iltimos, xarajat limitini kiriting (so\'mda): ');
//     });

//     // Limit uchun message handler (alohida listener)
//     bot.on('message:text', async (ctx, next) => {
//         const tgId = ctx.from?.id;
//         if (!tgId) return next();

//         const session = limitSessions[tgId];
//         if (!session || session.step !== 'limit') return next();

//         const limit = parseFloat(ctx.message.text);
//         if (isNaN(limit) || limit <= 0) {
//             await ctx.reply('Iltimos, to\'g\'ri raqam kiriting.');
//             return;
//         }

//         const user = await prisma.user.findUnique({ where: { telegramId: String(tgId) } });
//         if (!user) {
//             await ctx.reply('Xatolik: foydalanuvchi topilmadi.');
//             return;
//         }

//         await prisma.reminder.create({
//             data: {
//                 userId: user.id,
//                 type: 'EXPENSE_LIMIT',
//                 limit,
//                 message: `Sizning limitingiz: ${limit} so'm`
//             }
//         });

//         await ctx.reply(`✅ Limit ${limit} so'm ga belgilandi!`, { reply_markup: getMainMenu() });
//         delete limitSessions[tgId];
//     });
// }