import { Module } from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PresentationController } from './presentation.controller';
import { PromptPresentationAIService } from './prompt-presentation-ai.service';
import { OutlineService } from './outline.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SchemaRegistry } from './schema-core/registry';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [PresentationController],
  providers: [
    PresentationService,
    PromptPresentationAIService,
    OutlineService,
    SchemaRegistry,
  ],
  exports: [
    PresentationService,
    PromptPresentationAIService,
    OutlineService,
    SchemaRegistry,
  ],
})
export class PresentationModule {}
