import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/config/database/database.service';

@Injectable()
export class IncomeService {
    constructor(private prisma: DatabaseService) { }

    async createIncome(userId: number, source: string, amount: number) {
        return await this.prisma.income.create({
            data: {
                source,
                amount,
                userId,
            },
        });
    }

    async getUserIncomes(userId: number, startDate?: Date, endDate?: Date) {
        return await this.prisma.income.findMany({
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
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getTotalIncome(userId: number, startDate?: Date, endDate?: Date) {
        const result = await this.prisma.income.aggregate({
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
}