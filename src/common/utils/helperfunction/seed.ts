import { PrismaClient } from "@prisma/client";

// Default kategoriyalarni yaratish
export async function seedDefaultCategories(prisma: PrismaClient) {
    const defaultCategories = [
        'Oziq-ovqat',
        'Transport',
        'Ko\'ngilochar',
        'Kommunal',
        'Kiyim-kechak',
        'Sog\'liq',
        'Ta\'lim',
        'Boshqa'
    ];

    for (const name of defaultCategories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
}
