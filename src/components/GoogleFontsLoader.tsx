"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

// Google Fonts CDN mapping
const GOOGLE_FONTS_CDN: Record<string, string> = {
  Inter: "Inter:wght@100;200;300;400;500;600;700;800;900",
  Poppins: "Poppins:wght@100;200;300;400;500;600;700;800;900",
  Roboto: "Roboto:wght@100;300;400;500;700;900",
  "Open Sans": "Open+Sans:wght@300;400;500;600;700;800",
  Montserrat: "Montserrat:wght@100;200;300;400;500;600;700;800;900",
  Lato: "Lato:wght@100;300;400;700;900",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700;800;900",
  Merriweather: "Merriweather:wght@300;400;700;900",
  Raleway: "Raleway:wght@100;200;300;400;500;600;700;800;900",
  Ubuntu: "Ubuntu:wght@300;400;500;700",
  "Great Vibes": "Great+Vibes",
  "Dancing Script": "Dancing+Script:wght@400;500;600;700",
  Caveat: "Caveat:wght@400;500;600;700",
  "Abril Fatface": "Abril+Fatface",
  Lora: "Lora:wght@400;500;600;700",
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

