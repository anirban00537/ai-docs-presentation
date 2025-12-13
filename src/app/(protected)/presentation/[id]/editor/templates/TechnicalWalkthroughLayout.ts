import { Row, Block } from "@/lib/editor/types";
import type { LayoutTemplate } from "../layoutTemplates";
import {
  BLOCK_TYPES,
  createParagraphContent,
  createCodeTerminalContent,
  createSimpleNumberCardContent,
} from "../blocks/definitions";
import { nanoid } from "@reduxjs/toolkit";

export const TechnicalWalkthroughLayout: LayoutTemplate = {
  id: "technical-walkthrough",
  name: "Developer Integration",
  description: "Step-by-step guide with code terminals",
  icon: "Terminal",
  getRows: (): Row[] => [
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.PROSEMIRROR,
          content: createParagraphContent(
            "Quick Start Guide"
          ),
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
          content: createSimpleNumberCardContent(
            1,
            "Install Package",
            "Get started by installing the core library from npm. This includes all necessary dependencies for the standard setup."
          ),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.CODE_TERMINAL,
          content: createCodeTerminalContent(
            "npm install @butterfast/core",
            "Added 24 packages in 1.2s"
          ),
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
          content: createSimpleNumberCardContent(
            2,
            "Initialize SDK",
            "Initialize the client with your API key. You can find this key in your dashboard settings under 'API Credentials'."
          ),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.CODE_TERMINAL,
          content: createCodeTerminalContent(
            "npx butterfast init",
            "✅ Config file created at ./butterfast.json"
          ),
        } as Block,
      ],
    },
  ],
};
