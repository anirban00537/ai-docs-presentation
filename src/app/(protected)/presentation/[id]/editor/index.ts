// Export all editor components

// Core
export { EditorHeader } from "./core/EditorHeader";
export { EditorBackground } from "./core/EditorBackground";

// Engine - Core Architecture
export {
  // Providers
  EditorThemeProvider,
  useEditorTheme,
  EditorDndProvider,
  useEditorDndContext,
  // Selection
  BlockSelectionProvider,
  useBlockFocus,
  // Layout
  SlideCanvas,
  ContentRow,
  BlockCell,
  InsertionIndicator,
  DragPreview,
  // Renderer
  BlockRenderer,
  BlockErrorBoundary,
  // Registry
  BLOCK_DEFINITIONS,
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createSlide,
  // Hooks
  useResize,
  // Types
  type BlockDefinition,
  type BlockRendererProps,
} from "@/app/(protected)/presentation/[id]/engine";

// Slide UI
export { SlideNavigator } from "./slide/SlideNavigator";
export { SlideToolbar } from "./slide/SlideToolbar";
export { SlideOptions } from "./slide/SlideOptions";
export { SlideLayoutSelector } from "./slide/SlideLayoutSelector";

// Block UI
export { BlockToolbar } from "./block-ui/BlockToolbar";
export { BlockTypeSelector } from "./block-ui/BlockTypeSelector";
export { BlockOption } from "./block-ui/BlockOption";
export { LayoutOption } from "./block-ui/LayoutOption";

// Panels
export { ToolbarPanel } from "./panels/ToolbarPanel";
export { BlockLibraryPanel } from "./panels/BlockLibraryPanel";
export { ImageLibraryPanel } from "./panels/ImageLibraryPanel";
export { ThemeSelectorPanel } from "./panels/ThemeSelectorPanel";
export { ImagePickerModal } from "./panels/ImagePickerModal";

// Presentation
export { PresentationView } from "./presentation/PresentationView";

// UI
export { LoadingOverlay } from "./ui/LoadingOverlay";

// Utils
export { getBlockTypeIcon, getBlockTypeLabel } from "./utils/blockTypeUtils";

// Block Components
export { ProseMirrorBlock } from "./blocks/prosemirror/ProseMirrorBlock";
export { SimpleNumberCardBlock } from "./blocks/simple-number-card/SimpleNumberCardBlock";
