import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/config/database/database.service';

@Injectable()
export class ExpenseService {
    constructor(private prisma: DatabaseService) { }

    async createExpense(
        userId: number,
        name: string,
        amount: number,
        categoryId: number,
    ) {
        return await this.prisma.expense.create({
            data: {
                name,
                amount,
                userId,
                categoryId,
            },
            include: {
                category: true,
            },
        });
    }

    async getUserExpenses(userId: number, startDate?: Date, endDate?: Date) {
        return await this.prisma.expense.findMany({
            where: {
                userId,
                ...(startDate && endDate
                    ? {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    }
                    : {}),
            },
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getTotalExpenses(userId: number, startDate?: Date, endDate?: Date) {
        const result = await this.prisma.expense.aggregate({
            where: {
                userId,
                ...(startDate && endDate
                    ? {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    }
                    : {}),
            },
            _sum: {
                amount: true,
            },
        });

        return result._sum.amount || 0;
    }

    async getExpensesByCategory(
        userId: number,
        startDate?: Date,
        endDate?: Date,
    ) {
        const expenses = await this.prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                ...(startDate && endDate
                    ? {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    }
                    : {}),
            },
            _sum: {
                amount: true,
            },
        });

        const categories = await this.prisma.category.findMany({
            where: {
                id: {
                    in: expenses.map((e) => e.categoryId),
                },
            },
        });

        return expenses.map((expense) => ({
            category: categories.find((c) => c.id === expense.categoryId)?.name || 'Noma\'lum',
            total: expense._sum.amount || 0,
        }));
    }
}