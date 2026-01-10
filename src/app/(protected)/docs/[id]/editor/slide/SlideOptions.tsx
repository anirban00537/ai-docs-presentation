import React from "react";
import { type Slide, updateSlideAccent, toggleSlideAccent } from "@/store/slices/slidesSlice";
import { useEditorTheme } from "@/app/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  IconLayoutSidebar, 
  IconLayoutSidebarRight, 
  IconLayoutNavbar, 
  IconLayoutBottombar, 
  IconWallpaper,
  IconPhoto,
  IconTrash,
  IconDotsVertical,
  IconEyeOff,
  IconEye
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SlideOptionsProps {
  slide: Slide;
  onOpenImagePicker: () => void;
  onUpdateAccent?: (slideId: string, accent: any) => void;
  onToggleAccent?: (slideId: string) => void;
}

export const SlideOptions: React.FC<SlideOptionsProps> = ({
  slide,
  onOpenImagePicker,
  onUpdateAccent,
  onToggleAccent,
}) => {
  const theme = useEditorTheme();
  const dispatch = useAppDispatch();
  const accent = slide.accent;

  const positions: { id: "left" | "right" | "top" | "bottom" | "background"; icon: React.ReactNode; label: string }[] = [
    { id: "background", icon: <IconWallpaper size={20} />, label: "Background" },
    { id: "top", icon: <IconLayoutNavbar size={20} />, label: "Top" },
    { id: "left", icon: <IconLayoutSidebar size={20} />, label: "Left" },
    { id: "right", icon: <IconLayoutSidebarRight size={20} />, label: "Right" },
    { id: "bottom", icon: <IconLayoutBottombar size={20} />, label: "Bottom" },
  ];

  const handlePositionChange = (pos: "left" | "right" | "top" | "bottom" | "background") => {
    if (onUpdateAccent) {
      // Use custom handler (for layout editor)
      if (!accent) {
        // Create new accent with the selected position
        onUpdateAccent(slide.id, { position: pos, size: 40, url: undefined });
      } else {
        // Update existing accent position
        onUpdateAccent(slide.id, { ...accent, position: pos });
      }
    } else {
      // Use Redux dispatch (for presentation editor)
      if (!accent) {
        dispatch(toggleSlideAccent({ slideId: slide.id }));
        setTimeout(() => {
          dispatch(updateSlideAccent({ slideId: slide.id, update: { position: pos } }));
        }, 0);
      } else {
        dispatch(updateSlideAccent({ slideId: slide.id, update: { position: pos } }));
      }
    }
  };

  const handleToggleAccent = () => {
    if (onToggleAccent) {
      // Use custom handler (for layout editor)
      onToggleAccent(slide.id);
    } else {
      // Use Redux dispatch (for presentation editor)
      dispatch(toggleSlideAccent({ slideId: slide.id }));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 rounded-lg transition-all flex items-center justify-center hover:text-primary hover:bg-black/5 dark:hover:bg-white/10",
            theme.themeType === "dark" ? "text-white/60" : "text-muted-foreground"
          )}
        >
          <IconDotsVertical size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0 overflow-hidden shadow-2xl backdrop-blur-2xl border-none",
          theme.themeType === "dark" ? "text-white" : "text-slate-900"
        )}
        align="start"
        style={{
          backgroundColor: theme.themeType === "dark" ? "rgba(20, 20, 25, 0.7)" : "rgba(255, 255, 255, 0.6)",
          border: `1px solid ${theme.themeType === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.05)"}`,
        }}
      >
        <div className="p-4 flex flex-col gap-4">
          {/* Layout Row */}
          <div className="flex items-center justify-between gap-2">
            {positions.map((pos) => (
              <Button
                key={pos.id}
                variant="ghost"
                size="icon"
                onClick={() => handlePositionChange(pos.id)}
                className={cn(
                  "h-12 w-12 rounded-xl transition-all border",
                  accent?.position === pos.id 
                    ? `bg-primary/20 border-primary text-primary shadow-sm` 
                    : cn(
                        "border-transparent hover:bg-black/5 dark:hover:bg-white/5",
                        theme.themeType === "dark" ? "text-white/60" : "text-muted-foreground"
                      )
                )}
                title={pos.label}
              >
                {pos.icon}
              </Button>
            ))}
          </div>

          <Separator className="opacity-50" />

          {/* Accent Image Section */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                accent ? "bg-primary/10 text-primary" : "bg-black/5 dark:bg-white/5 text-white/40 dark:text-white/40"
              )}>
                <IconPhoto size={18} />
              </div>
              <span className="text-sm font-medium">Accent image</span>
            </div>
            <div className="flex items-center gap-1">
              {accent && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                  onClick={onOpenImagePicker}
                >
                  Edit
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-lg",
                  accent ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "text-muted-foreground"
                )}
                onClick={handleToggleAccent}
              >
                {accent ? <IconTrash size={16} /> : <IconEyeOff size={16} />}
              </Button>
            </div>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
};

