import type { LayoutTemplate } from "@/types/presentation";
import type { Icon } from "@tabler/icons-react";
import {
  IconCode,
  IconHeading,
} from "@tabler/icons-react";
import { IntroductionLayout } from "../templates/IntroductionLayout";
import { CodeExampleLayout } from "../templates/CodeExampleLayout";

// JSON mapping of layout IDs to Tabler icon components
export const layoutIconsMap: Record<string, Icon> = {
  "code-example-layout": IconCode,
  introduction: IconHeading,
};

export const layoutTemplates: LayoutTemplate[] = [
  IntroductionLayout,
  CodeExampleLayout,
];
