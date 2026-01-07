export interface PresentationTheme {
  id: string;
  name?: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  font: string;
  cardBackgroundType?: 'solid' | 'transparent' | 'glass';
  tone?: 'light' | 'dark';
  [key: string]: any;
}

export interface Block {
  id: string;
  type: string;
  content: any;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[];
}

export interface Slide {
  id?: string;
  rows: Row[];
  accent?: {
    url: string;
    position: 'left' | 'right' | 'top' | 'bottom' | 'background';
    size: number;
    objectFit?: 'cover' | 'contain';
  };
  order?: number;
  [key: string]: any;
}

export interface PresentationStructure {
  title: string;
  slides: Slide[];
  theme?: PresentationTheme;
  [key: string]: any;
}

