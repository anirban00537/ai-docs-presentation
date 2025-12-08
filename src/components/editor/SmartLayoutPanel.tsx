import React from "react";
import { DraggableLayoutOption } from "./DraggableLayoutOption";
import { TwoColumnIcon, ThreeColumnIcon, FourColumnIcon } from "./icons/layout-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

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
          <CardTitle className="text-sm" style={{ color: theme.headingColor }}>Smart Layout</CardTitle>
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
          Drag a layout to add a new row
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
          id="layout-4-col"
          columnCount={4}
          icon={<FourColumnIcon />}
          label="4 Columns"
        />
      </CardContent>
    </Card>
  );
};

