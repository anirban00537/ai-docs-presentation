import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Header,
  Headers,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DocsService } from './docs.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdateDocDto } from './dto/update-doc.dto';
import { UpdateDocTitleDto } from './dto/update-doc-title.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CreateFromPromptDto } from './dto/create-from-prompt.dto';
import { PromptDocsAIService } from './prompt-docs-ai/prompt-docs-ai.service';
import { CreditService } from '../subscription/services/credit.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorator';
import { ToggleShareDto } from './dto/share-doc.dto';

@Controller('docs')
@UseGuards(JwtAuthGuard)
export class DocsController {
  private readonly logger = new Logger(DocsController.name);

  constructor(
    private readonly docsService: DocsService,
    private readonly promptDocsAIService: PromptDocsAIService,
    private readonly creditService: CreditService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('list')
  findAll(@UserInfo() user: User, @Query() query: any) {
    return this.docsService.findAll(user, query);
  }

  // Share endpoints - placed before generic :id routes to ensure proper matching
  @Post(':id/share/enable')
  async enableShare(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.docsService.generateShareToken(id, user);
  }

  @Post(':id/share/disable')
  async disableShare(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.docsService.toggleShare(id, user, false);
  }

  @Get(':id/share')
  async getShareInfo(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.docsService.getShareInfo(id, user);
  }

  @Public()
  @Get(':id/get')
  findOne(@Param('id') id: string, @UserInfo() user: User | null) {
    return this.docsService.findOne(id, user);
  }

  /**
   * Internal endpoint for export service to fetch card data
   * Uses exportKey for authentication instead of user JWT
   */
  @Public()
  @Get(':docId/cards/:cardId/export')
  async getCardForExport(
    @Param('docId') docId: string,
    @Param('cardId') cardId: string,
    @Query('exportKey') exportKey: string,
  ) {
    return this.docsService.getCardForExport(docId, cardId, exportKey);
  }

  @Get(':id/export/pptx')
  async exportToPptx(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Res() res: Response,
  ) {
    try {
      // Check subscription access
      const accessCheck = await this.subscriptionService.hasActiveAccess(
        user.id,
      );
      if (!accessCheck.hasAccess) {
        throw new ForbiddenException(
          'Active subscription required to export docs',
        );
      }

      const pptxBuffer = await this.docsService.exportToPptx(id, user);

      // Get doc title for filename
      const docResponse = await this.docsService.findOne(id, user);
      const doc = (docResponse as any)?.data;
      const title = doc?.title || 'doc';
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.pptx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', pptxBuffer.length.toString());

      res.send(pptxBuffer);
    } catch (error: any) {
      this.logger.error(`Failed to export doc ${id} to PPTX`, error);

      if (error instanceof ForbiddenException) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export doc',
      });
    }
  }

  @Get(':id/export/pdf')
  async exportToPdf(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Res() res: Response,
  ) {
    try {
      // Check subscription access
      const accessCheck = await this.subscriptionService.hasActiveAccess(
        user.id,
      );
      if (!accessCheck.hasAccess) {
        throw new ForbiddenException(
          'Active subscription required to export docs',
        );
      }

      const pdfBuffer = await this.docsService.exportToPdf(id, user);

      // Get doc title for filename
      const docResponse = await this.docsService.findOne(id, user);
      const doc = (docResponse as any)?.data;
      const title = doc?.title || 'doc';
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      res.send(pdfBuffer);
    } catch (error: any) {
      this.logger.error(`Failed to export doc ${id} to PDF`, error);

      if (error instanceof ForbiddenException) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export doc',
      });
    }
  }

  @Get(':id/export/png')
  async exportToPng(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Res() res: Response,
  ) {
    try {
      // Check subscription access
      const accessCheck = await this.subscriptionService.hasActiveAccess(
        user.id,
      );
      if (!accessCheck.hasAccess) {
        throw new ForbiddenException(
          'Active subscription required to export docs',
        );
      }

      const pngBuffer = await this.docsService.exportToPng(id, user);

      // Get doc title for filename
      const docResponse = await this.docsService.findOne(id, user);
      const doc = (docResponse as any)?.data;
      const title = doc?.title || 'doc';
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_cards.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Length', pngBuffer.length.toString());

      res.send(pngBuffer);
    } catch (error: any) {
      this.logger.error(`Failed to export doc ${id} to PNG`, error);

      if (error instanceof ForbiddenException) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export doc',
      });
    }
  }

  @Patch(':id/update')
  update(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateDocDto: UpdateDocDto,
  ) {
    return this.docsService.update(id, user, updateDocDto);
  }

  @Patch(':id/update-title')
  updateTitle(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateTitleDto: UpdateDocTitleDto,
  ) {
    return this.docsService.updateTitle(id, user, updateTitleDto);
  }

  @Delete(':id/delete')
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.docsService.remove(id, user);
  }

  @Post(':docId/cards/add')
  createCard(
    @Param('docId') docId: string,
    @UserInfo() user: User,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.docsService.addCard(docId, user, createCardDto);
  }

  @Patch(':docId/cards/:cardId/update')
  updateCard(
    @Param('docId') docId: string,
    @Param('cardId') cardId: string,
    @UserInfo() user: User,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.docsService.updateCard(cardId, user, updateCardDto);
  }

  @Delete(':docId/cards/:cardId/delete')
  deleteCard(
    @Param('docId') docId: string,
    @Param('cardId') cardId: string,
    @UserInfo() user: User,
  ) {
    return this.docsService.removeCard(cardId, user);
  }

  @Post(':docId/cards/reorder')
  reorderCards(
    @Param('docId') docId: string,
    @UserInfo() user: User,
    @Body() body: { cardOrders: { cardId: string; order: number }[] },
  ) {
    return this.docsService.reorderCards(docId, user, body.cardOrders);
  }

  @Post('save-prompt')
  savePrompt(
    @UserInfo() user: User,
    @Body() createFromPromptDto: CreateFromPromptDto,
  ): Promise<ResponseModel> {
    return this.docsService.savePrompt(user, createFromPromptDto);
  }

  @Post(':docId/cards/create')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async generateAndCreateCards(
    @Param('docId') docId: string,
    @UserInfo() user: User,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders(); // Start the stream immediately

    let creditsDeducted = 0; // Track credits deducted for potential refund

    try {
      // Get the doc to know how many cards will be generated
      const docResponse = await this.docsService.findOne(docId, user);
      const doc = (docResponse as any)?.data;

      if (!doc) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'Doc not found' })}\n\n`,
        );
        res.end();
        return;
      }

      // Get cards with outline data
      const cards = doc.cards || [];
      const cardsWithOutlines = cards.filter((card: any) => card.outline);

      if (cardsWithOutlines.length === 0) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'No outline data found in cards' })}\n\n`,
        );
        res.end();
        return;
      }

      const estimatedCards = cardsWithOutlines.length;
      const creditsPerCard = 2; // 2 credits per card
      const requiredCredits = estimatedCards * creditsPerCard;

      // UPFRONT DEDUCTION: Deduct credits before generation starts to prevent race conditions
      try {
        await this.creditService.useCredits(
          user.id,
          requiredCredits,
          `Generating ${estimatedCards} cards for doc ${docId}`,
          docId,
        );
        creditsDeducted = requiredCredits;
        this.logger.log(
          `[Credits] Deducted ${requiredCredits} credits upfront for user ${user.id}`,
        );
      } catch (creditError: any) {
        // Credit deduction failed (likely insufficient credits)
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            message:
              creditError.message ||
              `Insufficient credits. Required: ${requiredCredits} credits to generate ${estimatedCards} cards.`,
          })}\n\n`,
        );
        res.end();
        return;
      }

      let cardsGenerated = 0;
      let generationError = false;

      try {
        const stream = this.promptDocsAIService.generateAndSaveCardsFromDoc(
          docId,
          user,
        );

        for await (const chunk of stream) {
          // Write chunk directly to response (like outline stream does)
          // The service already yields JSON strings, so we can write them directly
          res.write(`data: ${chunk}\n\n`);

          // Track card generation by safely parsing (don't throw on parse errors)
          try {
            const data = JSON.parse(chunk);
            if (data.type === 'card') {
              cardsGenerated++;
            }
            if (data.type === 'error') {
              generationError = true;
            }
          } catch (parseError) {
            // Chunk might be malformed JSON, but we still wrote it to the response
            // Let the frontend handle parsing errors
          }

          // Force flush to prevent buffering
          if ((res as any).flush) {
            (res as any).flush();
          }
        }
      } catch (streamError: any) {
        generationError = true;
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: streamError.message })}\n\n`,
        );
      }

      // If generation failed and we deducted credits, refund them
      if (generationError && creditsDeducted > 0) {
        try {
          await this.creditService.refundCredits(
            user.id,
            creditsDeducted,
            `Refund: Card generation failed for doc ${docId}`,
            docId,
          );
          this.logger.log(
            `[Credits] Refunded ${creditsDeducted} credits to user ${user.id} due to generation failure`,
          );
        } catch (refundError) {
          this.logger.error('Failed to refund credits:', refundError);
        }
      }

      res.end();
    } catch (error: any) {
      // If we deducted credits but hit an unexpected error, try to refund
      if (creditsDeducted > 0) {
        try {
          await this.creditService.refundCredits(
            user.id,
            creditsDeducted,
            `Refund: Unexpected error during card generation for doc ${docId}`,
            docId,
          );
          this.logger.log(
            `[Credits] Refunded ${creditsDeducted} credits to user ${user.id} due to unexpected error`,
          );
        } catch (refundError) {
          this.logger.error('Failed to refund credits:', refundError);
        }
      }
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`,
      );
      res.end();
    }
  }

  @Post(':id/generate-outline')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async generateOutlineStream(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const stream = this.docsService.generateOutlineStream(id, user);

      for await (const chunk of stream) {
        res.write(`data: ${chunk}\n\n`);
        if ((res as any).flush) {
          (res as any).flush();
        }
      }

      res.end();
    } catch (error: any) {
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`,
      );
      res.end();
    }
  }
}
