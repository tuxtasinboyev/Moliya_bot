import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Kategoriyalarni yaratish
    const categories = [
        { name: '🍔 Oziq-ovqat' },
        { name: '🚗 Transport' },
        { name: '🏠 Uy-joy' },
        { name: '💊 Sog\'liq' },
        { name: '🎮 Ko\'ngilochar' },
        { name: '👕 Kiyim-kechak' },
        { name: '📚 Ta\'lim' },
        { name: '💳 To\'lovlar' },
        { name: '🎁 Sovg\'alar' },
        { name: '📱 Aloqa' },
        { name: '🔧 Boshqa' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }

    console.log('✅ Categories seeded successfully!');
    console.log(`Created ${categories.length} categories`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });