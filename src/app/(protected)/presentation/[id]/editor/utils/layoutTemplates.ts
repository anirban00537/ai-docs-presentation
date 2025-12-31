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
import { StackedTimelineLayout } from "../templates/StackedTimelineLayout";
import { IconBoxLayout } from "../templates/IconBoxLayout";
import { NumberCardLayout } from "../templates/NumberCardLayout";
import { LayeredStepsLayout } from "../templates/LayeredStepsLayout";
import { SidelineCardLayout } from "../templates/SidelineCardLayout";
import { LeafCardLayout } from "../templates/LeafCardLayout";
import { SolidBoxLayout } from "../templates/SolidBoxLayout";
import { TimelineBentoLayout } from "../templates/TimelineBentoLayout";

// JSON mapping of layout IDs to Tabler icon components
export const layoutIconsMap: Record<string, Icon> = {
  "code-example-layout": IconCode,
  introduction: IconHeading,
  blank: IconSquare,
};

export const layoutTemplates: LayoutTemplate[] = [
  BlankLayout,
  StackedTimelineLayout,
  IconBoxLayout,
  NumberCardLayout,
  LayeredStepsLayout,
  SidelineCardLayout,
  LeafCardLayout,
  SolidBoxLayout,
  TimelineBentoLayout,
  IntroductionLayout,
  CodeExampleLayout,
];
