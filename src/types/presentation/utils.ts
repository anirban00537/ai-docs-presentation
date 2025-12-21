// ProseMirrorDocument is a Markdown string
export type ProseMirrorDocument = string;

export const createParagraphContent = (text: string = ""): ProseMirrorDocument => {
  return text || "";
};

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getDefaultHeadingContent = (): ProseMirrorDocument => "# ";
