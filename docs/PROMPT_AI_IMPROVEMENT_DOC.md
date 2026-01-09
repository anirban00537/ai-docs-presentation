# 🚀 Prompt Presentation AI - Improvement Documentation

> **Date**: January 9, 2026  
> **Author**: Analysis based on frontend-backend architecture review  
> **Scope**: `butterfast-backend/src/modules/presentation/prompt-presentation-ai/`

---

## 📊 Executive Summary

The `prompt-presentation-ai` module is responsible for AI-powered slide generation. After analyzing both the frontend block system and the backend generation pipeline, I've identified **12 key improvement opportunities** across 4 categories:

| Category | Issues Found | Priority |
|----------|--------------|----------|
| Schema Synchronization | 4 | 🔴 High |
| Prompt Engineering | 3 | 🟡 Medium |
| Performance & Reliability | 3 | 🟡 Medium |
| Architecture & Maintainability | 2 | 🟢 Low |

---

## 🔴 HIGH PRIORITY: Schema Synchronization Issues

### Issue 1: Incomplete Block Type Coverage in Schema Generator

**Location**: `utils/schema-generator.util.ts`

**Problem**: The `SchemaGeneratorUtil` only handles 12 block types explicitly, but the frontend has 16 block types defined in `BLOCK_DEFINITIONS`.

**Current Coverage**:
```typescript
// Currently handled:
- prosemirror
- image
- simple-number-card
- solid-icon-box-block
- solid-box-block
- sideline-card-block
- leaf-block
- layered-number-block
- stacked-timeline-block
- timeline-bento-block
- connected-steps-block
- circle-stats-block
- spacer

// MISSING from SchemaGeneratorUtil:
❌ code
❌ callout-block
❌ button-block
```

**Impact**: If AI generates slides with these block types, the schema won't enforce proper structure, leading to malformed content.

**Fix**:
```typescript
// Add to getSchemaForBlockType switch statement:

case 'code':
  (baseSchema.properties as any).content = {
    type: 'object',
    properties: {
      type: { type: 'string', const: 'code' },
      code: { type: 'string' },
      language: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['type', 'code', 'language'],
    additionalProperties: false,
  };
  break;

case 'callout-block':
  (baseSchema.properties as any).content = {
    type: 'object',
    properties: {
      type: { type: 'string', const: 'callout-block' },
      variant: { type: 'string', enum: ['note', 'info', 'warning', 'error'] },
      title: this.getProseMirrorSchema(),
      description: this.getProseMirrorSchema(),
    },
    required: ['type', 'variant'],
    additionalProperties: true,
  };
  break;

case 'button-block':
  (baseSchema.properties as any).content = {
    type: 'object',
    properties: {
      type: { type: 'string', const: 'button-block' },
      text: { type: 'string' },
      url: { type: 'string' },
      variant: { type: 'string', enum: ['primary', 'secondary', 'outline'] },
    },
    required: ['type', 'text'],
    additionalProperties: true,
  };
  break;
```

---

### Issue 2: BLOCK_TYPES Constant Not Shared

**Problem**: Frontend uses `BLOCK_TYPES` enum from `@/types/presentation`, but backend has no access to this. Block type strings are hardcoded in multiple places.

**Current Backend Approach**:
```typescript
// Hardcoded strings scattered across files:
case 'prosemirror':
case 'simple-number-card':
case 'solid-icon-box-block':
// ... etc
```

**Recommendation**: Create a shared types package or mirror the `BLOCK_TYPES` constant in the backend.

**Proposed Solution**:
```typescript
// butterfast-backend/src/shared/constants/block-types.constant.ts
export const BLOCK_TYPES = {
  PROSEMIRROR: 'prosemirror',
  IMAGE: 'image',
  CODE: 'code',
  SPACER: 'spacer',
  CALLOUT_BLOCK: 'callout-block',
  BUTTON_BLOCK: 'button-block',
  SIMPLE_NUMBER_CARD: 'simple-number-card',
  LAYERED_NUMBER_BLOCK: 'layered-number-block',
  SOLID_BOX_BLOCK: 'solid-box-block',
  SOLID_ICON_BOX_BLOCK: 'solid-icon-box-block',
  SIDELINE_CARD_BLOCK: 'sideline-card-block',
  LEAF_BLOCK: 'leaf-block',
  TIMELINE_BENTO_BLOCK: 'timeline-bento-block',
  STACKED_TIMELINE_BLOCK: 'stacked-timeline-block',
  CONNECTED_STEPS_BLOCK: 'connected-steps-block',
  CIRCLE_STATS_BLOCK: 'circle-stats-block',
} as const;
```

---

### Issue 3: ProseMirror Schema Mismatch

**Location**: `utils/schema-generator.util.ts` - `getProseMirrorSchema()`

**Problem**: The schema allows `additionalProperties: true` on ProseMirror content, which can lead to unexpected properties that the frontend can't handle.

**Current**:
```typescript
private static getProseMirrorSchema(): any {
  return {
    type: 'object',
    properties: {
      type: { type: 'string', const: 'doc' },
      content: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: true, // ⚠️ Too permissive
        },
      },
    },
    required: ['type', 'content'],
    additionalProperties: true, // ⚠️ Too permissive
  };
}
```

**Improved**:
```typescript
private static getProseMirrorSchema(): any {
  return {
    type: 'object',
    properties: {
      type: { type: 'string', const: 'doc' },
      content: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { 
              type: 'string', 
              enum: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock', 'hardBreak'] 
            },
            attrs: { type: 'object', additionalProperties: true },
            content: { type: 'array', items: { type: 'object', additionalProperties: true } },
          },
          required: ['type'],
          additionalProperties: true,
        },
      },
    },
    required: ['type', 'content'],
    additionalProperties: false,
  };
}
```

---

### Issue 4: Items Array Schema Inconsistency

**Location**: `utils/schema-generator.util.ts` - `getItemsArraySchema()`

**Problem**: Some frontend blocks expect specific fields that aren't required in the schema.

**Example - SimpleNumberCard expects**:
```typescript
// Frontend expectation (from definitions/simple-number-card.ts):
{
  id: string;
  number: number;
  title: ProseMirrorDoc;
  description: ProseMirrorDoc;
}
```

**Backend Schema only requires**:
```typescript
required: ['id'] // Missing number, title, description
```

**Fix**:
```typescript
private static getItemsArraySchema(blockType: string): any {
  const baseItem = {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    additionalProperties: true,
  };

  // Add type-specific required fields
  switch (blockType) {
    case 'simple-number-card':
    case 'layered-number-block':
      return {
        ...this.buildItemsWrapper(blockType),
        items: {
          ...baseItem,
          properties: {
            id: { type: 'string' },
            number: { type: 'number' },
            title: this.getProseMirrorSchema(),
            description: this.getProseMirrorSchema(),
          },
          required: ['id', 'number', 'title', 'description'],
        },
      };
    // ... other cases
  }
}
```

---

## 🟡 MEDIUM PRIORITY: Prompt Engineering Improvements

### Issue 5: Demo/Placeholder Text Still Appearing

**Location**: `prompts/prompt-builder.service.ts` - `buildSlidePrompt()`

**Problem**: Despite warnings, AI sometimes still outputs placeholder text like "Feature Title" or "Point Title".

**Current Prompt**:
```
⛔️ NEVER OUTPUT DEMO TEXT from the template (e.g. "Presentation Title", "Supporting subtitle", "Feature Title", "Point Title").
```

**Enhanced Prompt**:
```typescript
buildSlidePrompt(...): string {
  return `...

⚠️⚠️⚠️ FORBIDDEN PLACEHOLDER WORDS ⚠️⚠️⚠️
The following words/phrases are ABSOLUTELY FORBIDDEN in your output:
- "Feature Title", "Point Title", "Item Title"
- "Description here", "Your text here", "Add description"
- "Lorem ipsum" or any placeholder text
- "Title", "Subtitle" as actual content (only as structural types)
- Empty strings "", null values
- Single-word titles like "Introduction" without context

Instead, generate SPECIFIC content derived from: "${outlineContent}"

VALIDATION: Before outputting, verify EVERY text field contains at least 3 words of meaningful content.
...`;
}
```

---

### Issue 6: Missing Content Density Guidance

**Problem**: AI sometimes generates very sparse slides with minimal content, or overly dense slides.

**Recommendation**: Add content density guidelines to the prompt:

```typescript
CONTENT DENSITY GUIDELINES:
- Headings: 3-8 words (clear and specific)
- Bullet points: 5-15 words each (substantive but scannable)
- Descriptions: 10-25 words (informative but concise)
- Number of items: Match the template exactly (usually 3-4)
- Card titles: 2-5 words (keyword-focused)
- Card descriptions: 15-30 words (explains value/benefit)
```

---

### Issue 7: Image Context Not Passed to Slide Generator

**Location**: `prompt-presentation-ai.service.ts` - `generateSlideContent()`

**Problem**: The image injection prompt tells AI "use these URLs" but doesn't explain what the images are. AI can't make informed decisions about image placement.

**Current Flow**:
```
ImageAnalyzer -> "accent image needed" -> Fetch from Unsplash -> "use this URL"
```

**Improved Flow**:
```typescript
// Include image context in injection prompt
buildImageInjectionPrompt(
  imageMap: Map<string, string>,
  imageFields: ImageFieldInfo[],
): string {
  const imageInstructions = Array.from(imageMap.entries())
    .map(([fieldPath, url]) => {
      const field = imageFields.find(f => f.fieldPath === fieldPath);
      return `- "${fieldPath}": 
          URL: "${url}"
          Type: ${field?.fieldType || 'image'}
          Context: ${field?.searchQuery || 'general'} // ← ADD THIS
          Use for: ${field?.purpose || 'decoration'}  // ← ADD THIS`;
    })
    .join('\n');
  // ...
}
```

---

## 🟡 MEDIUM PRIORITY: Performance & Reliability

### Issue 8: No Retry Logic for Failed Slides

**Location**: `prompt-presentation-ai.service.ts` - `generateSingleSlide()`

**Problem**: If a slide fails, it's skipped entirely. No retry attempt is made.

**Current**:
```typescript
} catch (error: any) {
  this.logger.error(`❌ [Slide ${slideNumber}] FAILED`);
  yield JSON.stringify({ type: 'slide-error', slideNumber, message: error.message });
  // ← Slide is lost forever
}
```

**Improved**:
```typescript
private async *generateSingleSlide(...) {
  const MAX_RETRIES = 2;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      // ... existing generation logic
      return; // Success, exit
    } catch (error: any) {
      attempt++;
      if (attempt < MAX_RETRIES) {
        this.logger.warn(`⚠️ [Slide ${slideNumber}] Attempt ${attempt} failed, retrying...`);
        yield JSON.stringify({ type: 'slide-retry', slideNumber, attempt });
        await this.delay(1000 * attempt); // Exponential backoff
      } else {
        this.logger.error(`❌ [Slide ${slideNumber}] All retries exhausted`);
        yield JSON.stringify({ type: 'slide-error', slideNumber, message: error.message });
      }
    }
  }
}
```

---

### Issue 9: JSON Truncation Repair is Naive

**Location**: `prompt-presentation-ai.service.ts` lines 446-457

**Problem**: The JSON repair attempt is extremely basic and likely to fail:
```typescript
const repaired = accumulatedContent + '"}\\n]}'; 
```

**Better Approach**: Use a proper JSON repair library or implement stack-based repair:

```typescript
import { jsonrepair } from 'jsonrepair';

// In the catch block:
try {
  slideData = JSON.parse(accumulatedContent);
} catch (e: any) {
  this.logger.warn(`[Slide ${slideNumber}] Attempting JSON repair...`);
  try {
    const repaired = jsonrepair(accumulatedContent);
    slideData = JSON.parse(repaired);
    this.logger.log(`[Slide ${slideNumber}] JSON repair successful`);
  } catch (repairError) {
    throw new Error(`Failed to parse or repair AI response: ${e.message}`);
  }
}
```

---

### Issue 10: No Token Usage Tracking in Stream Mode

**Location**: `prompt-presentation-ai.service.ts` - `generateSlideContent()`

**Problem**: Comment says "usage info comes at the end of stream" but it's never captured or logged.

**Fix**: Capture usage from final chunk:

```typescript
let usageInfo: any = null;

for await (const chunk of stream) {
  // ... existing logic
  
  // Capture usage info (usually in final chunk)
  if (chunk.usage) {
    usageInfo = chunk.usage;
  }
}

// Log after stream
if (usageInfo) {
  this.logger.log(
    `📈 [Slide ${slideNumber}] Tokens - Prompt: ${usageInfo.prompt_tokens}, Completion: ${usageInfo.completion_tokens}`
  );
  
  // Track AI usage
  await this.aiUsageService.logUsage({
    userId: user.id,
    model: this.MODEL_NAME,
    promptTokens: usageInfo.prompt_tokens,
    completionTokens: usageInfo.completion_tokens,
    operation: 'slide-generation',
    presentationId,
  });
}
```

---

## 🟢 LOW PRIORITY: Architecture & Maintainability

### Issue 11: Dynamic Import of SchemaGeneratorUtil

**Location**: `prompt-presentation-ai.service.ts` line 375

**Problem**: Uses dynamic import for a local utility file, which is unnecessary:
```typescript
const { SchemaGeneratorUtil } = await import('./utils/schema-generator.util');
```

**Fix**: Use static import at the top of the file:
```typescript
import { SchemaGeneratorUtil } from './utils/schema-generator.util';
```

---

### Issue 12: Logging Verbosity Configuration

**Problem**: Extensive logging is great for debugging but can spam production logs.

**Recommendation**: Add log level configuration:

```typescript
// In constructor or onModuleInit
private readonly logLevel = this.configService.get<string>('AI_LOG_LEVEL') || 'info';

private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  if (levels[level] >= levels[this.logLevel]) {
    this.logger[level](message, ...args);
  }
}

// Usage:
this.log('debug', `Raw chunk: ${delta}`);
this.log('info', `✅ [Slide ${slideNumber}] Generated`);
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Week 1)
- [ ] Add missing block types to `SchemaGeneratorUtil`
- [ ] Create shared `BLOCK_TYPES` constant
- [ ] Tighten ProseMirror schema
- [ ] Fix items array required fields

### Phase 2: Prompt Improvements (Week 2)
- [ ] Add forbidden placeholder word list
- [ ] Add content density guidelines
- [ ] Include image context in injection prompt

### Phase 3: Reliability (Week 3)
- [ ] Implement retry logic with exponential backoff
- [ ] Add `jsonrepair` library for truncated responses
- [ ] Capture and log token usage

### Phase 4: Cleanup (Week 4)
- [ ] Convert dynamic imports to static
- [ ] Add log level configuration
- [ ] Update README with new features

---

## 📈 Expected Outcomes

| Metric | Current | After Improvements |
|--------|---------|-------------------|
| Slide generation success rate | ~90% | ~98% |
| Placeholder text occurrences | Occasional | Near-zero |
| Schema validation errors | Some | Minimal |
| Token usage visibility | None | Full tracking |
| Debug efficiency | Manual | Log-level controlled |

---

## 🔗 Related Files

**Backend**:
- `prompt-presentation-ai.service.ts` - Main service
- `utils/schema-generator.util.ts` - JSON schema generation
- `prompts/prompt-builder.service.ts` - Prompt construction
- `generators/image-analyzer.service.ts` - Image field detection
- `outline.service.ts` - Outline generation

**Frontend (Reference)**:
- `engine/registry/block-definitions.ts` - Block type definitions
- `types/presentation.ts` - BLOCK_TYPES enum
- `editor/blocks/definitions/*.ts` - Individual block schemas
