// Export all editor components

// Core
export { EditorHeader } from "./core/EditorHeader";
export { EditorBackground } from "./core/EditorBackground";

// Providers
export { EditorThemeProvider, useEditorTheme } from "@/app/(protected)/presentation/[id]/editor/engine/theme/EditorThemeProvider";
export { EditorDndProvider, useEditorDndContext } from "@/app/(protected)/presentation/[id]/editor/engine/dnd/EditorDndProvider";

// Slide
export { SlideCanvas } from "@/app/(protected)/presentation/[id]/editor/engine/layout/SlideCanvas";
export { SlideNavigator } from "./slide/SlideNavigator";
export { SlideToolbar } from "./slide/SlideToolbar";
export { SlideOptions } from "./slide/SlideOptions";
export { SlideLayoutSelector } from "./slide/SlideLayoutSelector";

// Block
export { BlockCell } from "@/app/(protected)/presentation/[id]/editor/engine/layout/BlockCell";
export { BlockToolbar } from "./block/BlockToolbar";
export { BlockTypeSelector } from "./block/BlockTypeSelector";
export { BlockOption } from "./block/BlockOption";
export { BlockRenderer } from "@/app/(protected)/presentation/[id]/editor/engine/renderer/BlockRenderer";
export { BlockWrapper } from "./block/BlockWrapper";
export {
  BlockSelectionProvider,
  useBlockFocus,
} from "@/app/(protected)/presentation/[id]/editor/engine/selection/BlockSelectionContext";

// Layout
export { ContentRow } from "@/app/(protected)/presentation/[id]/editor/engine/layout/ContentRow";
export { InsertionIndicator } from "@/app/(protected)/presentation/[id]/editor/engine/layout/InsertionIndicator";
export { DragPreview } from "@/app/(protected)/presentation/[id]/editor/engine/layout/DragPreview";

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
