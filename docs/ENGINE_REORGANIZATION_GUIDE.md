# Butterfast Editor Engine - Architecture Reorganization Guide

> **Created**: January 9, 2026  
> **Status**: ✅ COMPLETED  
> **Purpose**: Reorganize editor into a clean `engine` folder structure

---

## Overview

The goal is to separate **Core Engine** (the rendering/layout system) from **UI Components** (panels, modals, etc.) and **Application-specific code** (presentation logic).

---

## Current Structure Analysis

```
editor/
├── block/           # Mixed: some engine, some UI
├── blocks/          # Block definitions & components
├── components/      # Merged view components
├── core/            # Header, Background (UI)
├── icons/           # Assets
├── layout/          # Layout engine components
├── panels/          # UI panels (not engine)
├── patterns/        # Visual patterns (assets)
├── presentation/    # Presentation mode (app-specific)
├── providers/       # Context providers (engine)
├── slide/           # Slide components
├── templates/       # Slide templates (config)
├── ui/              # UI utilities
├── utils/           # Utilities
├── index.ts         # Exports
└── types.ts         # Types
```

---

## Proposed `engine/` Structure

### What Goes in `engine/`

The **engine** is responsible for:
1. **Rendering** - How blocks and slides are displayed
2. **Layout** - Row/column grid system
3. **Drag & Drop** - Block/row reordering
4. **Selection** - Focus/selection state management
5. **Resize** - Column/accent resizing
6. **Block Resolution** - Mapping types to components

---

## File Classification

### 🔧 ENGINE (Core Architecture)

| Current Path | New Path (in engine/) | Purpose |
|--------------|----------------------|---------|
| `providers/EditorDndProvider.tsx` | `engine/dnd/EditorDndProvider.tsx` | Drag & drop context |
| `providers/EditorThemeProvider.tsx` | `engine/theme/EditorThemeProvider.tsx` | Theme context |
| `block/BlockSelectionContext.tsx` | `engine/selection/BlockSelectionContext.tsx` | Focus/selection state |
| `block/BlockRenderer.tsx` | `engine/renderer/BlockRenderer.tsx` | Block type → component resolver |
| `block/BlockErrorBoundary.tsx` | `engine/renderer/BlockErrorBoundary.tsx` | Error handling |
| `components/BlockCell.tsx` | `engine/layout/BlockCell.tsx` | Block container + drag + resize |
| `components/SlideCanvas.tsx` | `engine/layout/SlideCanvas.tsx` | Slide container + frame |
| `layout/ContentRow.tsx` | `engine/layout/ContentRow.tsx` | Row layout manager |
| `layout/InsertionIndicator.tsx` | `engine/layout/InsertionIndicator.tsx` | Drop indicator |
| `layout/DragPreview.tsx` | `engine/layout/DragPreview.tsx` | Drag overlay preview |
| `blocks/block-definitions.ts` | `engine/registry/block-definitions.ts` | Block type registry |
| `blocks/factories.ts` | `engine/registry/factories.ts` | Block/row/slide factories |
| `src/hooks/useResize.ts` | `engine/hooks/useResize.ts` | Resize hook |
| `types.ts` | `engine/types.ts` | Engine types |

### 🎨 UI COMPONENTS (Keep in `editor/`)

| Path | Purpose |
|------|---------|
| `core/EditorHeader.tsx` | Page header UI |
| `core/EditorBackground.tsx` | Background styling |
| `block/BlockToolbar.tsx` | Block action buttons |
| `block/BlockTypeSelector.tsx` | Type change dropdown |
| `block/BlockOption.tsx` | Option selector |
| `block/BlockWrapper.tsx` | Wrapper with controls |
| `block/LayoutOption.tsx` | Layout option |
| `slide/SlideNavigator.tsx` | Slide sidebar navigator |
| `slide/SlideToolbar.tsx` | Slide action toolbar |
| `slide/SlideOptions.tsx` | Slide settings |
| `slide/SlideLayoutSelector.tsx` | Layout picker modal |
| `panels/*` | All sidebar panels |
| `ui/*` | Loading overlays, etc. |
| `presentation/PresentationView.tsx` | Fullscreen mode |

### 📦 BLOCK IMPLEMENTATIONS (Keep in `blocks/`)

| Path | Purpose |
|------|---------|
| `blocks/prosemirror/` | Rich text block |
| `blocks/image/` | Image block |
| `blocks/code/` | Code block |
| `blocks/[other-blocks]/` | Other block types |
| `blocks/definitions/` | Legacy content creators (for templates) |
| `blocks/utils.ts` | Block utilities |

### 🎨 ASSETS (Keep in current locations)

| Path | Purpose |
|------|---------|
| `patterns/` | Background pattern components |
| `icons/` | Custom icons |
| `templates/` | Slide layout templates |

---

## Proposed Final Structure

```
src/
├── engine/                          # 🔧 CORE ENGINE
│   ├── index.ts                     # Engine exports
│   ├── types.ts                     # Engine types
│   │
│   ├── dnd/                         # Drag & Drop System
│   │   └── EditorDndProvider.tsx
│   │
│   ├── theme/                       # Theme System
│   │   └── EditorThemeProvider.tsx
│   │
│   ├── selection/                   # Selection System
│   │   └── BlockSelectionContext.tsx
│   │
│   ├── renderer/                    # Block Rendering
│   │   ├── BlockRenderer.tsx
│   │   └── BlockErrorBoundary.tsx
│   │
│   ├── layout/                      # Layout Components
│   │   ├── SlideCanvas.tsx          # Slide frame + accent
│   │   ├── ContentRow.tsx           # Row manager
│   │   ├── BlockCell.tsx            # Block cell
│   │   ├── InsertionIndicator.tsx   # Drop indicator
│   │   └── DragPreview.tsx          # Drag overlay
│   │
│   ├── registry/                    # Block Registry
│   │   ├── block-definitions.ts     # Type → component mapping
│   │   └── factories.ts             # Instance creators
│   │
│   └── hooks/                       # Engine Hooks
│       └── useResize.ts             # Resize logic
│
├── app/(protected)/presentation/[id]/
│   └── editor/                      # 🎨 EDITOR UI
│       ├── index.ts                 # Public exports
│       │
│       ├── core/                    # App chrome
│       │   ├── EditorHeader.tsx
│       │   └── EditorBackground.tsx
│       │
│       ├── block/                   # Block UI utilities
│       │   ├── BlockToolbar.tsx
│       │   ├── BlockTypeSelector.tsx
│       │   ├── BlockOption.tsx
│       │   ├── BlockWrapper.tsx
│       │   └── LayoutOption.tsx
│       │
│       ├── slide/                   # Slide UI
│       │   ├── SlideNavigator.tsx
│       │   ├── SlideToolbar.tsx
│       │   ├── SlideOptions.tsx
│       │   └── SlideLayoutSelector.tsx
│       │
│       ├── panels/                  # Sidebar panels
│       │   ├── ToolbarPanel.tsx
│       │   ├── BlockLibraryPanel.tsx
│       │   ├── ImageLibraryPanel.tsx
│       │   ├── ThemeSelectorPanel.tsx
│       │   ├── ImagePickerModal.tsx
│       │   └── LayoutsPanel.tsx
│       │
│       ├── presentation/            # Presentation mode
│       │   └── PresentationView.tsx
│       │
│       ├── ui/                      # Generic UI
│       │   └── LoadingOverlay.tsx
│       │
│       ├── blocks/                  # Block implementations
│       │   ├── prosemirror/
│       │   ├── image/
│       │   ├── code/
│       │   ├── callout-block/
│       │   └── [other blocks]/
│       │
│       ├── patterns/                # Visual patterns
│       ├── templates/               # Slide templates
│       ├── icons/                   # Custom icons
│       └── utils/                   # Editor utilities
```

---

## Migration Steps

### Step 1: Create Engine Directory
```bash
mkdir -p src/engine/{dnd,theme,selection,renderer,layout,registry,hooks}
```

### Step 2: Move Core Files
```bash
# DnD
mv src/app/(protected)/presentation/[id]/editor/providers/EditorDndProvider.tsx src/engine/dnd/

# Theme
mv src/app/(protected)/presentation/[id]/editor/providers/EditorThemeProvider.tsx src/engine/theme/

# Selection
mv src/app/(protected)/presentation/[id]/editor/block/BlockSelectionContext.tsx src/engine/selection/

# Renderer
mv src/app/(protected)/presentation/[id]/editor/block/BlockRenderer.tsx src/engine/renderer/
mv src/app/(protected)/presentation/[id]/editor/block/BlockErrorBoundary.tsx src/engine/renderer/

# Layout
mv src/app/(protected)/presentation/[id]/editor/components/SlideCanvas.tsx src/engine/layout/
mv src/app/(protected)/presentation/[id]/editor/components/BlockCell.tsx src/engine/layout/
mv src/app/(protected)/presentation/[id]/editor/layout/ContentRow.tsx src/engine/layout/
mv src/app/(protected)/presentation/[id]/editor/layout/InsertionIndicator.tsx src/engine/layout/
mv src/app/(protected)/presentation/[id]/editor/layout/DragPreview.tsx src/engine/layout/

# Registry
mv src/app/(protected)/presentation/[id]/editor/blocks/block-definitions.ts src/engine/registry/
mv src/app/(protected)/presentation/[id]/editor/blocks/factories.ts src/engine/registry/

# Hooks
mv src/hooks/useResize.ts src/engine/hooks/

# Types
cp src/app/(protected)/presentation/[id]/editor/types.ts src/engine/types.ts
```

### Step 3: Create Engine Index
Create `src/engine/index.ts` to export all engine components.

### Step 4: Update Imports
All files that import from moved locations need to be updated to use:
```typescript
import { SlideCanvas, BlockCell, ContentRow } from "@/engine/layout";
import { EditorThemeProvider, useEditorTheme } from "@/engine/theme";
import { EditorDndProvider, useEditorDndContext } from "@/engine/dnd";
import { BlockSelectionProvider, useBlockFocus } from "@/engine/selection";
import { BLOCK_DEFINITIONS, createBlockInstance } from "@/engine/registry";
import { useResize } from "@/engine/hooks";
```

### Step 5: Update Path Alias
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/engine/*": ["src/engine/*"]
    }
  }
}
```

---

## Benefits of This Structure

1. **Clear Separation**: Engine vs UI vs App logic
2. **Reusability**: Engine can be used in other contexts (layout editor, etc.)
3. **Testability**: Engine components can be tested independently
4. **Maintainability**: Changes to rendering don't affect UI
5. **Scalability**: Easy to add new engine features

---

## Engine Responsibilities Summary

| System | Responsibility |
|--------|---------------|
| **dnd/** | Drag-drop context, sensors, collision detection |
| **theme/** | Theme context, color resolution, font family |
| **selection/** | Block focus, slide focus, click-outside handling |
| **renderer/** | Block type → React component resolution |
| **layout/** | Grid layout, resize, insertion, block cells |
| **registry/** | Block definitions, factory functions |
| **hooks/** | Reusable resize logic |

---

## Estimated Migration Effort

| Task | Time |
|------|------|
| Create folders & move files | 30 min |
| Update imports | 2-3 hours |
| Test & fix issues | 1-2 hours |
| **Total** | **4-6 hours** |

---

*This guide should be followed carefully to maintain a working codebase during migration.*
