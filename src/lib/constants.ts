export const SLIDE_MAX_WIDTH = 1200; // Maximum width for slides in pixels

export const GOOGLE_FONTS = [
  // Sans Serif
  "Albert Sans",
  "Figtree",
  "Geist",
  "Instrument Sans",
  "Inter",
  "Manrope",
  "Open Sans",
  "Outfit",
  "Poppins",
  "Questrial",
  "Rethink Sans",
  "Roboto Condensed",
  "Sora",
  "Space Grotesk",
  // Serif
  "DM Serif Display",
  "EB Garamond",
  "Fanwood Text",
  "Fraunces",
  "Hedvig Letters Serif",
  "Instrument Serif",
  "Cactus Classical Serif",
  "Crimson Text",
] as const;

export type GoogleFont = typeof GOOGLE_FONTS[number];
