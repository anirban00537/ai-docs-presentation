import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';

// Controllers
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminAiController } from './controllers/admin-ai.controller';
import { AdminActivityController } from './controllers/admin-activity.controller';
import { AdminPresentationsController } from './controllers/admin-presentations.controller';
import { AdminFinanceController } from './controllers/admin-finance.controller';
import { AdminMediaController } from './controllers/admin-media.controller';
import { AdminSystemController } from './controllers/admin-system.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminLayoutsController } from './controllers/admin-layouts.controller';

// Services
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAiService } from './services/admin-ai.service';
import { AdminActivityService } from './services/admin-activity.service';
import { AdminPresentationsService } from './services/admin-presentations.service';
import { AdminFinanceService } from './services/admin-finance.service';
import { AdminMediaService } from './services/admin-media.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminProductsService } from './services/admin-products.service';
import { AdminLayoutsService } from './services/admin-layouts.service';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [
    AdminAnalyticsController,
    AdminUsersController,
    AdminAiController,
    AdminActivityController,
    AdminPresentationsController,
    AdminFinanceController,
    AdminMediaController,
    AdminSystemController,
    AdminProductsController,
    AdminLayoutsController,
  ],
  providers: [
    AdminAnalyticsService,
    AdminUsersService,
    AdminAiService,
    AdminActivityService,
    AdminPresentationsService,
    AdminFinanceService,
    AdminMediaService,
    AdminSystemService,
    AdminProductsService,
    AdminLayoutsService,
  ],
  exports: [
    AdminAnalyticsService,
    AdminUsersService,
    AdminAiService,
    AdminActivityService,
    AdminPresentationsService,
    AdminFinanceService,
    AdminMediaService,
    AdminSystemService,
    AdminProductsService,
    AdminLayoutsService,
  ],
})
export class AdminModule {}
