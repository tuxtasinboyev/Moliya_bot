import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotService implements OnModuleInit {
    public bot: Bot;

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>('BOT_TOKEN');
        if (!token) {
            throw new Error('BOT_TOKEN not found in environment variables');
        }
        this.bot = new Bot(token);
    }

    async onModuleInit() {
        await this.bot.start({
            onStart: (botInfo) => {
                console.log(`✅ Bot started: @${botInfo.username}`);
            },
        });
    }

    getBot(): Bot {
        return this.bot;
    }
}