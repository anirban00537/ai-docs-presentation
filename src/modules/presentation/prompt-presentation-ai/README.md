# Prompt Presentation AI Module

A beautifully organized, modular service for AI-powered presentation slide generation using OpenRouter.

## 📁 Structure

```
prompt-presentation-ai/
├── generators/             # Image processing services
│   ├── image-analyzer.service.ts
│   └── image-fetcher.service.ts
├── interfaces/             # TypeScript interfaces
│   ├── image-analysis.interface.ts
│   └── outline.interface.ts
├── prompts/                # AI prompt builders
│   └── prompt-builder.service.ts
├── utils/                  # Utility functions
│   └── json-cleaner.util.ts
├── prompt-presentation-ai.service.ts  # Main orchestration service
└── README.md               # This file
```

## 🎯 Core Services

### Main Service
**`PromptPresentationAIService`**
- Main orchestration service for slide generation
- Manages the complete slide generation workflow
- Handles OpenRouter SDK initialization
- Coordinates between all sub-services

### Generator Services
**`ImageAnalyzerService`**
- Analyzes layout schemas to detect image fields
- Uses AI to generate contextual Unsplash search queries
- Returns structured analysis results

**`ImageFetcherService`**
- Fetches images from Unsplash based on analysis
- Maps images to their corresponding layout fields
- Handles errors gracefully

### Prompt Service
**`PromptBuilderService`**
- Builds image injection prompts
- Constructs layout structure prompts
- Generates complete slide generation prompts
- Ensures consistent formatting and instructions

### Utilities
**`JsonCleanerUtil`**
- Cleans markdown code block wrappers
- Repairs malformed JSON
- Extracts valid JSON with multiple fallback strategies

**`UrlSanitizerUtil`**
- Sanitizes malformed URLs in JSON
- Fixes duplicate query string separators
- Ensures valid URL format

## 🔧 Usage

Import the services directly from their files:

```typescript
import { PromptPresentationAIService } from './prompt-presentation-ai/prompt-presentation-ai.service';
import { ImageAnalyzerService } from './prompt-presentation-ai/generators/image-analyzer.service';
import { ImageFetcherService } from './prompt-presentation-ai/generators/image-fetcher.service';
import { PromptBuilderService } from './prompt-presentation-ai/prompts/prompt-builder.service';
```

### Generating Slides

```typescript
// Inject the service
constructor(
  private readonly promptPresentationAIService: PromptPresentationAIService,
) {}

// Generate slides from a presentation
async generateSlides(presentationId: string, user: User) {
  for await (const event of this.promptPresentationAIService
    .generateAndSaveSlidesFromPresentation(presentationId, user)) {
    const data = JSON.parse(event);
    
    switch (data.type) {
      case 'start':
        console.log(`Starting generation of ${data.totalSlides} slides`);
        break;
      case 'slide':
        console.log(`Generated slide ${data.slideNumber}`);
        break;
      case 'complete':
        console.log('Generation complete!');
        break;
      case 'slide-error':
        console.error(`Error on slide ${data.slideNumber}: ${data.message}`);
        break;
    }
  }
}
```

## 📊 Event Types

The generator yields JSON-stringified events:

| Type | Description | Properties |
|------|-------------|------------|
| `start` | Generation started | `totalSlides` |
| `slide-start` | Slide generation started | `slideNumber`, `totalSlides` |
| `slide` | Slide generated successfully | `slideNumber`, `slideId`, `data` |
| `slide-error` | Slide generation failed | `slideNumber`, `message` |
| `complete` | All slides generated | `totalSlides` |

## 🔍 Features

### Intelligent Image Handling
- Automatically detects image fields in layouts
- Generates contextual search queries
- Fetches and injects images from Unsplash
- Supports multiple image types (accent, avatar, gallery, etc.)

### Robust JSON Processing
- Handles malformed AI responses
- Cleans markdown wrappers
- Repairs incomplete JSON
- Sanitizes URLs

### Comprehensive Logging
- Detailed progress logging for each slide
- AI token usage tracking
- Performance metrics
- Error reporting

### Fallback Mechanisms
- Template-based fallback for failed parsing
- Graceful error handling
- Continues generation on individual slide failures

## 🎨 Architecture Benefits

### Separation of Concerns
Each service has a single, well-defined responsibility:
- **Main Service**: Orchestration and workflow
- **Image Services**: Image analysis and fetching
- **Prompt Service**: AI prompt construction
- **Utils**: Reusable helper functions

### Testability
- Services are independently testable
- Clear input/output contracts
- Easy to mock dependencies

### Maintainability
- Related code is grouped together
- Clear file and folder structure
- Comprehensive documentation

### Scalability
- Easy to add new features
- Simple to extend existing functionality
- Clear extension points

## 🔗 Dependencies

- `@nestjs/common` - NestJS framework
- `@prisma/client` - Database access
- `@openrouter/sdk` - AI model access
- Internal modules:
  - `PrismaService`
  - `AiUsageService`
  - `ImagesService`

## 📝 Notes

- All services use dependency injection
- Logging uses NestJS Logger
- Configured via environment variables
- Uses AI model defined in `coreConstant.AI_MODELS.SLIDES.NAME`
- Uses plain JSON object mode (not strict JSON Schema) for flexible AI responses
- No barrel exports - all imports are direct file paths for clarity

