"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CONFIG } from "@/lib/config";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { SlideCanvas } from "@/app/(protected)/docs/[id]/engine/layout/SlideCanvas";
import { EditorThemeProvider } from "@/app/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { convertApiSlideToRedux } from "@/lib/editor/adapters";
import { Slide, Theme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { Provider } from "react-redux";
import { store } from "@/store";

interface ExportSlideData {
  slide: any;
  theme: Theme;
}

/**
 * Export-optimized slide embed page.
 * This route is used by the Puppeteer screenshot service to capture slides.
 * It fetches slide data directly using an internal API key for authentication.
 */
const ExportSlideContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const slideId = params?.slideId as string;
  const presentationId = searchParams.get("presentationId");
  const exportKey = searchParams.get("exportKey");

  const [slideData, setSlideData] = useState<ExportSlideData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlideData = async () => {
      if (!slideId || !presentationId || !exportKey) {
        setError("Missing required parameters");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch slide data from internal export API
        const response = await fetch(
          `${CONFIG.API_URL}/presentation/${presentationId}/slides/${slideId}/export?exportKey=${exportKey}`,
          {
            headers: {
              "Content-Type": "application/json",
              apisecretkeycheck: CONFIG.API_SECRET,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch slide: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setSlideData(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch slide data");
        }
      } catch (err) {
        console.error("Export slide fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load slide");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlideData();
  }, [slideId, presentationId, exportKey]);

  if (isLoading) {
    return (
      <div 
        id="export-loading" 
        className="w-screen h-screen flex items-center justify-center bg-gray-900"
      >
        <div className="text-white text-lg">Loading slide...</div>
      </div>
    );
  }

  if (error || !slideData) {
    return (
      <div 
        id="export-error" 
        className="w-screen h-screen flex items-center justify-center bg-red-900"
      >
        <div className="text-white text-lg">{error || "No slide data"}</div>
      </div>
    );
  }

  // Convert the API slide format to Redux format
  const reduxSlide = convertApiSlideToRedux(slideData.slide);
  // Merge with defaults for a complete theme
  const theme: Theme = { ...DEFAULT_THEME, ...(slideData.theme || {}) };

  return (
    <EditorThemeProvider themeOverride={theme}>
      <ExportSlideRenderer slide={reduxSlide} theme={theme} />
    </EditorThemeProvider>
  );
};

interface ExportSlideRendererProps {
  slide: Slide;
  theme: Theme;
}

const ExportSlideRenderer = ({ slide, theme }: ExportSlideRendererProps) => {
  const isDark = theme.themeType === "dark";

  return (
    <>
      <GoogleFontsLoader />
      <div
        id="export-slide-container"
        className="export-ready w-screen h-screen overflow-hidden"
        style={{
          backgroundColor: theme.pageBackground,
          fontFamily: `${theme.fontFamily || 'Inter'}, sans-serif`,
        }}
      >
        {/* Mesh gradient background for presentation mode */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${theme.primary}${isDark ? '12' : '08'} 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 70% 80%, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '08' : '05'} 0%, transparent 50%)`,
          }}
        />

        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full">
            <SlideCanvas
              slide={slide}
              onUpdateBlock={() => {}}
              onDeleteRow={() => {}}
              onAddColumn={() => {}}
              onAddRowAtTop={() => {}}
              onAddRowAtBottom={() => {}}
              onUpdateColumnWidths={() => {}}
              enableDragHints={false}
              readOnly={true}
              fullWidth={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Wrapper that provides Redux store (needed for some internal components)
const ExportSlidePage = () => {
  return (
    <Provider store={store}>
      <ExportSlideContent />
    </Provider>
  );
};

export default ExportSlidePage;
