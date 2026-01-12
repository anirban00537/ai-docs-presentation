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
import { PresentationService } from './presentation.service';
import { UserInfo } from 'src/shared/decorators/user.decorators';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ResponseModel } from 'src/shared/models/response.model';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { UpdatePresentationTitleDto } from './dto/update-presentation-title.dto';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { CreateOutlineDto, UpdateOutlineDto } from './dto/create-outline.dto';
import { PromptPresentationAIService } from './prompt-presentation-ai/prompt-presentation-ai.service';
import { OutlineService } from './outline.service';
import { CreditService } from '../subscription/services/credit.service';
import { BadRequestException } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorator';
import { ToggleShareDto } from './dto/share-presentation.dto';

@Controller('presentation')
@UseGuards(JwtAuthGuard)
export class PresentationController {
  private readonly logger = new Logger(PresentationController.name);

  constructor(
    private readonly presentationService: PresentationService,
    private readonly promptPresentationAIService: PromptPresentationAIService,
    private readonly outlineService: OutlineService,
    private readonly creditService: CreditService,
  ) {}

  @Get('list')
  findAll(@UserInfo() user: User, @Query() query: any) {
    return this.presentationService.findAll(user, query);
  }

  // Share endpoints - placed before generic :id routes to ensure proper matching
  @Post(':id/share/enable')
  async enableShare(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.presentationService.generateShareToken(id, user);
  }

  @Post(':id/share/disable')
  async disableShare(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.presentationService.toggleShare(id, user, false);
  }

  @Get(':id/share')
  async getShareInfo(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.presentationService.getShareInfo(id, user);
  }

  @Public()
  @Get(':id/get')
  findOne(@Param('id') id: string, @UserInfo() user: User | null) {
    return this.presentationService.findOne(id, user);
  }

  @Patch(':id/update')
  update(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updatePresentationDto: UpdatePresentationDto,
  ) {
    return this.presentationService.update(id, user, updatePresentationDto);
  }

  @Patch(':id/update-title')
  updateTitle(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateTitleDto: UpdatePresentationTitleDto,
  ) {
    return this.presentationService.updateTitle(id, user, updateTitleDto);
  }

  @Delete(':id/delete')
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.presentationService.remove(id, user);
  }

  @Post(':presentationId/slides/add')
  createSlide(
    @Param('presentationId') presentationId: string,
    @UserInfo() user: User,
    @Body() createSlideDto: CreateSlideDto,
  ) {
    return this.presentationService.addSlide(
      presentationId,
      user,
      createSlideDto,
    );
  }

  @Patch(':presentationId/slides/:slideId/update')
  updateSlide(
    @Param('presentationId') presentationId: string,
    @Param('slideId') slideId: string,
    @UserInfo() user: User,
    @Body() updateSlideDto: UpdateSlideDto,
  ) {
    return this.presentationService.updateSlide(slideId, user, updateSlideDto);
  }

  @Delete(':presentationId/slides/:slideId/delete')
  deleteSlide(
    @Param('presentationId') presentationId: string,
    @Param('slideId') slideId: string,
    @UserInfo() user: User,
  ) {
    return this.presentationService.removeSlide(slideId, user);
  }

  @Post(':presentationId/slides/reorder')
  reorderSlides(
    @Param('presentationId') presentationId: string,
    @UserInfo() user: User,
    @Body() body: { slideOrders: { slideId: string; order: number }[] },
  ) {
    return this.presentationService.reorderSlides(
      presentationId,
      user,
      body.slideOrders,
    );
  }

  @Post('save-prompt')
  savePrompt(
    @UserInfo() user: User,
    @Body() createOutlineDto: CreateOutlineDto,
  ): Promise<ResponseModel> {
    return this.outlineService.savePrompt(user, createOutlineDto);
  }

  @Get('outline/:id')
  getOutline(
    @Param('id') id: string,
    @UserInfo() user: User,
  ): Promise<ResponseModel> {
    return this.outlineService.getOutline(id, user);
  }

  @Patch('outline/:id')
  updateOutline(
    @Param('id') id: string,
    @UserInfo() user: User,
    @Body() updateOutlineDto: UpdateOutlineDto,
  ): Promise<ResponseModel> {
    return this.outlineService.updateOutline(id, user, updateOutlineDto);
  }

  @Post(':presentationId/slides/create')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async generateAndCreateSlides(
    @Param('presentationId') presentationId: string,
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
      // Get the outline to know how many slides will be generated
      const outline = await this.outlineService.getOutlineByPresentationId(
        presentationId,
        user,
      );

      if (!outline) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'No outline found for this presentation' })}\n\n`,
        );
        res.end();
        return;
      }

      const outlineItems = outline.outlines as Array<{
        content: string;
        schemaId?: string;
        layoutId?: string;
      }>;

      if (
        !outlineItems ||
        !Array.isArray(outlineItems) ||
        outlineItems.length === 0
      ) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'Outline is empty or invalid' })}\n\n`,
        );
        res.end();
        return;
      }

      const estimatedSlides = outlineItems.length;
      const creditsPerSlide = 2; // 2 credits per slide (updated Jan 2026)
      const requiredCredits = estimatedSlides * creditsPerSlide;

      // UPFRONT DEDUCTION: Deduct credits before generation starts to prevent race conditions
      try {
        await this.creditService.useCredits(
          user.id,
          requiredCredits,
          `Generating ${estimatedSlides} slides for presentation ${presentationId}`,
          presentationId,
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
              `Insufficient credits. Required: ${requiredCredits} credits to generate ${estimatedSlides} slides.`,
          })}\n\n`,
        );
        res.end();
        return;
      }

      let slidesGenerated = 0;
      let generationError = false;

      try {
        const stream =
          this.promptPresentationAIService.generateAndSaveSlidesFromPresentation(
            presentationId,
            user,
          );

        for await (const chunk of stream) {
          const data = JSON.parse(chunk);

          // Track successful slide generation
          if (data.type === 'slide') {
            slidesGenerated++;
          }

          // Check for error in stream
          if (data.type === 'error') {
            generationError = true;
          }

          res.write(`data: ${chunk}\n\n`);
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
            `Refund: Slide generation failed for presentation ${presentationId}`,
            presentationId,
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
            `Refund: Unexpected error during slide generation for presentation ${presentationId}`,
            presentationId,
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

  @Post('outline/:id/generate-stream')
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
      const stream = this.outlineService.generateOutlineStream(id, user);

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
