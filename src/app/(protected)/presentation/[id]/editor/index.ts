// Export all editor components

// Core
export { EditorHeader } from "./core/EditorHeader";
export { EditorBackground } from "./core/EditorBackground";

// Slide
export { SlideContainer } from "./slide/SlideContainer";
export { SlideFrame } from "./slide/SlideFrame";
export { SlideNavigator } from "./slide/SlideNavigator";
export { SlideToolbar } from "./slide/SlideToolbar";
export { SlideOptions } from "./slide/SlideOptions";
export { SlideLayoutSelector } from "./slide/SlideLayoutSelector";

// Block
export { BlockContainer } from "./block/BlockContainer";
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
export { BlockColumn } from "./layout/BlockColumn";
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
export { ProgressIndicator } from "./ui/ProgressIndicator";

// Utils
export { getBlockTypeIcon, getBlockTypeLabel } from "./utils/blockTypeUtils";

// Export block components (keep as-is)
export { ProseMirrorBlock } from "./blocks/prosemirror/ProseMirrorBlock";
export { SimpleNumberCardBlock } from "./blocks/simple-number-card/SimpleNumberCardBlock";



