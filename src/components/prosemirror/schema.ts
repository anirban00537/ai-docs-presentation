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

  return new Schema({
    nodes: nodes
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

