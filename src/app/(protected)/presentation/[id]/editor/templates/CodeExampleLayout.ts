import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createCodeContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content:
        '<h2 style="text-align: center">Built for Developers</h2>\n\n<p style="text-align: center">Integrate our full-featured SDK in less than 5 minutes.</p>',
    };

    // Row 2: Code Block
    const code = createCodeContent();
    code.language = "javascript";
    code.code = `import { Butterfast } from '@butterfast/sdk';

// Initialize with your secure key
const client = new Butterfast(process.env.API_KEY);

// Deploy scalable infrastructure instantly
const deployment = await client.deploy({
  region: 'us-east-1',
  scaling: 'auto',
  security_level: 'strict',
  monitoring: true
});

console.log(\`🚀 Deployed successfully at: \${deployment.url}\`);`;
    code.showLineNumbers = true;
    code.theme = "dark";

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
