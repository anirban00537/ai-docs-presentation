# AI Docs & Presentation Backend ⚙️📊

<p align="center">
  <strong>Dynamic Schema Generation & Multi-Slide Presentation API Engine</strong>
</p>

<p align="center">
  Enterprise NestJS 10 API powering automated multi-slide presentation synthesis, runtime template schema introspection, dynamic structured LLM outputs, and Polar.sh monetization.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.4-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/OpenAI-Structured_Outputs-black?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Polar.sh-Billing-000000?style=for-the-badge&logo=polar&logoColor=white" alt="Polar.sh" />
</p>

---

## 🌟 Overview

The **AI Docs & Presentation Backend** is a NestJS 10 microservice that automates the generation of slide decks and formatted documents from natural language prompts, outlines, or existing notes.

### Core Capabilities:
1. **Dynamic Runtime Schema Generation**: Eliminates hardcoded block schemas by introspecting layout templates dynamically at runtime and producing strict JSON schemas for OpenAI Structured Outputs.
2. **Multi-Slide Deck Orchestrator**: Generates cohesive, multi-slide decks with intelligent typography pairing, content distribution, and layout variation (split-columns, number cards, lists, hero titles).
3. **Conversational Slide Assistant**: Server-Sent Events (SSE) streaming chat companion to iteratively modify individual slides or entire decks.
4. **Subscription Lifecycle**: Polar.sh webhook processing with cryptographic HMAC verification and atomic credit accounting.

---

## 🏛 System Modules & Architecture

```text
src/
├── modules/
│   ├── docs/                    # Core presentation & document engine
│   │   ├── docs.controller.ts   # REST endpoints for decks & slides
│   │   ├── docs.service.ts      # Deck creation, mutation & export logic
│   │   ├── docs-chat.service.ts # Real-time streaming conversational assistant
│   │   ├── dto/                 # Input validation DTOs (class-validator)
│   │   └── utils/
│   │       └── schema-generator.util.ts # Dynamic runtime JSON schema builder
│   ├── layouts/                 # Structural templates and grid systems
│   ├── themes/                  # Color palettes, typography & theme management
│   ├── images/                  # Image uploads & Backblaze B2 / AWS S3 presigned URLs
│   ├── subscription/            # Polar.sh checkout, webhooks & credit management
│   ├── auth/                    # Better-Auth, Google OAuth & JWT cookie auth
│   ├── blog/                    # Built-in Markdown SEO publishing engine
│   ├── prisma/                  # Prisma ORM client singleton & extensions
│   └── logger/                  # Structured Winston logging
└── shared/                      # Global guards, interceptors & exception filters
```

---

## 🔬 Core Engineering Innovations

### 1. Dynamic Runtime Schema Generation
Traditional LLM presentation tools rely on rigid, static schemas that frequently break when new visual block types are added.
- **Runtime Template Introspection**: `schema-generator.util.ts` inspects the exact block types required by chosen layout templates (e.g. `prosemirror`, `simple-number-card`, `image-grid`) and generates an ephemeral, strictly-typed JSON schema at runtime.
- **Zero Hallucination Output**: Guarantees that LLM outputs match the exact component contract expected by frontend renderers.

### 2. Live SSE Conversational Deck Editing
- Emits real-time token streams over Server-Sent Events (SSE) for continuous slide modifications without jarring full-page refreshes.

### 3. Enterprise Security & Payment Ledger
- **Cookie Authentication**: JWT authentication tokens stored exclusively in `httpOnly` secure cookies.
- **HMAC Signatures**: Polar.sh webhooks verify raw cryptographic signatures (`x-signature`) to prevent fraudulent credit allocations.

---

## 🔌 API Endpoint Reference

### Documents & Presentations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/docs` | Generate a new multi-slide presentation from prompt |
| `GET` | `/api/docs` | List paginated documents & decks for user |
| `GET` | `/api/docs/:id` | Get full presentation state (slides, rows, blocks, theme) |
| `PATCH`| `/api/docs/:id` | Update slide structure, order, or block content |
| `DELETE`| `/api/docs/:id` | Delete presentation and associated assets |
| `GET` | `/api/docs/:id/chat/stream` | **SSE Stream**: Conversational assistant slide modification stream |

### Layouts & Themes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/layouts` | Retrieve layout templates and structural presets |
| `GET` | `/api/themes` | Retrieve active presentation color themes |
| `POST` | `/api/themes` | Create custom theme |

### Subscriptions & Billing
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subscription/plans` | Retrieve subscription tiers |
| `POST` | `/api/subscription/checkout` | Create Polar.sh checkout session |
| `POST` | `/api/subscription/webhook` | Raw-body HMAC verified webhook consumer |
| `GET` | `/api/subscription/credits` | Check user's remaining slide generation credits |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **PostgreSQL 15+**
- **LLM API Key**: OpenAI or DeepInfra API key

### Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *Fill in your database URL, JWT secret, and OpenAI API key.*

3. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Start development server:
   ```bash
   npm run start:dev
   ```
   *The API will be live at `http://localhost:3001`.*

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
