export type ElementCommon = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TextElement = ElementCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
};

export type RectangleElement = ElementCommon & {
  type: "rectangle";
  fill: string;
  borderRadius: number;
};

export type CircleElement = ElementCommon & {
  type: "circle";
  fill: string;
};

export type ArrowElement = ElementCommon & {
  type: "arrow";
  stroke: string;
  strokeWidth: number;
};

export type SlideElement =
  | TextElement
  | RectangleElement
  | CircleElement
  | ArrowElement;

export type SlideElementUpdate = Partial<
  Omit<ElementCommon, "id"> & {
    text: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    align: "left" | "center" | "right";
    fill: string;
    borderRadius: number;
    stroke: string;
    strokeWidth: number;
    lineHeight: number;
  }
>;

export type SlideInteractionAction =
  | "drag:start"
  | "drag:move"
  | "drag:stop"
  | "resize:start"
  | "resize:move"
  | "resize:stop";

export type SlideInteractionDetail = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type SlideInteractionLogger = (
  action: SlideInteractionAction,
  detail: SlideInteractionDetail
) => void;

export type SlideProps = {
  elements: SlideElement[];
  selectedId: string | null;
  editingId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: SlideElementUpdate) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
};

