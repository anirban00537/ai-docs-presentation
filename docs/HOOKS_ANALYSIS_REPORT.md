# 📊 Hooks Analysis Report

> **Date**: January 9, 2026  
> **Location**: `src/app/(protected)/presentation/[id]/hooks/`  
> **Total Files**: 13 hooks + 1 duplicate in engine

---

## 🔴 CRITICAL: Duplicate Files

### 1. `useResize.ts` - **100% DUPLICATE**

| Location | Size |
|----------|------|
| `[id]/hooks/useResize.ts` | 1,504 bytes |
| `[id]/engine/hooks/useResize.ts` | 1,504 bytes |

**Files are IDENTICAL (byte-for-byte copy)**. Only one should exist.

**Recommendation**: Delete `[id]/hooks/useResize.ts` and use the engine version.

---

## 🟠 UNUSED Files

### 1. `useResizeDrag.ts` - **COMPLETELY UNUSED**

| Export | Usage |
|--------|-------|
| `useResize` (line 15) | Only in its own file (conflicts with actual useResize hook) |
| `useDragDetection` (line 74) | Only in its own file |

**Problem**: Contains similar functionality to `useResize.ts` but with a different API. Also exports a function named `useResize` which creates naming conflicts.

**Recommendation**: **DELETE** - Unused and creates confusion.

---

### 2. `useEditorActions.ts` - **UNUSED**

| Function | Used? |
|----------|-------|
| `handleUpdateBlock` | ❌ Defined here but reimplemented in `useEditorPage.ts` |
| `handleDeleteRow` | ❌ Defined here but reimplemented in `useEditorPage.ts` |
| `handleAddColumn` | ❌ Defined here but reimplemented in `useEditorPage.ts` |
| `handleAddRowAtTop` | ❌ Defined here but reimplemented in `useEditorPage.ts` |
| `handleAddRowAtBottom` | ❌ Defined here but reimplemented in `useEditorPage.ts` |
| `handleUpdateColumnWidths` | ❌ Defined here but reimplemented in `useEditorPage.ts` |

**Problem**: `useEditorPage.ts` has its own action handlers (lines 89-109) that duplicate this hook's functionality.

**Recommendation**: Either:
1. **DELETE** this file and keep inline handlers in `useEditorPage`
2. OR refactor `useEditorPage` to use this hook (DRY principle)

---

### 3. `useDebounce.ts` - **PARTIALLY UNUSED**

| Export | Used? |
|--------|-------|
| `useDebounce` | ❌ Not used anywhere |
| `useThrottle` | ❌ Not used anywhere |

**Recommendation**: **DELETE** unless planning future use.

---

## 🟡 Overlapping/Redundant Code

### 1. `useEditorDnd.ts` vs Engine's `EditorDndProvider.tsx`

| File | Lines | Purpose |
|------|-------|---------|
| `hooks/useEditorDnd.ts` | 276 | DnD logic hook |
| `engine/dnd/EditorDndProvider.tsx` | Different | DnD context provider |

**Analysis**: These complement each other - the hook is used by the provider. **KEEP BOTH**.

---

### 2. `useSlideActions.ts` - Has Dead Code

```typescript
// Lines 85-101: handleDuplicateSlide is incomplete
const handleDuplicateSlide = async (slideId: string) => {
  // Wait, slidesSlice has duplicateSlide, but it generates its own random ID.
  // For now, let's just use addSlide with content for simplicity...
};
```

**Problem**: Function is incomplete and has TODO comments.

**Recommendation**: Complete implementation or remove.

---

## 📊 Usage Summary Table

| Hook File | Used By | Status |
|-----------|---------|--------|
| `use-outline.ts` | `useEditorPage`, `useSlideGeneration`, outline page | ✅ USED |
| `use-themes.ts` | ? | ⚠️ CHECK |
| `useDebounce.ts` | Nothing | ❌ UNUSED |
| `useEditorActions.ts` | Nothing | ❌ UNUSED (duplicated in useEditorPage) |
| `useEditorDnd.ts` | `useEditorPage`, `EditorDndProvider` | ✅ USED |
| `useEditorPage.ts` | `page.tsx` | ✅ USED (main composer) |
| `useEditorSync.ts` | `useEditorPage` | ✅ USED |
| `usePresentationMode.ts` | `page.tsx` | ✅ USED |
| `useResize.ts` | `editor/components/BlockCell.tsx` | ⚠️ DUPLICATE |
| `useResizeDrag.ts` | Nothing | ❌ UNUSED |
| `useSlideActions.ts` | `useEditorPage` | ✅ USED (but has dead code) |
| `useSlideGeneration.ts` | `useEditorPage` | ✅ USED |
| `useUndoRedo.ts` | `page.tsx`, `EditorHeader` | ✅ USED |

---

## 🔧 Recommended Actions

### Priority 1: Delete Unused Files
1. **DELETE** `hooks/useResize.ts` (duplicate of engine version)
2. **DELETE** `hooks/useResizeDrag.ts` (completely unused)
3. **DELETE** `hooks/useDebounce.ts` (unused)
4. **DELETE** `hooks/useEditorActions.ts` (functionality duplicated in useEditorPage)

### Priority 2: Fix Dead Code
1. Complete or remove `handleDuplicateSlide` in `useSlideActions.ts`

### Priority 3: Code Quality
1. Consider extracting action handlers from `useEditorPage` to a separate hook for better organization
2. Add proper file naming convention (some use `use-kebab.ts`, others use `useCamel.ts`)

---

## 📈 Potential Code Reduction

| Action | Lines Saved |
|--------|-------------|
| Delete `useResize.ts` (duplicate) | ~53 lines |
| Delete `useResizeDrag.ts` | ~122 lines |
| Delete `useDebounce.ts` | ~77 lines |
| Delete `useEditorActions.ts` | ~98 lines |
| **TOTAL** | **~350 lines** |

---

## Files to Keep

1. ✅ `use-outline.ts` - Used for outline operations
2. ✅ `use-themes.ts` - Needs verification
3. ✅ `useEditorDnd.ts` - Core DnD logic
4. ✅ `useEditorPage.ts` - Main page hook (composer pattern)
5. ✅ `useEditorSync.ts` - Auto-save logic
6. ✅ `usePresentationMode.ts` - Fullscreen presentation
7. ✅ `useSlideActions.ts` - Slide add/delete (fix dead code)
8. ✅ `useSlideGeneration.ts` - AI generation
9. ✅ `useUndoRedo.ts` - Undo/redo keyboard shortcuts

---

## Final Recommendation

Delete 4 files to reduce ~350 lines of dead/duplicate code:
- `useResize.ts`
- `useResizeDrag.ts`
- `useDebounce.ts`
- `useEditorActions.ts`

This will make the hooks folder cleaner and remove confusion from duplicate/unused code.
