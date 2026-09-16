import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const createPlaceholderPlugin = (text: string = "Type '/' for commands") => 
  new Plugin({
    props: {
      decorations: (state) => {
        const decorations: Decoration[] = [];
        const doc = state.doc;

        // If the document is one empty text block, show the placeholder
        if (doc.childCount === 1 && doc.firstChild?.isTextblock && doc.firstChild.content.size === 0) {
          decorations.push(
            Decoration.node(0, doc.firstChild.nodeSize, {
              class: "is-empty",
              "data-placeholder": text,
            })
          );
        }

        return DecorationSet.create(doc, decorations);
      },
    },
  });
