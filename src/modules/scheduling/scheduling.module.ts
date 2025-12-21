import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from 'src/shared/mail/mail.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MailModule,
  ],
  providers: [],
  exports: [],
})
export class SchedulingModule {}