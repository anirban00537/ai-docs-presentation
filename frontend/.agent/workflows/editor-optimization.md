# Editor Optimization Workflow

## Description
How to continue the presentation editor optimization project across multiple phases.

## Quick Reference

Read the full architecture document first:
```
docs/EDITOR_ARCHITECTURE.md
```

## Phases Overview

### Phase 1: Redux Slice Simplification
- **Status**: ✅ Completed (Jan 9, 2026)
- **Files**: `src/store/slices/slidesSlice.ts`, `src/store/utils/sliceHelpers.ts`
- **Goal**: Reduce from 693 lines to ~400 lines (Reduced by ~100 lines while adding more functionality)
- **Key tasks**: Consolidate row actions, consolidate block movement actions, create helpers

### Phase 2: Context-Based Theme & DnD State
- **Status**: Not Started
- **Files**: Create `editor/providers/` directory
- **Goal**: Eliminate prop drilling
- **Key tasks**: Create EditorThemeProvider, EditorDndProvider, remove theme props from 15+ files

### Phase 3: Unified Block Definition System
- **Status**: ✅ Completed (Jan 9, 2026)
- **Files**: Create `editor/blocks/block-definitions.ts`
- **Goal**: Single source of truth for block types
- **Key tasks**: Merge registry + definitions, auto-generate block library

### Phase 4: Unified Resize Hook
- **Status**: ✅ Completed (Jan 9, 2026)
- **Files**: Create `editor/hooks/useResize.ts`
- **Goal**: Deduplicate resize logic
- **Key tasks**: Create hook, update BlockColumn, SlideFrame

### Phase 5: Flatten Component Hierarchy
- **Status**: ✅ Completed (Jan 9, 2026)
- **Files**: Create BlockCell, SlideCanvas components
- **Goal**: Reduce nesting from 6 to 4 levels
- **Key tasks**: Merge SlideFrame into SlideContainer, merge BlockColumn + BlockContainer

### Phase 6: Command Pattern Expansion
- **Status**: Not Started
- **Files**: `lib/editor/commands.ts`
- **Goal**: All mutations through command bus
- **Key tasks**: Expand commands, add logging, add history

## Starting a Phase

// turbo
1. Read the full architecture doc: `cat docs/EDITOR_ARCHITECTURE.md`

2. Check the phase checklist in the architecture doc

3. Make changes incrementally, testing after each major modification

4. Run the build to verify: `npm run build`

5. Mark completed items in the architecture doc

## Important Files to Know

| Purpose | File |
|---------|------|
| Redux state | `src/store/slices/slidesSlice.ts` |
| Types | `src/types/presentation.ts` |
| Main editor page | `src/app/(protected)/presentation/[id]/page.tsx` |
| Editor hooks | `src/app/(protected)/presentation/[id]/hooks/` |
| Block registry | `src/app/(protected)/presentation/[id]/editor/blocks/registry.tsx` |
| Command bus | `src/lib/editor/commands.ts` |

## Testing After Changes

// turbo-all
1. Run type check: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Test the editor manually:
   - Create new presentation
   - Add/remove slides
   - Drag blocks between rows
   - Resize columns
   - Change themes
   - Undo/Redo
