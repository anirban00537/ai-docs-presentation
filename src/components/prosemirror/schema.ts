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

  // Helper to add textAlign to nodes
  const addTextAlign = (nodeSpec: any) => ({
    ...nodeSpec,
    attrs: {
      ...nodeSpec.attrs,
      textAlign: { default: "left" },
    },
    parseDOM: [
      {
        tag: "p",
        getAttrs: (node: HTMLElement) => {
          return {
            textAlign: node.style.textAlign || "left",
          };
        },
      },
      ...(nodeSpec.parseDOM || []),
    ],
    toDOM: (node: any) => {
      const { textAlign } = node.attrs;
      let style = "";
      if (textAlign && textAlign !== "left") {
        style = `text-align: ${textAlign}`;
      }
      return ["p", { style }, 0];
    },
  });

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
          getAttrs: (node: HTMLElement) => ({
            textAlign: node.style.textAlign || "left",
          }),
        },
      ],
      toDOM: (node) => {
        const { textAlign } = node.attrs;
        return ["p", { style: textAlign !== "left" ? `text-align: ${textAlign}` : "" }, 0];
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
          getAttrs: (node: HTMLElement) => ({ level: 1, textAlign: node.style.textAlign || "left" }),
        },
        {
          tag: "h2",
          getAttrs: (node: HTMLElement) => ({ level: 2, textAlign: node.style.textAlign || "left" }),
        },
        {
          tag: "h3",
          getAttrs: (node: HTMLElement) => ({ level: 3, textAlign: node.style.textAlign || "left" }),
        },
        {
          tag: "h4",
          getAttrs: (node: HTMLElement) => ({ level: 4, textAlign: node.style.textAlign || "left" }),
        },
        // ... standard heading parsing
      ],
      toDOM: (node) => {
        const { textAlign, level } = node.attrs;
        return [`h${level}`, { style: textAlign !== "left" ? `text-align: ${textAlign}` : "" }, 0];
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

