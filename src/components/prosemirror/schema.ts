import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

// --- Custom Schema ---
export const createSchema = () => {
  const nodes = addListNodes(
    basicSchema.spec.nodes,
    "paragraph block*",
    "block"
  );

  // We need to override the default nodes to add textAlign
  // The 'nodes' from addListNodes is an OrderedMap
  let newNodes = nodes;

  // Update paragraph
  const paragraphBuf = nodes.get("paragraph");
  if (paragraphBuf) {
    newNodes = newNodes.update("paragraph", {
      ...paragraphBuf,
      attrs: {
        ...paragraphBuf.attrs,
        textAlign: { default: "left" },
      },
      parseDOM: [
        {
          tag: "p",
          getAttrs: (node: HTMLElement) => {
            const align = node.style.textAlign || "left";
            // Validate alignment value
            const validAligns = ["left", "center", "right", "justify"];
            return {
              textAlign: validAligns.includes(align) ? align : "left",
            };
          },
        },
      ],
      toDOM: (node) => {
        const { textAlign } = node.attrs;
        return [
          "p",
          { style: textAlign !== "left" ? `text-align: ${textAlign}` : "" },
          0,
        ];
      },
    });
  }

  // Update heading if it exists (it's in basicSchema but let's check or just update it)
  // basicSchema.spec.nodes usually has heading.
  // actually 'nodes' here is from basicSchema.spec.nodes + list nodes.

  const headingBuf = newNodes.get("heading");
  if (headingBuf) {
    newNodes = newNodes.update("heading", {
      ...headingBuf,
      attrs: {
        ...headingBuf.attrs,
        textAlign: { default: "left" },
        level: { default: 1 },
      },
      parseDOM: [
        {
          tag: "h1",
          getAttrs: (node: HTMLElement) => {
            const align = node.style.textAlign || "left";
            const validAligns = ["left", "center", "right", "justify"];
            return {
              level: 1,
              textAlign: validAligns.includes(align) ? align : "left",
            };
          },
        },
        {
          tag: "h2",
          getAttrs: (node: HTMLElement) => {
            const align = node.style.textAlign || "left";
            const validAligns = ["left", "center", "right", "justify"];
            return {
              level: 2,
              textAlign: validAligns.includes(align) ? align : "left",
            };
          },
        },
        {
          tag: "h3",
          getAttrs: (node: HTMLElement) => {
            const align = node.style.textAlign || "left";
            const validAligns = ["left", "center", "right", "justify"];
            return {
              level: 3,
              textAlign: validAligns.includes(align) ? align : "left",
            };
          },
        },
        {
          tag: "h4",
          getAttrs: (node: HTMLElement) => {
            const align = node.style.textAlign || "left";
            const validAligns = ["left", "center", "right", "justify"];
            return {
              level: 4,
              textAlign: validAligns.includes(align) ? align : "left",
            };
          },
        },
        // ... standard heading parsing
      ],
      toDOM: (node) => {
        const { textAlign, level } = node.attrs;
        return [
          `h${level}`,
          { style: textAlign !== "left" ? `text-align: ${textAlign}` : "" },
          0,
        ];
      },
    });
  }

  return new Schema({
    nodes: newNodes
      .update("doc", {
        content: "block+",
      })
      .update("code_block", {
        ...basicSchema.spec.nodes.get("code_block"),
        toDOM: () => [
          "pre",
          { class: "bg-gray-100 rounded-lg p-3 font-mono text-sm" },
          ["code", 0],
        ],
      }),
    marks: basicSchema.spec.marks,
  });
};

export const schema = createSchema();
