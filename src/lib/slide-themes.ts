type SlideThemeFonts = {
  heading: string;
  body: string;
  accent: string;
};

export type SlideTheme = {
  id: string;
  name: string;
  description?: string;
  background: string[];
  /** Card / widget surface background */
  surface: string;
  text: string;
  accent: string;
  fonts: SlideThemeFonts;
};

const FONT_STACKS = {
  poppins: "var(--font-poppins), Poppins, sans-serif",
  inter: "var(--font-inter), Inter, sans-serif",
  roboto: "var(--font-roboto), Roboto, sans-serif",
  openSans: "var(--font-open-sans), 'Open Sans', sans-serif",
  montserrat: "var(--font-montserrat), Montserrat, sans-serif",
  lato: "var(--font-lato), Lato, sans-serif",
  playfair: "var(--font-playfair), 'Playfair Display', serif",
  merriweather: "var(--font-merriweather), Merriweather, serif",
  raleway: "var(--font-raleway), Raleway, sans-serif",
  ubuntu: "var(--font-ubuntu), Ubuntu, sans-serif",
  greatVibes: "var(--font-great-vibes), 'Great Vibes', cursive",
  dancingScript:
    "var(--font-dancing-script), 'Dancing Script', cursive",
  caveat: "var(--font-caveat), Caveat, cursive",
  abrilFatface:
    "var(--font-abril-fatface), 'Abril Fatface', serif",
  lora: "var(--font-lora), Lora, serif",
} as const;

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: "nocturne",
    name: "Nocturne",
    description: "Deep indigo canvas with electric blue pulses.",
    background: ["#020617", "#0b1a3a", "#13294b"],
    surface: "#111829",
    text: "#dfe7ff",
    accent: "#3b82f6",
    fonts: {
      heading: FONT_STACKS.montserrat,
      body: FONT_STACKS.inter,
      accent: FONT_STACKS.greatVibes,
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark canvas with high-contrast cyan accents.",
    background: ["#01060f", "#05202f", "#063951"],
    surface: "#111827",
    text: "#e5e7eb",
    accent: "#06b6d4",
    fonts: {
      heading: FONT_STACKS.ubuntu,
      body: FONT_STACKS.roboto,
      accent: FONT_STACKS.caveat,
    },
  },
  {
    id: "lumen",
    name: "Lumen",
    description: "Charcoal blend highlighted with neon gradients.",
    background: ["#050608", "#131420", "#1f2933"],
    surface: "#161b2a",
    text: "#f5f5ff",
    accent: "#f472b6",
    fonts: {
      heading: FONT_STACKS.playfair,
      body: FONT_STACKS.lato,
      accent: FONT_STACKS.dancingScript,
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep greens with a calm neutral glow.",
    background: ["#010d0b", "#032923", "#0a3a31"],
    surface: "#0f241f",
    text: "#d8f7ea",
    accent: "#22c55e",
    fonts: {
      heading: FONT_STACKS.lora,
      body: FONT_STACKS.openSans,
      accent: FONT_STACKS.caveat,
    },
  },
  {
    id: "abyss",
    name: "Abyss",
    description: "Oceanic blues with subtle glass gradients.",
    background: ["#010712", "#041934", "#0a2f52"],
    surface: "#0c1e2f",
    text: "#e0f2fe",
    accent: "#38bdf8",
    fonts: {
      heading: FONT_STACKS.merriweather,
      body: FONT_STACKS.ubuntu,
      accent: FONT_STACKS.greatVibes,
    },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Dark ember glow with orange highlights.",
    background: ["#140606", "#2b0c0c", "#3c1a10"],
    surface: "#1f1410",
    text: "#f8e7dd",
    accent: "#fb923c",
    fonts: {
      heading: FONT_STACKS.abrilFatface,
      body: FONT_STACKS.raleway,
      accent: FONT_STACKS.dancingScript,
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Modern industrial grays with chrome accents.",
    background: ["#050506", "#0c0f15", "#1e2432"],
    surface: "#161a24",
    text: "#f9fafb",
    accent: "#8b96ac",
    fonts: {
      heading: FONT_STACKS.montserrat,
      body: FONT_STACKS.roboto,
      accent: FONT_STACKS.playfair,
    },
  },
  {
    id: "modern-light",
    name: "Modern Light",
    description: "Soft neutral background with crisp cobalt accents.",
    background: ["#f8fafc", "#eef2ff", "#e3edff"],
    surface: "#ffffff",
    text: "#0f172a",
    accent: "#2563eb",
    fonts: {
      heading: FONT_STACKS.poppins,
      body: FONT_STACKS.inter,
      accent: FONT_STACKS.openSans,
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Pastel dusk gradient for storytelling decks.",
    background: ["#fff5ec", "#ffe0f2", "#ffd7c2"],
    surface: "#fff9f5",
    text: "#1d1a2b",
    accent: "#f97316",
    fonts: {
      heading: FONT_STACKS.playfair,
      body: FONT_STACKS.lora,
      accent: FONT_STACKS.caveat,
    },
  },
  {
    id: "lagoon",
    name: "Lagoon",
    description: "Fresh aquatic hues with mint highlights.",
    background: ["#e6fffb", "#c7f5ff", "#b3e2ff"],
    surface: "#f0fbff",
    text: "#05304f",
    accent: "#0ea5e9",
    fonts: {
      heading: FONT_STACKS.raleway,
      body: FONT_STACKS.openSans,
      accent: FONT_STACKS.dancingScript,
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purples with a playful neon accent.",
    background: ["#f6f3ff", "#ede8ff", "#e1d8ff"],
    surface: "#ffffff",
    text: "#1e1b4b",
    accent: "#8b5cf6",
    fonts: {
      heading: FONT_STACKS.poppins,
      body: FONT_STACKS.roboto,
      accent: FONT_STACKS.greatVibes,
    },
  },
  {
    id: "honey",
    name: "Honey",
    description: "Golden gradients with rich amber highlights.",
    background: ["#fff9ed", "#fff0cf", "#ffe3b2"],
    surface: "#fffaf1",
    text: "#3b2412",
    accent: "#fbbf24",
    fonts: {
      heading: FONT_STACKS.playfair,
      body: FONT_STACKS.lato,
      accent: FONT_STACKS.abrilFatface,
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Playful rose quartz palette for marketing decks.",
    background: ["#fff1f3", "#ffe4ea", "#ffd9e1"],
    surface: "#fff7f8",
    text: "#3b1421",
    accent: "#fb7185",
    fonts: {
      heading: FONT_STACKS.lora,
      body: FONT_STACKS.openSans,
      accent: FONT_STACKS.greatVibes,
    },
  },
  {
    id: "mint",
    name: "Mint",
    description: "Fresh mint tones for calm analytics.",
    background: ["#f0fff7", "#dafeec", "#c2f7dd"],
    surface: "#fbfffd",
    text: "#065f46",
    accent: "#10b981",
    fonts: {
      heading: FONT_STACKS.ubuntu,
      body: FONT_STACKS.raleway,
      accent: FONT_STACKS.caveat,
    },
  },
  {
    id: "skyline",
    name: "Skyline",
    description: "Bright blues for product overviews.",
    background: ["#f5f9ff", "#e2eeff", "#cfe4ff"],
    surface: "#ffffff",
    text: "#0b1629",
    accent: "#3b82f6",
    fonts: {
      heading: FONT_STACKS.montserrat,
      body: FONT_STACKS.inter,
      accent: FONT_STACKS.openSans,
    },
  },
];
