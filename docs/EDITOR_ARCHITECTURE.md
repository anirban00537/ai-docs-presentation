# Butterfast Presentation Editor - Architecture & Optimization Guide

> **Last Updated**: January 9, 2026  
> **Status**: Active Development  
> **Purpose**: Reference document for understanding and optimizing the presentation editor

---

## Table of Contents

1. [Overview](#overview)
2. [Current Architecture](#current-architecture)
3. [Key File Locations](#key-file-locations)
4. [Data Flow](#data-flow)
5. [Issues & Technical Debt](#issues--technical-debt)
6. [Optimization Phases](#optimization-phases)
7. [Implementation Checklists](#implementation-checklists)
8. [Migration Guides](#migration-guides)

---

## Overview

The Butterfast Presentation Editor is a Notion/Gamma-style WYSIWYG editor for creating AI-powered presentations. It features:

- **Block-based editing**: ProseMirror text, images, statistics, timelines, etc.
- **Drag-and-drop**: Reorder blocks within/between rows
- **Real-time theming**: Dynamic colors, patterns, fonts
- **AI generation**: Stream slides from outline via SSE
- **Presentation mode**: Fullscreen slideshow view
- **Undo/Redo**: Full history with redux-undo

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| State Management | Redux Toolkit + redux-undo |
| Drag & Drop | @dnd-kit/core |
| Rich Text | ProseMirror (via @tiptap) |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| API | React Query + Axios |

---

## Current Architecture

### Component Hierarchy

```
src/app/(protected)/presentation/[id]/
├── page.tsx                          # Main editor page
├── hooks/
│   ├── useEditorPage.ts              # Master orchestrator hook
│   ├── useEditorDnd.ts               # Drag-and-drop logic
│   ├── useSlideGeneration.ts         # AI streaming
│   ├── useEditorSync.ts              # Auto-save debounce
│   ├── useSlideActions.ts            # Add/delete slides
│   ├── usePresentationMode.ts        # Fullscreen presentation
│   └── useUndoRedo.ts                # Keyboard shortcuts
│
└── editor/
    ├── index.ts                      # Barrel exports
    │
    ├── core/
    │   ├── EditorHeader.tsx          # Top navigation bar
    │   └── EditorBackground.tsx      # Themed background
    │
    ├── slide/
    │   ├── SlideContainer.tsx        # Slide wrapper with controls
    │   ├── SlideFrame.tsx            # Visual frame (patterns, accents)
    │   ├── SlideNavigator.tsx        # Left sidebar thumbnails
    │   ├── SlideToolbar.tsx          # Per-slide action buttons
    │   ├── SlideLayoutSelector.tsx   # Layout picker modal
    │   └── SlideOptions.tsx          # Slide settings dropdown
    │
    ├── layout/
    │   ├── ContentRow.tsx            # Row of blocks with resize
    │   ├── BlockColumn.tsx           # Individual column wrapper
    │   ├── DragPreview.tsx           # Ghost element during drag
    │   └── InsertionIndicator.tsx    # Blue line drop indicator
    │
    ├── block/
    │   ├── BlockContainer.tsx        # Focus/selection wrapper
    │   ├── BlockRenderer.tsx         # Routes to correct component
    │   ├── BlockToolbar.tsx          # Duplicate/delete actions
    │   ├── BlockTypeSelector.tsx     # Transform block modal
    │   ├── BlockSelectionContext.tsx # Focus state provider
    │   ├── BlockWrapper.tsx          # Common styling wrapper
    │   └── BlockErrorBoundary.tsx    # Error handling
    │
    ├── blocks/
    │   ├── registry.tsx              # Block type → Component map
    │   ├── factories.ts              # Block instance creators
    │   ├── definitions/              # Content creators & normalizers
    │   │   ├── index.ts              # Barrel + switch statements
    │   │   ├── prosemirror.ts
    │   │   ├── image.ts
    │   │   ├── simple-number-card.ts
    │   │   └── ... (16 total)
    │   │
    │   ├── prosemirror/              # Rich text block
    │   ├── image/                    # Image block
    │   ├── simple-number-card/       # Statistic card
    │   └── ... (18 block types total)
    │
    ├── panels/
    │   ├── ToolbarPanel.tsx          # Floating action bar
    │   ├── BlockLibraryPanel.tsx     # Block picker drawer
    │   ├── ImageLibraryPanel.tsx     # Image search/upload
    │   ├── ImagePickerModal.tsx      # Full image picker
    │   ├── ThemeSelectorPanel.tsx    # Theme customization
    │   └── LayoutsPanel.tsx          # Layout templates
    │
    ├── presentation/
    │   └── PresentationView.tsx      # Fullscreen mode overlay
    │
    ├── patterns/                     # SVG background patterns
    │   ├── index.ts
    │   ├── Gaussian.tsx
    │   ├── Aurora.tsx
    │   └── ... (15 patterns)
    │
    ├── templates/                    # Predefined layouts
    │   └── ... (21 templates)
    │
    └── ui/
        ├── LoadingOverlay.tsx
        ├── DynamicIcon.tsx
        └── ...
```

### Redux State Structure

```typescript
// src/store/slices/slidesSlice.ts

interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
  theme: Theme;
  presentation: PresentationInfo | null;
}

interface Slide {
  id: string;
  rows: Row[];
  accent?: SlideAccent;
}

interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[];  // Fr units for CSS Grid
}

interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
}

interface Theme {
  primary: string;
  secondaryColors: string[];
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily: string;
  themeType: 'light' | 'dark';
  cardDesignPattern: PatternType;
  // ... 10+ more properties
}
```

### Hook Composition Pattern

```typescript
// useEditorPage.ts - The master hook

export const useEditorPage = ({ presentationId, outlineId }) => {
  // State from Redux
  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme);
  
  // Data fetching
  const { data: presentation } = usePresentation(presentationId);
  const { data: outline } = useOutline(outlineId);
  
  // Sub-hooks for specific concerns
  const generation = useSlideGeneration({ presentationId, slidesRef });
  const dnd = useEditorDnd({ slides, commandBus });
  const actions = useSlideActions(presentationId);
  
  useEditorSync(presentationId);  // Side effect hook
  
  // Command bus for dispatching
  const commandBus = useMemo(() => createEditorCommandBus(dispatch), [dispatch]);
  
  return {
    slides, theme,
    ...dnd,           // sensors, handlers, collision detection
    ...generation,    // isGenerating, progress
    ...actions,       // handleAddSlide, handleDeleteSlide
    handleUpdateBlock: (s, b, c) => commandBus.updateBlock({ s, b, c }),
    // ... more handlers
  };
};
```

---

## Key File Locations

### Core Files (Most Important)

| File | Purpose | Lines |
|------|---------|-------|
| `src/store/slices/slidesSlice.ts` | All slide state & actions | 693 |
| `src/types/presentation.ts` | TypeScript interfaces | ~300 |
| `editor/blocks/registry.tsx` | Block type → Component map | 158 |
| `editor/blocks/definitions/index.ts` | Content factories | 132 |
| `hooks/useEditorPage.ts` | Main orchestrator | 139 |
| `hooks/useEditorDnd.ts` | Drag-and-drop logic | ~280 |
| `editor/slide/SlideContainer.tsx` | Slide wrapper | 277 |
| `editor/slide/SlideFrame.tsx` | Visual frame | 301 |
| `editor/layout/ContentRow.tsx` | Row rendering | 353 |
| `editor/layout/BlockColumn.tsx` | Column rendering | 238 |
| `editor/block/BlockContainer.tsx` | Block wrapper | 165 |

### Supporting Files

| File | Purpose |
|------|---------|
| `lib/editor/commands.ts` | Redux command bus |
| `lib/editor/adapters.ts` | API ↔ Redux converters |
| `lib/editor/card-styles.ts` | Theme presets |
| `hooks/use-presentation.ts` | React Query hook |
| `services/presentation.ts` | API calls |

---

## Data Flow

### 1. Initial Load

```
URL: /presentation/[id]?outlineId=[oid]
         │
         ▼
useEditorPage({ presentationId, outlineId })
         │
         ├──► usePresentation(id) → React Query → API → presentation data
         │
         ├──► useOutline(oid) → React Query → API → outline data
         │
         ▼
convertApiSlideToRedux() → dispatch(setSlides([...]))
         │
         ▼
If slides.length === 0 && outlineId:
    startGeneration() → SSE stream → dispatch(addSlide/updateBlock)
```

### 2. User Editing

```
User clicks on text block
         │
         ▼
BlockContainer.onClick → setFocusedBlock(slideId, blockId)
         │
         ▼
ProseMirrorBlock renders with focus
         │
         ▼
User types → TipTap onChange → onUpdate(newContent)
         │
         ▼
commandBus.updateBlock({ slideId, blockId, content })
         │
         ▼
dispatch(updateBlockContent(...)) → Redux
         │
         ▼
useEditorSync → debounced → API → saveSlide
```

### 3. Drag and Drop

```
User drags block handle
         │
         ▼
useDraggable → @dnd-kit onDragStart
         │
         ▼
useEditorDnd.handleDragStart → setActiveBlock(block)
         │
         ▼
DragOverlay renders ghost preview
         │
         ▼
User drops on row
         │
         ▼
useDroppable (ContentRow) → isOver = true
         │
         ▼
useEditorDnd.handleDragEnd → analyze drop target
         │
         ├──► Same row: dispatch(reorderBlocksInRow)
         ├──► Different row: dispatch(moveBlock)
         └──► New row insert: dispatch(addRowWithColumnsAtIndex)
```

---

## Issues & Technical Debt

### 1. Over-Nested Components (6+ Levels)

**Current depth**:
```
SlideContainer → SlideFrame → ContentRow → BlockColumn → BlockContainer → BlockRenderer → Block
```

**Problems**:
- Excessive prop drilling (9 handlers passed through)
- Debugging difficult (stack traces are huge)
- Performance: React reconciliation cascades down

### 2. Redux Slice Bloat (693 Lines, 35+ Actions)

**Redundant actions for similar operations**:
```typescript
// These all do variations of "add a row":
addRowToSlide
addRowWithColumns
addRowWithColumnsAtIndex
addRowAtTop

// These all do variations of "move a block":
moveBlock
moveBlockToNewRow
reorderBlocksInRow
```

**Repeated finder patterns**:
```typescript
// This pattern appears 40+ times:
const slide = state.slides.find((s) => s.id === slideId);
if (!slide) return;
const row = slide.rows.find((r) => r.id === rowId);
if (!row) return;
```

### 3. Block Registration Requires 4 File Changes

To add a new block type:
1. `types/presentation.ts` – Add to `BLOCK_TYPES` enum
2. `blocks/definitions/new-block.ts` – Create factory & normalizer
3. `blocks/definitions/index.ts` – Import & add to switch statements
4. `blocks/registry.tsx` – Import component & add to registry

### 4. Duplicated Resize Logic

Same mouse tracking pattern in 3 places:
- `BlockColumn.tsx` lines 88-118 (column resize)
- `SlideFrame.tsx` lines 56-97 (accent resize)
- `ContentRow.tsx` lines 114-159 (width calculations)

### 5. Theme Prop vs Redux Inconsistency

```typescript
// Some components use prop:
<SlideContainer theme={theme} />

// And then also read from Redux as fallback:
const reduxTheme = useAppSelector(selectTheme);
const theme = themeProp || reduxTheme || DEFAULT_THEME;
```

This pattern repeats in 15+ files.

### 6. Scattered DnD State

- `useEditorDnd` hook manages core DnD
- `ContentRow` has its own `DragMonitorBridge`
- `SlideContainer` has its own `DragStateBridge`
- `BlockColumn` uses `useDraggable` directly

No single source of truth for "is something being dragged".

---

## Optimization Phases

### Phase 1: Redux Slice Simplification

**Goal**: Reduce from 693 lines to ~400 lines

**Tasks**:

1. **Create slice helper utilities** (`store/utils/sliceHelpers.ts`):
   ```typescript
   export const findSlide = (state: SlidesState, slideId: string) => 
     state.slides.find(s => s.id === slideId);
   
   export const findRow = (slide: Slide | undefined, rowId: string) =>
     slide?.rows.find(r => r.id === rowId);
   
   export const findBlock = (row: Row | undefined, blockId: string) =>
     row?.blocks.find(b => b.id === blockId);
   
   export const recalculateWidths = (row: Row) => {
     row.columnWidths = row.blocks.map(() => 1);
   };
   ```

2. **Consolidate row actions**:
   ```typescript
   // Replace 4 actions with 1:
   addRow: (state, action: PayloadAction<{
     slideId: string;
     insertAt: 'top' | 'bottom' | number;
     columnCount?: number;
     blockType?: BlockType;
   }>) => {
     const slide = findSlide(state, action.payload.slideId);
     if (!slide) return;
     
     const newRow = createRowWithColumns(
       action.payload.columnCount ?? 1,
       action.payload.blockType
     );
     
     if (action.payload.insertAt === 'top') {
       slide.rows.unshift(newRow);
     } else if (action.payload.insertAt === 'bottom') {
       slide.rows.push(newRow);
     } else {
       slide.rows.splice(action.payload.insertAt, 0, newRow);
     }
   }
   ```

3. **Consolidate block movement actions**:
   ```typescript
   // Replace 3 actions with 1:
   repositionBlock: (state, action: PayloadAction<{
     slideId: string;
     sourceRowId: string;
     blockId: string;
     target: {
       rowId?: string;      // If moving to existing row
       insertIndex?: number; // Position within row
       createNewRow?: boolean;
       newRowIndex?: number;
     };
   }>) => { /* unified logic */ }
   ```

4. **Backward compatibility layer**:
   ```typescript
   // Keep old action names as aliases for gradual migration:
   export const addRowWithColumns = (payload) => addRow({
     ...payload,
     insertAt: 'bottom',
   });
   ```

**Files to modify**:
- `src/store/slices/slidesSlice.ts`
- Create `src/store/utils/sliceHelpers.ts`

**Estimated effort**: 4-6 hours

---

### Phase 2: Context-Based Theme & DnD State

**Goal**: Eliminate prop drilling for theme and drag state

**Tasks**:

1. **Create EditorThemeProvider**:
   ```typescript
   // editor/providers/EditorThemeProvider.tsx
   
   const EditorThemeContext = createContext<Theme>(DEFAULT_THEME);
   
   export const EditorThemeProvider: React.FC<{
     children: React.ReactNode;
   }> = ({ children }) => {
     const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
     return (
       <EditorThemeContext.Provider value={theme}>
         {children}
       </EditorThemeContext.Provider>
     );
   };
   
   export const useEditorTheme = () => useContext(EditorThemeContext);
   ```

2. **Create EditorDndProvider**:
   ```typescript
   // editor/providers/EditorDndProvider.tsx
   
   interface EditorDndState {
     isDragging: boolean;
     activeBlock: Block | null;
     dragType: 'block' | 'row' | 'panel-block' | null;
     dropTargetId: string | null;
   }
   
   const EditorDndContext = createContext<EditorDndState>({
     isDragging: false,
     activeBlock: null,
     dragType: null,
     dropTargetId: null,
   });
   
   export const EditorDndProvider: React.FC<{
     children: React.ReactNode;
   }> = ({ children }) => {
     const [state, setState] = useState<EditorDndState>({...});
     
     useDndMonitor({
       onDragStart: (event) => setState({...}),
       onDragEnd: () => setState({ isDragging: false, ... }),
     });
     
     return (
       <EditorDndContext.Provider value={state}>
         {children}
       </EditorDndContext.Provider>
     );
   };
   
   export const useEditorDnd = () => useContext(EditorDndContext);
   ```

3. **Combine into EditorProviders**:
   ```typescript
   // editor/EditorProviders.tsx
   
   export const EditorProviders: React.FC<{ children: React.ReactNode }> = ({
     children,
   }) => (
     <EditorThemeProvider>
       <BlockSelectionProvider>
         <EditorDndProvider>
           {children}
         </EditorDndProvider>
       </BlockSelectionProvider>
     </EditorThemeProvider>
   );
   ```

4. **Remove theme props from components** (15+ files):
   ```typescript
   // Before
   export const ContentRow: React.FC<{ theme?: Theme; ... }> = ({ theme: themeProp }) => {
     const reduxTheme = useAppSelector(selectTheme);
     const theme = themeProp || reduxTheme || DEFAULT_THEME;
     ...
   };
   
   // After
   export const ContentRow: React.FC<{ ... }> = () => {
     const theme = useEditorTheme();
     ...
   };
   ```

**Files to create**:
- `editor/providers/EditorThemeProvider.tsx`
- `editor/providers/EditorDndProvider.tsx`
- `editor/providers/index.ts`
- `editor/EditorProviders.tsx`

**Files to modify** (remove theme prop):
- `SlideContainer.tsx`
- `SlideFrame.tsx`
- `ContentRow.tsx`
- `BlockColumn.tsx`
- `BlockContainer.tsx`
- `BlockRenderer.tsx`
- Plus 10+ block components

**Estimated effort**: 3-4 hours

---

### Phase 3: Unified Block Definition System
- **Status**: ✅ Completed (Jan 9, 2026)

**Tasks**:

1. **Create unified block definition file**:
   ```typescript
   // editor/blocks/block-definitions.ts
   
   import { lazy, ComponentType } from 'react';
   import type { BlockType, BlockContent, Theme, Block } from '@/types/presentation';
   
   export interface BlockDefinition {
     type: BlockType;
     component: ComponentType<BlockComponentProps>;
     icon: ComponentType<{ size?: number }>;
     label: string;
     description: string;
     category: 'basic' | 'cards' | 'data' | 'media' | 'layout';
     createContent: () => BlockContent;
     normalizeContent: (content: unknown) => BlockContent;
     keywords?: string[];  // For search
   }
   
   export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
     prosemirror: {
       type: 'prosemirror',
       component: lazy(() => import('./prosemirror/ProseMirrorBlock')),
       icon: IconTextCaption,
       label: 'Text',
       description: 'Rich text with headings, lists, and formatting',
       category: 'basic',
       createContent: getDefaultHeadingContent,
       normalizeContent: (c) => (c && typeof c === 'object') ? c : getDefaultHeadingContent(),
       keywords: ['text', 'paragraph', 'heading'],
     },
     
     image: {
       type: 'image',
       component: lazy(() => import('./image/ImageBlock')),
       icon: IconPhoto,
       label: 'Image',
       description: 'Upload or search for images',
       category: 'media',
       createContent: () => ({ url: '', alt: '', caption: '' }),
       normalizeContent: normalizeImageContent,
       keywords: ['photo', 'picture', 'upload'],
     },
     
     // ... all 16 block types
   };
   ```

2. **Auto-generate block library UI**:
   ```typescript
   // editor/panels/BlockLibraryPanel.tsx
   
   const BLOCK_CATEGORIES = ['basic', 'cards', 'data', 'media', 'layout'] as const;
   
   export const BlockLibraryPanel = () => {
     const definitions = Object.values(BLOCK_DEFINITIONS);
     
     return (
       <div>
         {BLOCK_CATEGORIES.map(category => (
           <section key={category}>
             <h3>{category}</h3>
             {definitions
               .filter(d => d.category === category)
               .map(def => (
                 <BlockOption
                   key={def.type}
                   icon={def.icon}
                   label={def.label}
                   description={def.description}
                   onDragStart={() => startDrag(def.type)}
                 />
               ))}
           </section>
         ))}
       </div>
     );
   };
   ```

3. **Update BlockRenderer**:
   ```typescript
   // editor/block/BlockRenderer.tsx
   
   import { BLOCK_DEFINITIONS } from '../blocks/block-definitions';
   
   export const BlockRenderer = memo(({ block, onUpdate, readOnly }) => {
     const theme = useEditorTheme();
     const definition = BLOCK_DEFINITIONS[block.type] || BLOCK_DEFINITIONS.prosemirror;
     const Component = definition.component;
     
     const normalizedBlock = useMemo(
       () => ({
         ...block,
         content: definition.normalizeContent(block.content),
       }),
       [block, definition]
     );
     
     return (
       <Suspense fallback={<BlockSkeleton />}>
         <Component
           block={normalizedBlock}
           onUpdate={readOnly ? undefined : onUpdate}
           theme={theme}
           readOnly={readOnly}
         />
       </Suspense>
     );
   });
   ```

4. **Update factories**:
   ```typescript
   // editor/blocks/factories.ts
   
   import { BLOCK_DEFINITIONS } from './block-definitions';
   
   export const createBlockInstance = (type: BlockType, content?: BlockContent): Block => ({
     id: nanoid(),
     type,
     content: content ?? BLOCK_DEFINITIONS[type]?.createContent() ?? getDefaultHeadingContent(),
   });
   ```

5. **Delete obsolete files**:
   - `blocks/registry.tsx` → Replaced by `block-definitions.ts`
   - `blocks/definitions/index.ts` → Logic moved to definitions
   - Individual definition files → Merged into single file

**Files to create**:
- `editor/blocks/block-definitions.ts`

**Files to modify**:
- `editor/block/BlockRenderer.tsx`
- `editor/blocks/factories.ts`
- `editor/panels/BlockLibraryPanel.tsx`
- `editor/utils/blockTypeUtils.ts`

**Files to delete** (after migration):
- `editor/blocks/registry.tsx`
- `editor/blocks/definitions/index.ts`
- `editor/blocks/definitions/*.ts` (16 files)

**Estimated effort**: 4-5 hours

---

### Phase 4: Unified Resize Hook
- **Status**: ✅ Completed (Jan 9, 2026)

**Goal**: Single reusable hook for all resize operations

**Tasks**:

1. **Create useResize hook**:
   ```typescript
   // editor/hooks/useResize.ts
   
   interface UseResizeOptions {
     direction: 'horizontal' | 'vertical';
     onResize: (delta: number) => void;
     onResizeStart?: () => void;
     onResizeEnd?: () => void;
     minValue?: number;
     maxValue?: number;
   }
   
   export const useResize = ({
     direction,
     onResize,
     onResizeStart,
     onResizeEnd,
     minValue = 0,
     maxValue = Infinity,
   }: UseResizeOptions) => {
     const [isResizing, setIsResizing] = useState(false);
     const lastPosRef = useRef<number>(0);
     
     const handleMouseDown = useCallback((e: React.MouseEvent) => {
       e.preventDefault();
       e.stopPropagation();
       
       setIsResizing(true);
       onResizeStart?.();
       
       const pos = direction === 'horizontal' ? e.clientX : e.clientY;
       lastPosRef.current = pos;
       
       const handleMove = (moveEvent: MouseEvent) => {
         const currentPos = direction === 'horizontal' 
           ? moveEvent.clientX 
           : moveEvent.clientY;
         const delta = currentPos - lastPosRef.current;
         lastPosRef.current = currentPos;
         onResize(delta);
       };
       
       const handleUp = () => {
         setIsResizing(false);
         onResizeEnd?.();
         window.removeEventListener('mousemove', handleMove);
         window.removeEventListener('mouseup', handleUp);
       };
       
       window.addEventListener('mousemove', handleMove);
       window.addEventListener('mouseup', handleUp);
     }, [direction, onResize, onResizeStart, onResizeEnd]);
     
     return { handleMouseDown, isResizing };
   };
   ```

2. **Update BlockColumn**:
   ```typescript
   // Before: 40 lines of mouse handling
   // After:
   const { handleMouseDown, isResizing } = useResize({
     direction: 'horizontal',
     onResize: (delta) => onResize?.(index, delta),
     onResizeStart,
     onResizeEnd,
   });
   ```

3. **Update SlideFrame** (accent resize):
   ```typescript
   const { handleMouseDown, isResizing } = useResize({
     direction: accent?.position === 'top' || accent?.position === 'bottom' 
       ? 'vertical' 
       : 'horizontal',
     onResize: (delta) => {
       const containerDim = container.offsetWidth;
       const deltaPercent = (delta / containerDim) * 100;
       setLocalAccentSize(prev => Math.max(5, Math.min(100, prev + deltaPercent)));
     },
     onResizeEnd: () => onAccentResize?.(localAccentSize),
   });
   ```

**Files to create**:
- `editor/hooks/useResize.ts`

**Files to modify**:
- `layout/BlockColumn.tsx` (remove 30+ lines)
- `slide/SlideFrame.tsx` (remove 40+ lines)
- `layout/ContentRow.tsx` (simplify resize references)

**Estimated effort**: 2-3 hours

---

### Phase 5: Flatten Component Hierarchy
- **Status**: ✅ Completed (Jan 9, 2026)

**Goal**: Reduce from 6 levels to 4 levels

**This is the most invasive phase. Proceed with caution.**

**Tasks**:

1. **Merge SlideFrame into SlideContainer**:
   - Move pattern/accent rendering into SlideContainer
   - SlideContainer becomes the single visual wrapper

2. **Merge BlockColumn + BlockContainer → BlockCell**:
   ```typescript
   // editor/components/BlockCell.tsx
   
   export const BlockCell = memo(({
     block,
     slideId,
     rowId,
     index,
     totalBlocksInRow,
     onUpdate,
     isLastBlock,
     readOnly,
   }) => {
     const theme = useEditorTheme();
     const { focusedBlockId, setFocusedBlock } = useBlockFocus();
     const [isHovered, setIsHovered] = useState(false);
     
     const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
       id: `${slideId}-${block.id}`,
       data: { type: 'block', block, slideId, rowId, index },
       disabled: readOnly,
     });
     
     const { handleMouseDown, isResizing } = useResize({
       direction: 'horizontal',
       onResize: (delta) => onResizeColumn?.(index, delta),
     });
     
     const isFocused = focusedBlockId === block.id;
     
     return (
       <div
         ref={setNodeRef}
         className={cn('block-cell', { focused: isFocused, dragging: isDragging })}
         onClick={() => !readOnly && setFocusedBlock(slideId, block.id)}
       >
         {!readOnly && <DragHandle {...attributes} {...listeners} />}
         {!readOnly && isFocused && <BlockToolbar onDuplicate={...} onDelete={...} />}
         
         <BlockRenderer
           block={block}
           onUpdate={(content) => onUpdate(block.id, content)}
           readOnly={readOnly}
         />
         
         {!isLastBlock && !readOnly && (
           <ResizeHandle onMouseDown={handleMouseDown} isActive={isResizing} />
         )}
       </div>
     );
   });
   ```

3. **Inline BlockRenderer logic**:
   Since BlockRenderer is just resolving a component, inline it into BlockCell or keep as tiny utility.

**New hierarchy**:
```
SlideContainer (frame + wrapper + controls)
└── ContentRow (row + drop zone)
    └── BlockCell (column + container + renderer)
        └── [Block Component]
```

**Files to create**:
- `editor/components/BlockCell.tsx`
- `editor/components/SlideCanvas.tsx` (merged SlideContainer + SlideFrame)

**Files to delete** (after migration):
- `slide/SlideFrame.tsx`
- `layout/BlockColumn.tsx`
- `block/BlockContainer.tsx`
- `block/BlockRenderer.tsx` (optional - can keep as utility)

**Estimated effort**: 6-8 hours

---

### Phase 6: Command Pattern Expansion

**Goal**: All mutations through command bus with logging

**Tasks**:

1. **Expand command bus**:
   ```typescript
   // lib/editor/commands.ts
   
   interface CommandDefinition<T> {
     name: string;
     execute: (dispatch: AppDispatch, payload: T) => void;
     undo?: (dispatch: AppDispatch, payload: T) => void;
   }
   
   const commands: Record<string, CommandDefinition<any>> = {
     updateBlock: {
       name: 'updateBlock',
       execute: (dispatch, { slideId, blockId, content }) => {
         dispatch(updateBlockContent({ slideId, blockId, content }));
       },
     },
     repositionBlock: {
       name: 'repositionBlock',
       execute: (dispatch, payload) => {
         dispatch(repositionBlock(payload));
       },
     },
     addRow: {
       name: 'addRow',
       execute: (dispatch, { slideId, insertAt, columnCount, blockType }) => {
         dispatch(addRow({ slideId, insertAt, columnCount, blockType }));
       },
     },
     // ... all commands
   };
   
   export const createEditorCommandBus = (dispatch: AppDispatch) => ({
     execute: <T>(commandName: string, payload: T) => {
       const command = commands[commandName];
       if (!command) {
         console.error(`Unknown command: ${commandName}`);
         return;
       }
       
       if (process.env.NODE_ENV === 'development') {
         console.log(`[CMD] ${commandName}`, payload);
       }
       
       command.execute(dispatch, payload);
     },
     
     // Convenience methods
     updateBlock: (p) => commands.updateBlock.execute(dispatch, p),
     repositionBlock: (p) => commands.repositionBlock.execute(dispatch, p),
     addRow: (p) => commands.addRow.execute(dispatch, p),
     // ...
   });
   ```

2. **Add command history for debugging**:
   ```typescript
   const commandHistory: Array<{ name: string; payload: any; timestamp: number }> = [];
   
   execute: (name, payload) => {
     commandHistory.push({ name, payload, timestamp: Date.now() });
     if (commandHistory.length > 100) commandHistory.shift();
     // ...
   };
   
   getHistory: () => [...commandHistory],
   ```

**Files to modify**:
- `lib/editor/commands.ts`

**Estimated effort**: 2 hours

---

## Implementation Checklists

### Phase 1 Checklist: Redux Simplification

- [ ] Create `store/utils/sliceHelpers.ts`
- [ ] Implement `findSlide`, `findRow`, `findBlock` helpers
- [ ] Create `addRow` unified action
- [ ] Create `repositionBlock` unified action
- [ ] Add backward-compatible aliases
- [ ] Update all usages in hooks
- [ ] Run tests
- [ ] Verify undo/redo still works

### Phase 2 Checklist: Context Providers

- [ ] Create `editor/providers/EditorThemeProvider.tsx`
- [ ] Create `editor/providers/EditorDndProvider.tsx`
- [ ] Create `editor/EditorProviders.tsx`
- [ ] Wrap page.tsx with providers
- [ ] Replace `selectTheme` with `useEditorTheme` in:
  - [ ] SlideContainer.tsx
  - [ ] SlideFrame.tsx
  - [ ] ContentRow.tsx
  - [ ] BlockColumn.tsx
  - [ ] BlockContainer.tsx
  - [ ] BlockRenderer.tsx
  - [ ] All block components
- [ ] Remove DragStateBridge/DragMonitorBridge components
- [ ] Test theme switching
- [ ] Test drag and drop

### Phase 3 Checklist: Block Definitions

- [ ] Create `editor/blocks/block-definitions.ts`
- [ ] Migrate all 16 block definitions
- [ ] Update BlockRenderer to use new definitions
- [ ] Update factories.ts
- [ ] Update BlockLibraryPanel
- [ ] Test all block types
- [ ] Delete old files:
  - [ ] `blocks/registry.tsx`
  - [ ] `blocks/definitions/index.ts`
  - [ ] `blocks/definitions/*.ts`

### Phase 4 Checklist: Resize Hook

- [ ] Create `editor/hooks/useResize.ts`
- [ ] Update BlockColumn to use hook
- [ ] Update SlideFrame to use hook
- [ ] Verify column resizing works
- [ ] Verify accent resizing works
- [ ] Delete duplicate code

### Phase 5 Checklist: Component Flattening

- [ ] Create BlockCell component
- [ ] Create SlideCanvas component
- [ ] Migrate all functionality
- [ ] Update all imports
- [ ] Test thoroughly
- [ ] Delete old components:
  - [ ] SlideFrame.tsx
  - [ ] BlockColumn.tsx
  - [ ] BlockContainer.tsx

### Phase 6 Checklist: Command Pattern

- [ ] Expand command bus with all commands
- [ ] Add development logging
- [ ] Add command history
- [ ] Update hooks to use command bus
- [ ] Test all operations

---

## Migration Guides

### Adding a New Block Type (After Phase 3)

1. Create block component:
   ```typescript
   // editor/blocks/my-new-block/MyNewBlock.tsx
   
   export const MyNewBlock: React.FC<BlockComponentProps> = ({
     block,
     onUpdate,
     theme,
     readOnly,
   }) => {
     // Implementation
   };
   ```

2. Add to block definitions:
   ```typescript
   // editor/blocks/block-definitions.ts
   
   import { MyNewBlock } from './my-new-block/MyNewBlock';
   
   export const BLOCK_DEFINITIONS = {
     // ... existing blocks
     
     my_new_block: {
       type: 'my_new_block',
       component: lazy(() => import('./my-new-block/MyNewBlock')),
       icon: IconStar,
       label: 'My New Block',
       description: 'Does something cool',
       category: 'cards',
       createContent: () => ({ title: 'New', value: 0 }),
       normalizeContent: (c) => ({
         title: (c as any)?.title || 'New',
         value: (c as any)?.value || 0,
       }),
     },
   };
   ```

3. Add type to TypeScript:
   ```typescript
   // types/presentation.ts
   
   export const BLOCK_TYPES = {
     // ... existing
     MY_NEW_BLOCK: 'my_new_block',
   } as const;
   ```

That's it! The block will automatically:
- Appear in the block library
- Support drag and drop
- Be normalized correctly
- Work with undo/redo

---

## Appendix: Type Definitions

### Core Types

```typescript
// types/presentation.ts

export const BLOCK_TYPES = {
  PROSEMIRROR: 'prosemirror',
  IMAGE: 'image',
  CODE: 'code',
  SPACER: 'spacer',
  SIMPLE_NUMBER_CARD: 'simple_number_card',
  LAYERED_NUMBER_BLOCK: 'layered_number_block',
  CALLOUT_BLOCK: 'callout_block',
  SOLID_BOX_BLOCK: 'solid_box_block',
  SOLID_ICON_BOX_BLOCK: 'solid_icon_box_block',
  SIDELINE_CARD_BLOCK: 'sideline_card_block',
  BUTTON_BLOCK: 'button_block',
  LEAF_BLOCK: 'leaf_block',
  TIMELINE_BENTO_BLOCK: 'timeline_bento_block',
  STACKED_TIMELINE_BLOCK: 'stacked_timeline_block',
  CONNECTED_STEPS_BLOCK: 'connected_steps_block',
  CIRCLE_STATS_BLOCK: 'circle_stats_block',
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[];
}

export interface Slide {
  id: string;
  rows: Row[];
  accent?: SlideAccent;
}

export interface SlideAccent {
  position: 'left' | 'right' | 'top' | 'bottom' | 'background';
  size: number;
  url?: string;
}

export interface Theme {
  primary: string;
  secondaryColors: string[];
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily: string;
  themeType: 'light' | 'dark';
  cardDesignPattern: PatternType;
  borderColor: string;
  cardBorderRadius: string;
  cardBoxShadow: string;
  cardBorderWidth: string;
  cardBorderStyle: string;
  cardBackdropBlur: string;
  cardDesignPatternOpacity: number;
  cardOpacity: number;
  cardNoiseOpacity?: number;
  cardVignetteOpacity?: number;
}
```

---

## 🧹 CLEANUP PLAN: Consolidating to Clean Architecture

> **Created**: January 9, 2026  
> **Status**: ✅ EXECUTED (Jan 9, 2026)  
> **Priority**: HIGH - Architecture is currently messy with duplicate components

### Current Problem

The editor currently has **duplicate components** after Phase 5:
- New components (`BlockCell`, `SlideCanvas`) coexist with old ones
- Both old and new are exported, confusing the codebase
- Different parts of the app use different components

### Current File Status

| Directory | File | Status | Action |
|-----------|------|--------|--------|
| `components/` | `BlockCell.tsx` | ✅ NEW | **KEEP** |
| `components/` | `SlideCanvas.tsx` | ✅ NEW | **KEEP** |
| `block/` | `BlockContainer.tsx` | ❌ OLD | **DELETE** |
| `block/` | `BlockRenderer.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `BlockToolbar.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `BlockSelectionContext.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `BlockErrorBoundary.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `BlockTypeSelector.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `BlockWrapper.tsx` | ❓ CHECK | Check if used |
| `block/` | `BlockOption.tsx` | ✅ ACTIVE | **KEEP** |
| `block/` | `LayoutOption.tsx` | ✅ ACTIVE | **KEEP** |
| `layout/` | `BlockColumn.tsx` | ❌ OLD | **DELETE** |
| `layout/` | `ContentRow.tsx` | ✅ UPDATED | Uses BlockCell now |
| `layout/` | `DragPreview.tsx` | ✅ ACTIVE | **KEEP** |
| `layout/` | `InsertionIndicator.tsx` | ✅ ACTIVE | **KEEP** |
| `slide/` | `SlideContainer.tsx` | ❌ OLD | **DELETE** |
| `slide/` | `SlideFrame.tsx` | ❌ OLD | **DELETE** |
| `slide/` | `SlideNavigator.tsx` | ⚠️ UPDATE | Migrate to SlideCanvas |
| `slide/` | `SlideToolbar.tsx` | ✅ ACTIVE | **KEEP** |
| `slide/` | `SlideLayoutSelector.tsx` | ✅ ACTIVE | **KEEP** |
| `slide/` | `SlideOptions.tsx` | ✅ ACTIVE | **KEEP** |
| `hooks/` | `useResize.ts` | ✅ NEW | **KEEP** |
| `blocks/` | `block-definitions.ts` | ✅ NEW | **KEEP** |
| `blocks/` | `definitions/index.ts` | ⚠️ LEGACY | Migrate templates, then DELETE |

---

### Step-by-Step Cleanup Tasks

#### Task 1: Migrate SlideNavigator to SlideCanvas
```
File: slide/SlideNavigator.tsx
Change: Replace SlideContainer import with SlideCanvas
Lines: ~3-6, ~anywhere SlideContainer is used
```

#### Task 2: Migrate PresentationView to SlideCanvas  
```
File: presentation/PresentationView.tsx
Change: Replace SlideContainer with SlideCanvas
```

#### Task 3: Update page.tsx if needed
```
File: [id]/page.tsx  
Change: Ensure using SlideNavigator (which will use SlideCanvas)
```

#### Task 4: Delete Old Components
Once all references updated:
```bash
# DELETE these files:
rm src/app/(protected)/presentation/[id]/editor/block/BlockContainer.tsx
rm src/app/(protected)/presentation/[id]/editor/layout/BlockColumn.tsx  
rm src/app/(protected)/presentation/[id]/editor/slide/SlideContainer.tsx
rm src/app/(protected)/presentation/[id]/editor/slide/SlideFrame.tsx
```

#### Task 5: Update index.ts Exports
```typescript
// REMOVE these exports:
export { SlideContainer } from "./slide/SlideContainer";
export { SlideFrame } from "./slide/SlideFrame";
export { BlockContainer } from "./block/BlockContainer";

// KEEP these exports:
export { SlideCanvas } from "./components/SlideCanvas";
export { BlockCell } from "./components/BlockCell";
```

#### Task 6: Migrate Template Files to BLOCK_DEFINITIONS
Files in `blocks/definitions/` are still used by templates.
Migrate template imports, then delete `definitions/index.ts`.

---

### Target Clean Architecture

```
editor/
├── components/           # Main UI components
│   ├── BlockCell.tsx     # Block + drag + resize + toolbar
│   └── SlideCanvas.tsx   # Slide + frame + accent + patterns
├── block/                # Block utilities
│   ├── BlockRenderer.tsx
│   ├── BlockToolbar.tsx  
│   ├── BlockSelectionContext.tsx
│   ├── BlockErrorBoundary.tsx
│   └── BlockOption.tsx
├── layout/               # Layout utilities
│   ├── ContentRow.tsx
│   ├── DragPreview.tsx
│   └── InsertionIndicator.tsx
├── slide/                # Slide utilities
│   ├── SlideNavigator.tsx
│   ├── SlideToolbar.tsx
│   └── SlideLayoutSelector.tsx
├── blocks/               # Block definitions & components
│   ├── block-definitions.ts  # Single source of truth
│   ├── factories.ts
│   └── [block-type]/         # Individual block components
├── hooks/                # Shared hooks
│   └── useResize.ts
├── providers/            # Context providers
│   ├── EditorThemeProvider.tsx
│   └── EditorDndProvider.tsx
├── panels/               # Sidebar panels
├── patterns/             # Background patterns
├── templates/            # Slide templates
└── types.ts              # Shared types
```

### Component Hierarchy After Cleanup

```
EditorPage
└── EditorThemeProvider
    └── EditorDndProvider
        └── SlideNavigator
            └── SlideCanvas          ← Merged (Container + Frame)
                └── ContentRow
                    └── BlockCell    ← Merged (Column + Container)
                        └── BlockRenderer
                            └── [Block Component]
```

**Nesting Levels**: 4 (down from 6)

---

### Files to DELETE (After Migration)

| File | Reason |
|------|--------|
| `block/BlockContainer.tsx` | Merged into BlockCell |
| `layout/BlockColumn.tsx` | Merged into BlockCell |
| `slide/SlideContainer.tsx` | Merged into SlideCanvas |
| `slide/SlideFrame.tsx` | Merged into SlideCanvas |
| `blocks/registry.tsx` | Already deleted |
| `docs/PHASE_5_SUMMARY.md` | Temporary, can delete |

### Estimated Cleanup Time: 1-2 hours

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-01-09 | Added cleanup plan for Phase 5 consolidation |
| 1.0 | 2026-01-09 | Initial architecture documentation |

---

*This document should be updated whenever significant architectural changes are made.*
