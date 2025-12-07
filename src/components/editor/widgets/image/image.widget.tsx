"use client";

import React from "react";
import type { ResizeHandle } from "@/components/editor/widgets/types";
import type { ImageWidget } from "./types";
import type { Viewport } from "@/hooks/use-canvas-viewport";
import {
  WidgetContainer,
  useWidgetPointerDown,
} from "@/components/editor/widgets/shared";

type ImageWidgetNodeProps = {
  widget: ImageWidget;
  isSelected: boolean;
  isEditing: boolean;
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
};

const ImageWidgetNodeBase: React.FC<ImageWidgetNodeProps> = ({
  widget,
  isSelected,
  isEditing,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  viewport,
  containerRef,
}) => {
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  const handlePointerDown = useWidgetPointerDown({
    onPointerDown,
    // No toolbar for this widget
  });

  return (
    <WidgetContainer
      widgetRef={widgetRef}
      isSelected={isSelected}
      isEditing={isEditing}
      widget={widget}
      baseZIndex={baseZIndex}
      onPointerDown={handlePointerDown}
      getResizePointerDown={getResizePointerDown}
      toolbar={null} // No toolbar
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        <img
          src={widget.imageUrl}
          alt="Image"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
    </WidgetContainer>
  );
};

export const ImageWidgetNode = React.memo(ImageWidgetNodeBase);

