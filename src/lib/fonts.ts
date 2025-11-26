const FONT_DEFINITIONS = [
  {
    id: "poppins",
    label: "Poppins",
    cssVariable: "var(--font-poppins)",
    stack: "var(--font-poppins), Poppins, sans-serif",
  },
  {
    id: "inter",
    label: "Inter",
    cssVariable: "var(--font-inter)",
    stack: "var(--font-inter), Inter, sans-serif",
  },
  {
    id: "roboto",
    label: "Roboto",
    cssVariable: "var(--font-roboto)",
    stack: "var(--font-roboto), Roboto, sans-serif",
  },
  {
    id: "openSans",
    label: "Open Sans",
    cssVariable: "var(--font-open-sans)",
    stack: "var(--font-open-sans), 'Open Sans', sans-serif",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    cssVariable: "var(--font-montserrat)",
    stack: "var(--font-montserrat), Montserrat, sans-serif",
  },
  {
    id: "lato",
    label: "Lato",
    cssVariable: "var(--font-lato)",
    stack: "var(--font-lato), Lato, sans-serif",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    cssVariable: "var(--font-playfair)",
    stack: "var(--font-playfair), 'Playfair Display', serif",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    cssVariable: "var(--font-merriweather)",
    stack: "var(--font-merriweather), Merriweather, serif",
  },
  {
    id: "raleway",
    label: "Raleway",
    cssVariable: "var(--font-raleway)",
    stack: "var(--font-raleway), Raleway, sans-serif",
  },
  {
    id: "ubuntu",
    label: "Ubuntu",
    cssVariable: "var(--font-ubuntu)",
    stack: "var(--font-ubuntu), Ubuntu, sans-serif",
  },
  {
    id: "greatVibes",
    label: "Great Vibes",
    cssVariable: "var(--font-great-vibes)",
    stack: "var(--font-great-vibes), 'Great Vibes', cursive",
  },
  {
    id: "dancingScript",
    label: "Dancing Script",
    cssVariable: "var(--font-dancing-script)",
    stack: "var(--font-dancing-script), 'Dancing Script', cursive",
  },
  {
    id: "caveat",
    label: "Caveat",
    cssVariable: "var(--font-caveat)",
    stack: "var(--font-caveat), Caveat, cursive",
  },
  {
    id: "abrilFatface",
    label: "Abril Fatface",
    cssVariable: "var(--font-abril-fatface)",
    stack: "var(--font-abril-fatface), 'Abril Fatface', serif",
  },
  {
    id: "lora",
    label: "Lora",
    cssVariable: "var(--font-lora)",
    stack: "var(--font-lora), Lora, serif",
  },
] as const;

type FontId = (typeof FONT_DEFINITIONS)[number]["id"];

export const FONT_STACKS: Record<FontId, string> = FONT_DEFINITIONS.reduce(
  (acc, font) => {
    acc[font.id] = font.stack;
    return acc;
  },
  {} as Record<FontId, string>
);

export const GOOGLE_FONT_OPTIONS = FONT_DEFINITIONS.map((font) => ({
  value: font.cssVariable,
  label: font.label,
  style: font.stack,
}));
