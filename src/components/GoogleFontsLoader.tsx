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
  "Space Grotesk": "Space+Grotesk:wght@300;400;500;600;700",
  Outfit: "Outfit:wght@100;200;300;400;500;600;700;800;900",
  "DM Sans": "DM+Sans:opsz,wght@9..40,100;9..40,200;9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800",
  Manrope: "Manrope:wght@200;300;400;500;600;700;800",
  "Work Sans": "Work+Sans:wght@100;200;300;400;500;600;700;800;900",
  Sora: "Sora:wght@100;200;300;400;500;600;700;800",
  Geist: "Geist:wght@100;200;300;400;500;600;700;800;900",
  "Clash Display": "Clash+Display:wght@200;300;400;500;600;700",
  "JetBrains Mono": "JetBrains+Mono:wght@100;200;300;400;500;600;700;800",
  Nunito: "Nunito:wght@200;300;400;500;600;700;800;900",
  "Source Sans Pro": "Source+Sans+Pro:wght@200;300;400;600;700;900",
  "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700",
  "Geist Mono": "Geist+Mono:wght@100;200;300;400;500;600;700;800;900",
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

