export const TOOLBAR_SELECTOR = '[data-image-card-toolbar="true"]';

export const IMAGE_STYLE_OPTIONS = [
  {
    value: "hero" as const,
    label: "Hero Image",
    description: "Large image on top with content below",
  },
  {
    value: "background" as const,
    label: "Background Image",
    description: "Text overlays directly on the background",
  },
  {
    value: "backgroundGlass" as const,
    label: "Glass Background",
    description: "Background image with glassmorphism panel",
  },
  {
    value: "left" as const,
    label: "Left Image",
    description: "Image on the left, content on the right",
  },
  {
    value: "right" as const,
    label: "Right Image",
    description: "Image on the right, content on the left",
  },
  {
    value: "bottom" as const,
    label: "Bottom Image",
    description: "Image on the bottom, content on top",
  },
];

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=1200&q=80";

export const IMAGE_SUGGESTIONS = [
  {
    label: "Workspace",
    url: `https://images.unsplash.com/photo-1498050108023-c5249f4df085${UNSPLASH_PARAMS}`,
  },
  {
    label: "Mountain",
    url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee${UNSPLASH_PARAMS}`,
  },
  {
    label: "City",
    url: `https://images.unsplash.com/photo-1482192597420-4817fdd7e8b0${UNSPLASH_PARAMS}`,
  },
  {
    label: "Abstract",
    url: `https://images.unsplash.com/photo-1500534314209-a25ddb2bd429${UNSPLASH_PARAMS}`,
  },
];

export const DEFAULT_IMAGE_URL = IMAGE_SUGGESTIONS[0]?.url;
