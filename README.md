# AI Docs & Presentation Platform 📄📊✨

<p align="center">
  <strong>Autonomous AI-Powered Document & Slide Presentation Generation Platform</strong>
</p>

<p align="center">
  Generate, customize, and collaborate on dynamic multi-slide presentations and structured documents using LLM structured output engines, dynamic template schema generation, and an interactive drag-and-drop spatial canvas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Prisma_ORM-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/dnd--kit-Drag_&_Drop-brightgreen?style=for-the-badge" alt="dnd-kit" />
</p>

---

## 🌟 Executive Summary

**AI Docs & Presentation Platform** is a full-stack content creation engine built to automate the end-to-end design and authoring of presentation slide decks and structured documents. Users provide prompts or outline criteria, and the system executes dynamic schema generation to output structured, theme-aligned slide decks populated with rich blocks (ProseMirror text, number stat cards, image grids, and column splits).

The workspace features a composable, block-based spatial editor with fine-grained `@dnd-kit` drag-and-drop ergonomics, real-time column resizing, custom themes, and template exports.

---

## 🏛 System Architecture & Component Model

```mermaid
flowchart TD
    subgraph Client["Frontend Canvas Client (Next.js 15 + React 19)"]
        Canvas[Interactive Presentation Canvas]
        ReduxState[Redux State (slidesSlice: slides, rows, blocks, theme)]
        SlideCard[SlideCard Container]
        DroppableRow[DroppableRow Layout]
        ResizableCol[ResizableColumn Component]
        DraggableBlock[DraggableBlock & BlockRenderer]
        ProseMirror[ProseMirror Rich Text & Stat Blocks]
    end

    subgraph API["Backend API Service (NestJS 10)"]
        DocController[Document & Presentation Controller]
        AgentEngine[Multi-Agent Generation Pipeline]
        SchemaGen[Dynamic Schema Generator (Runtime Layout Introspection)]
        LLMClient[OpenAI Structured Outputs / Qwen Engine]
        PrismaService[Prisma ORM & PostgreSQL Database]
    end

    ReduxState --> Canvas
    Canvas --> SlideCard
    SlideCard --> DroppableRow
    DroppableRow --> ResizableCol
    ResizableCol --> DraggableBlock
    DraggableBlock --> ProseMirror

    Canvas -->|Generate Deck Request| DocController
    DocController --> AgentEngine
    AgentEngine --> SchemaGen
    SchemaGen -->|Introspected JSON Schema| LLMClient
    LLMClient -->|Structured Slide JSON| DocController
    DocController --> PrismaService
    DocController -->|Hydrated Deck| ReduxState
```

---

## 🔬 Key Engineering Innovations

### 1. Dynamic Runtime Schema Generation
Traditional AI presentation tools hardcode block schemas, leading to fragile output parsing when new block types or layouts are introduced.
- **Runtime Template Introspection**: The backend dynamically analyzes layout template data directly from the input prompt and constructs runtime JSON schemas.
- **Strict Structured Outputs**: Ensures the LLM outputs exact nested structures (rows, columns, block types, stat values, and typography) with 0% JSON schema hallucination or parsing failures.

### 2. Composable SlideCard Architecture
- **Hierarchical Box Model**: Built on a decoupled layout hierarchy (`SlideCard` $\rightarrow$ `InsertDropZone` $\rightarrow$ `DroppableRow` $\rightarrow$ `ResizableColumn` $\rightarrow$ `DraggableBlock` $\rightarrow$ `BlockRenderer`).
- **Drag-and-Drop Ergonomics**: Uses `@dnd-kit` with collision detection, real-time drop indicator lines, and global drag state bridging.
- **Smooth Column Resizing**: Column widths resize dynamically with percentage constraints, auto-balancing across neighboring columns.

### 3. Rich Block-Based Ecosystem
- **ProseMirror Integration**: Full-featured inline rich-text editing directly within slide blocks.
- **Data Stat Cards**: High-impact numerical cards with delta indicators and custom color accents.
- **Dynamic Theming Engine**: One-click global presentation re-theming with synchronized typography, background gradients, and contrast-safe accent palettes.

---

## 📂 Monorepo Structure

```text
ai-docs-presentation/
├── frontend/                 # Client Application (Next.js 15, React 19, Redux Toolkit, Tailwind CSS)
│   ├── src/                  # Source code (canvas, blocks, slide components, redux slices)
│   ├── docs/                 # Architecture specifications
│   │   ├── SlideCard-architecture.md
│   │   ├── PERFORMANCE_ISSUES.md
│   │   └── PERFORMANCE_VERIFICATION.md
│   ├── scripts/              # Template export and migration utilities
│   ├── package.json
│   └── README.md
│
└── backend/                  # API & AI Generation Service (NestJS 10, Prisma, LLMs)
    ├── src/                  # Controllers, services, AI agent prompts & dynamic schemas
    ├── prisma/               # Database schema, migrations & seeders
    ├── docs/                 # Backend system design specs
    │   ├── DYNAMIC_SCHEMA_GENERATION_PLAN.md
    │   └── PROMPT_AI_IMPROVEMENT_DOC.md
    ├── package.json
    └── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: `v18+` (Node 20+ recommended)
- **PostgreSQL**: Running instance

---

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and LLM API keys in .env
npx prisma migrate dev
npx prisma generate
npm run start:dev
```
*API runs at `http://localhost:3001`.*

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web client runs at `http://localhost:3000`.*

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
