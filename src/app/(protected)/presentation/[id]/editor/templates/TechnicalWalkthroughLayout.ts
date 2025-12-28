/**
 * Technical Walkthrough Layout Template
 * Step-by-step guide with code terminals.
 * 
 * @example
 * Used for: Developer docs, Integration guides, Technical tutorials
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createCodeTerminalContent,
  createSimpleNumberCardContent,
} from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const TechnicalWalkthroughLayout: LayoutTemplate = {
  id: "technical-walkthrough",
  name: "Developer Integration",
  description: "Developer onboarding tutorial with numbered steps and terminal code blocks. Shows install and init commands with output.",
  icon: "IconTerminal",
  getRows: (): Row[] => {
    // Row 1: Header
    const headerBlock = createProseMirrorBlock(
      createSectionHeader("Quick Start Guide")
    );

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.SIMPLE_NUMBER_CARD,
            createSimpleNumberCardContent(
              1,
              "Install Package",
              "Get started by installing the core library from npm. This includes all necessary dependencies for the standard setup."
            )
          ),
          createTypedBlock(
            BLOCK_TYPES.CODE_TERMINAL,
            createCodeTerminalContent(
              "npm install @butterfast/core",
              "Added 24 packages in 1.2s"
            )
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.SIMPLE_NUMBER_CARD,
            createSimpleNumberCardContent(
              2,
              "Initialize SDK",
              "Initialize the client with your API key. You can find this key in your dashboard settings under 'API Credentials'."
            )
          ),
          createTypedBlock(
            BLOCK_TYPES.CODE_TERMINAL,
            createCodeTerminalContent(
              "npx butterfast init",
              "[DONE] Config file created at ./butterfast.json"
            )
          ),
        ],
      },
    ];
  },
};
