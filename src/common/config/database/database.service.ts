import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            await this.$connect();
            console.log("Database connected successfully.");
        } catch (error) {
            console.error("Database connection error:", error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}