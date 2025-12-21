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

export interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

export interface Slide {
  title: string;
  widgets: Widget[];
  backgroundColor?: string;
  backgroundImage?: string;
  showSlideNumber?: boolean;
  slideStyle?: string;
  backgroundBlur?: boolean;
  order?: number;
  [key: string]: any;
}

export interface PresentationStructure {
  title: string;
  slides: Slide[];
  theme?: PresentationTheme;
  [key: string]: any;
}
