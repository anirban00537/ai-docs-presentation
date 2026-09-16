# Prompt Doc AI Module

A beautifully organized, modular service for AI-powered doc card generation using OpenRouter.

## 📁 Structure

```
prompt-doc-ai/
├── generators/             # Image processing services
│   ├── image-analyzer.service.ts
│   └── image-fetcher.service.ts
├── interfaces/             # TypeScript interfaces
│   ├── image-analysis.interface.ts
│   └── outline.interface.ts
├── prompts/                # AI prompt builders
│   └── prompt-builder.service.ts
├── utils/                  # Utility functions
│   └── schema-generator.util.ts
├── prompt-doc-ai.service.ts  # Main orchestration service
└── README.md               # This file
```

## 🎯 Core Services

### Main Service
**`PromptDocAIService`**
- Main orchestration service for card generation
- Manages the complete card generation workflow
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
- Generates complete card generation prompts
- Ensures consistent formatting and instructions

### Utilities
**`DynamicSchemaUtil`**
- Dynamically generates JSON schemas by introspecting template data at runtime
- Ensures AI output strictly follows the structure of ANY input layout template
- No hardcoded block type mapping required
- Enables standard JSON parsing without custom cleaning

## 🔧 Usage

Import the services directly from their files:

```typescript
import { PromptDocAIService } from './prompt-doc-ai/prompt-doc-ai.service';
import { ImageAnalyzerService } from './prompt-doc-ai/generators/image-analyzer.service';
import { ImageFetcherService } from './prompt-doc-ai/generators/image-fetcher.service';
import { PromptBuilderService } from './prompt-doc-ai/prompts/prompt-builder.service';
```

### Generating Cards

```typescript
// Inject the service
constructor(
  private readonly promptDocAIService: PromptDocAIService,
) {}

// Generate cards from a doc
async generateCards(docId: string, user: User) {
  for await (const event of this.promptDocAIService
    .generateAndSaveCardsFromDoc(docId, user)) {
    const data = JSON.parse(event);
    
    switch (data.type) {
      case 'start':
        console.log(`Starting generation of ${data.totalCards} cards`);
        break;
      case 'card':
        console.log(`Generated card ${data.cardNumber}`);
        break;
      case 'complete':
        console.log('Generation complete!');
        break;
      case 'card-error':
        console.error(`Error on card ${data.cardNumber}: ${data.message}`);
        break;
    }
  }
}
```

## 📊 Event Types

The generator yields JSON-stringified events:

| Type | Description | Properties |
|------|-------------|------------|
| `start` | Generation started | `totalCards` |
| `card-start` | Card generation started | `cardNumber`, `totalCards` |
| `card` | Card generated successfully | `cardNumber`, `cardId`, `data` |
| `card-error` | Card generation failed | `cardNumber`, `message` |
| `complete` | All cards generated | `totalCards` |

## 🔍 Features

### Intelligent Image Handling
- Automatically detects image fields in layouts
- Generates contextual search queries
- Fetches and injects images from Unsplash
- Supports multiple image types (accent, avatar, gallery, etc.)

### Robust JSON Processing
- Uses native JSON Schema / Structured Output
- Guranteed valid JSON directly from the LLM
- Standard JSON parsing with no maintenance overhead

### Comprehensive Logging
- Detailed progress logging for each card
- AI token usage tracking
- Performance metrics
- Error reporting

### Fallback Mechanisms
- Template-based fallback for failed parsing
- Graceful error handling
- Continues generation on individual card failures

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
- Uses AI model defined in `coreConstant.AI_MODELS.CARDS.NAME`
- Uses Structured Output (JSON Schema) for guaranteed type safety and reliability
- No barrel exports - all imports are direct file paths for clarity

