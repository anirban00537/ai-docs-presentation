# AI Docs & Presentation Frontend 📄🎨

<p align="center">
  <strong>Dynamic Slide Deck Canvas & Presentation Builder Client</strong>
</p>

<p align="center">
  High-performance Next.js 15 & React 19 application featuring an interactive presentation canvas, ProseMirror rich text blocks, SlideCard hierarchical architecture, and `@dnd-kit` drag-and-drop layout composition.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/dnd--kit-Drag_&_Drop-brightgreen?style=for-the-badge" alt="dnd-kit" />
</p>

---

## 🌟 Overview

The **AI Docs & Presentation Frontend** is a visual presentation authoring environment. It provides a real-time spatial canvas where users can generate slide decks from text outlines, rearrange blocks using drag-and-drop, resize columns fluidly, and customize themes with real-time contrast calculations.

---

## ✨ Feature Suite

### 1. Composable SlideCard Architecture
- Decoupled structural hierarchy:
  - `SlideCard`: Slide container managing slide-level theme, order, and dimensions.
  - `InsertDropZone`: Reactive drop zones located between rows and blocks for new content insertion.
  - `DroppableRow`: Flexible row layout supporting responsive multi-column splits.
  - `ResizableColumn`: Percentage-based column resizing with neighbor balancing.
  - `DraggableBlock`: Block container equipped with property inspectors and drag handles.
  - `BlockRenderer`: Renders concrete block types (ProseMirror rich text, data stat cards, image grids).

### 2. Rich Text & Content Blocks
- **ProseMirror Editing**: Seamless inline formatting (headings, lists, bold/italic, code) directly inside slide blocks.
- **Data Stat Cards**: Visual metrics with percentage indicators and accent badges.

### 3. Drag-and-Drop Ergonomics (`@dnd-kit`)
- Drag-and-drop across rows and slides with animated drop preview lines.
- Global drag state bridging for smooth performance across large multi-slide decks.

### 4. Real-Time Conversational AI Assistant
- Inline assistant streaming updates via Server-Sent Events (SSE).
- Modifies individual slides or global presentation layouts dynamically without page reloads.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18+` (Node 20+ recommended)
- **Backend Service**: Running instance of the `backend/` service at `http://localhost:3001`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server |
| `npm run build` | Compiles production build |
| `npm run start` | Runs production server |
| `npm run lint` | Checks code quality and ESLint rules |

---

## 👤 Author

**Anirban Roy**  
- GitHub: [@anirban00537](https://github.com/anirban00537)  
- Email: [anirban00537@gmail.com](mailto:anirban00537@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License**.
