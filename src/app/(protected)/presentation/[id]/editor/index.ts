// Export all editor components

// Core
export { EditorHeader } from "./core/EditorHeader";
export { EditorBackground } from "./core/EditorBackground";

// Providers
export { EditorThemeProvider, useEditorTheme } from "./providers/EditorThemeProvider";
export { EditorDndProvider, useEditorDndContext } from "./providers/EditorDndProvider";

// Slide
export { SlideCanvas } from "./components/SlideCanvas";
export { SlideNavigator } from "./slide/SlideNavigator";
export { SlideToolbar } from "./slide/SlideToolbar";
export { SlideOptions } from "./slide/SlideOptions";
export { SlideLayoutSelector } from "./slide/SlideLayoutSelector";

// Block
export { BlockCell } from "./components/BlockCell";
export { BlockToolbar } from "./block/BlockToolbar";
export { BlockTypeSelector } from "./block/BlockTypeSelector";
export { BlockOption } from "./block/BlockOption";
export { BlockRenderer } from "./block/BlockRenderer";
export { BlockWrapper } from "./block/BlockWrapper";
export {
  BlockSelectionProvider,
  useBlockFocus,
} from "./block/BlockSelectionContext";

// Layout
export { ContentRow } from "./layout/ContentRow";
export { InsertionIndicator } from "./layout/InsertionIndicator";
export { DragPreview } from "./layout/DragPreview";

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

// Export block components (keep as-is)
export { ProseMirrorBlock } from "./blocks/prosemirror/ProseMirrorBlock";
export { SimpleNumberCardBlock } from "./blocks/simple-number-card/SimpleNumberCardBlock";
