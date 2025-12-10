import React from "react";
import { DraggableLayoutOption } from "./DraggableLayoutOption";
import {
  TwoColumnIcon,
  ThreeColumnIcon,
  NumberCardIcon,
} from "./icons/layout-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

const QuoteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17h3l2-5V7H5v5h3zm8 0h3l2-5V7h-6v5h3z" />
  </svg>
);

const CtaIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 5h18v10H7l-4 4V5z" />
    <path d="M12 9.5h5" />
    <path d="M9 9.5h.01" />
  </svg>
);

interface SmartLayoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartLayoutPanel: React.FC<SmartLayoutPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  if (!isOpen) return null;

  return (
    <Card
      className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 shadow-lg z-50 border"
      style={{
        backgroundColor: theme.cardBackground,
        borderColor: theme.primary + "20",
        color: theme.bodyColor,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm" style={{ color: theme.headingColor }}>
            Smart Layout
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <CardDescription className="text-xs" style={{ color: theme.bodyColor }}>
          Drag a layout to add a new row or block
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <h3
            className="text-xs font-semibold mb-2"
            style={{ color: theme.headingColor }}
          >
            Layouts
          </h3>
          <div className="flex flex-col gap-3">
            <DraggableLayoutOption
              id="layout-2-col"
              columnCount={2}
              icon={<TwoColumnIcon />}
              label="2 Columns"
            />
            <DraggableLayoutOption
              id="layout-3-col"
              columnCount={3}
              icon={<ThreeColumnIcon />}
              label="3 Columns"
            />
            <DraggableLayoutOption
              id="layout-3-number-cards"
              columnCount={3}
              icon={<NumberCardIcon />}
              label="3 Number Cards"
              blockType="number-card"
            />
            <DraggableLayoutOption
              id="layout-1-testimonial"
              columnCount={1}
              icon={<QuoteIcon />}
              label="Testimonial"
              blockType="testimonial"
            />
            <DraggableLayoutOption
              id="layout-1-cta"
              columnCount={1}
              icon={<CtaIcon />}
              label="CTA Banner"
              blockType="cta"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
