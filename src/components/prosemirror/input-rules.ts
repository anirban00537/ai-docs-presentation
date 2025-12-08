import { Schema } from "prosemirror-model";
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  InputRule,
} from "prosemirror-inputrules";

// --- Input Rules ---
export const createInputRules = (schema: Schema) => {
  const rules: InputRule[] = [];

  // Heading rules
  rules.push(
    textblockTypeInputRule(/^#\s$/, schema.nodes.heading, { level: 1 })
  );
  rules.push(
    textblockTypeInputRule(/^##\s$/, schema.nodes.heading, { level: 2 })
  );
  rules.push(
    textblockTypeInputRule(/^###\s$/, schema.nodes.heading, { level: 3 })
  );

  // Blockquote rule
  rules.push(wrappingInputRule(/^>\s$/, schema.nodes.blockquote));

  // List rules
  rules.push(wrappingInputRule(/^[-*]\s$/, schema.nodes.bullet_list));
  rules.push(
    wrappingInputRule(
      /^(\d+)\.\s$/,
      schema.nodes.ordered_list,
      (match) => ({ order: +match[1] }),
      (match, node) => node.childCount + node.attrs.order === +match[1]
    )
  );

  // Code block rule
  rules.push(textblockTypeInputRule(/^```$/, schema.nodes.code_block));

  return inputRules({ rules });
};

