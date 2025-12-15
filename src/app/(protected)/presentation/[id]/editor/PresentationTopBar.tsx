import React from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectPresentation,
  selectTheme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { Button } from "@/components/ui/button";
import { IconShare, IconPlayerPlay, IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PresentationTopBar: React.FC<{
  onPresentClick?: () => void;
}> = ({ onPresentClick }) => {
  const presentation = useAppSelector(selectPresentation);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  
  const isDark = theme.themeType === "dark";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  if (!presentation) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: isDark 
          ? "rgba(15, 15, 18, 0.8)" 
          : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left side - Title */}
          <div className="flex items-center gap-3">
            <h1
              className="text-base font-medium truncate max-w-md"
              style={{ color: textPrimary }}
            >
              {presentation.title || "Untitled Presentation"}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            {/* Undo/Redo Buttons */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                      onClick={undo}
                      disabled={!canUndo}
                      style={{ color: textSecondary }}
                    >
                      <IconArrowBackUp size={18} stroke={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Undo <span className="opacity-50 ml-1">⌘Z</span>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                      onClick={redo}
                      disabled={!canRedo}
                      style={{ color: textSecondary }}
                    >
                      <IconArrowForwardUp size={18} stroke={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Redo <span className="opacity-50 ml-1">⌘⇧Z</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Divider */}
            <div
              className="w-px h-4 mx-2"
              style={{ 
                backgroundColor: isDark 
                  ? "rgba(255,255,255,0.1)" 
                  : "rgba(0,0,0,0.08)" 
              }}
            />

            {/* Share Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: textSecondary }}
            >
              <IconShare size={16} stroke={1.5} />
              <span>Share</span>
            </button>

            {/* Present Button */}
            <button
              onClick={onPresentClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: theme.primary,
              }}
            >
              <IconPlayerPlay size={16} stroke={1.5} />
              <span>Present</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
