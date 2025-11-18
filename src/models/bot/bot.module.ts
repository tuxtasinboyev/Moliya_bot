import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { DatabaseModule } from 'src/common/config/database/database.module';
import { BotUpdate } from './bot.update';
import { ExpenseService } from '../service/Expense.Service';
import { IncomeService } from '../service/Income.Service';
import { ReportService } from '../service/Report.Service';
import { ReminderService } from '../service/Reminder.Service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BotService,
    BotUpdate,
    ExpenseService,
    IncomeService,
    ReportService,
    ReminderService,
  ],
  exports: [BotService],
})
export class BotModule { }