// Block component exports
export * from "./spacer/SpacerBlock";
export * from "./code/CodeBlock";
export * from "./image/ImageBlock";
export * from "./prosemirror/ProseMirrorBlock";

// Re-export from engine for convenience
export { BLOCK_DEFINITIONS, type BlockDefinition } from "@/app/(protected)/docs/[id]/engine";
export { createBlockInstance, createRow, createRowWithColumns, createSlide } from "@/app/(protected)/docs/[id]/engine";

// Utilities
export * from "./utils";
