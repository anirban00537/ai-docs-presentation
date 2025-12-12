import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCodeContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const CodeExampleLayout = {
  id: "code-example-layout",
  name: "Code Example",
  description: "Showcase code snippets with syntax highlighting",
  icon: "💻",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Quick Start" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Get started in minutes with our simple API",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Code Block
    const code = createCodeContent();
    code.language = "javascript";
    code.code = `// Install the package
npm install @yourcompany/sdk

// Initialize the client
import { Client } from '@yourcompany/sdk';

const client = new Client({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Make your first API call
const result = await client.getData();
console.log(result);`;
    code.showLineNumbers = true;
    code.theme = "light";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.CODE, content: code }],
      },
    ];
  },
};
