import { Keyboard, InlineKeyboard } from 'grammy';

// Asosiy menyu
export function getMainMenu() {
    return new Keyboard()
        .text('💸 Xarajat qo\'shish')
        .text('💰 Daromad qo\'shish')
        .row()
        .text('📂 Barcha xarajatlar')
        .row()
        .text('💼 Balans')
        .text('📊 Hisobot')
        .row()
        .text('⚙️ Sozlamalar')
        .text('ℹ️ Yordam')
        .resized()
        .persistent();
}

// Telefon raqami uchun keyboard
export function getPhoneKeyboard() {
    return new Keyboard()
        .requestContact('📱 Telefon raqamini yuborish')
        .resized()
        .oneTime();
}

// Kategoriya tanlash uchun inline keyboard
export function getCategoryKeyboard(categories: any[]) {
    const keyboard = new InlineKeyboard();

    // Har qatorga 2 ta kategoriya
    categories.forEach((category, index) => {
        keyboard.text(category.name, `category_${category.id}`);
        if ((index + 1) % 2 === 0) {
            keyboard.row();
        }
    });

    // Yangi kategoriya qo'shish tugmasi
    keyboard.row().text('➕ Yangi kategoriya', 'new_category');

    return keyboard;
}

// Hisobot davri uchun inline keyboard
export function getReportPeriodKeyboard() {
    return new InlineKeyboard()
        .text('📅 Haftalik', 'report_week')
        .text('📅 Oylik', 'report_month');
}

// Yordam matni
export const helpMatn = `ℹ️ Yordam\n\n` +
    `💸 Xarajat qo'shish - yangi xarajat qo'shing\n` +
    `💰 Daromad qo'shish - daromad kiriting\n` +
    `💼 Balans - joriy balansni ko'ring\n` +
    `📊 Hisobot - haftalik/oylik hisobot olish\n` +
    `⚙️ Sozlamalar - limit va boshqa sozlamalar\n\n` +
    `Bekor qilish uchun /cancel buyrug'ini yuboring.`;