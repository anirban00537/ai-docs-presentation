import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const placeholderPlugin = new Plugin({
  props: {
    decorations: (state) => {
      const decorations: Decoration[] = [];
      const doc = state.doc;

      doc.descendants((node, pos) => {
        if (node.isTextblock && node.content.size === 0) {
           // It's an empty text block
           // Add a decoration that adds a class to the node
           decorations.push(
            Decoration.node(pos, pos + node.nodeSize, {
              class: "is-empty",
            })
          );
        }
      });

      return DecorationSet.create(doc, decorations);
    },
  },
});
