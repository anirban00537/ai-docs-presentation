"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/cardsSlice";

// Google Fonts CDN mapping
const GOOGLE_FONTS_CDN: Record<string, string> = {
  // Sans Serif
  "Albert Sans": "Albert+Sans:wght@100;200;300;400;500;600;700;800;900",
  Figtree: "Figtree:wght@300;400;500;600;700;800;900",
  Geist: "Geist:wght@100;200;300;400;500;600;700;800;900",
  "Instrument Sans": "Instrument+Sans:wght@400;500;600;700",
  Inter: "Inter:wght@100;200;300;400;500;600;700;800;900",
  Manrope: "Manrope:wght@200;300;400;500;600;700;800",
  "Open Sans": "Open+Sans:wght@300;400;500;600;700;800",
  Outfit: "Outfit:wght@100;200;300;400;500;600;700;800;900",
  Poppins: "Poppins:wght@100;200;300;400;500;600;700;800;900",
  Questrial: "Questrial",
  "Rethink Sans": "Rethink+Sans:wght@400;500;600;700;800",
  "Roboto Condensed": "Roboto+Condensed:wght@300;400;700",
  Sora: "Sora:wght@100;200;300;400;500;600;700;800",
  "Space Grotesk": "Space+Grotesk:wght@300;400;500;600;700",
  
  // Serif
  "DM Serif Display": "DM+Serif+Display",
  "EB Garamond": "EB+Garamond:wght@400;500;600;700;800",
  "Fanwood Text": "Fanwood+Text",
  Fraunces: "Fraunces:wght@100;200;300;400;500;600;700;800;900",
  "Hedvig Letters Serif": "Hedvig+Letters+Serif",
  "Instrument Serif": "Instrument+Serif",
  "Cactus Classical Serif": "Cactus+Classical+Serif",
  "Crimson Text": "Crimson+Text:wght@400;600;700",

  // Legacy/Backwards compatibility
  "Playfair Display": "Playfair+Display:wght@400;500;600;700;800;900",
  Lora: "Lora:wght@400;500;600;700",
  Montserrat: "Montserrat:wght@100;200;300;400;500;600;700;800;900",
  Lato: "Lato:wght@100;300;400;700;900",
  Raleway: "Raleway:wght@100;200;300;400;500;600;700;800;900",
  "JetBrains Mono": "JetBrains+Mono:wght@100;200;300;400;500;600;700;800",
  Nunito: "Nunito:wght@200;300;400;500;600;700;800;900",
  "Source Sans Pro": "Source+Sans+Pro:wght@200;300;400;600;700;900",
};

export const GoogleFontsLoader: React.FC = () => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const fontName = theme.fontFamily || "Inter";

  useEffect(() => {
    // Remove existing Google Fonts link if any
    const existingLink = document.getElementById("google-fonts-cdn");
    if (existingLink) {
      existingLink.remove();
    }

    // Get the font URL from CDN mapping
    const fontUrl = GOOGLE_FONTS_CDN[fontName];
    if (!fontUrl) return;

    // Create and inject Google Fonts CDN link
    const link = document.createElement("link");
    link.id = "google-fonts-cdn";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}&display=swap`;
    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      const linkToRemove = document.getElementById("google-fonts-cdn");
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [fontName]);

  return null;
};
