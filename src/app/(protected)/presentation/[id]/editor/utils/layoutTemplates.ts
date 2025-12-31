import type { LayoutTemplate } from "@/types/presentation";
import type { Icon } from "@tabler/icons-react";
import {
  IconCode,
  IconHeading,
  IconSquare,
} from "@tabler/icons-react";
import { IntroductionLayout } from "../templates/IntroductionLayout";
import { CodeExampleLayout } from "../templates/CodeExampleLayout";
import { BlankLayout } from "../templates/BlankLayout";

// JSON mapping of layout IDs to Tabler icon components
export const layoutIconsMap: Record<string, Icon> = {
  "code-example-layout": IconCode,
  introduction: IconHeading,
  blank: IconSquare,
};

export const layoutTemplates: LayoutTemplate[] = [
  BlankLayout,
  IntroductionLayout,
  CodeExampleLayout,
];
