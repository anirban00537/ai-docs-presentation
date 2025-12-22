import React from "react";
import { type Slide, type Theme, updateSlideAccent, toggleSlideAccent } from "@/store/slices/slidesSlice";
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

interface SlideSettingsProps {
  slide: Slide;
  theme: Theme;
  onOpenImagePicker: () => void;
}

export const SlideSettings: React.FC<SlideSettingsProps> = ({
  slide,
  theme,
  onOpenImagePicker,
}) => {
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
    if (!accent) {
      dispatch(toggleSlideAccent({ slideId: slide.id }));
      // The toggleSlideAccent currently defaults to "left", we might need to update it
      // but for now let's just update the position right after if it exists
      setTimeout(() => {
        dispatch(updateSlideAccent({ slideId: slide.id, update: { position: pos } }));
      }, 0);
    } else {
      dispatch(updateSlideAccent({ slideId: slide.id, update: { position: pos } }));
    }
  };

  const handleToggleAccent = () => {
    dispatch(toggleSlideAccent({ slideId: slide.id }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/5 hover:scale-110 transition-all pointer-events-auto"
        >
          <IconDotsVertical size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
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
                    ? "bg-primary/10 border-primary text-primary shadow-sm" 
                    : "border-transparent text-muted-foreground hover:bg-muted"
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
                accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
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

          {/* Card Color (Placeholder based on screenshot) */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <IconWallpaper size={18} />
              </div>
              <span className="text-sm font-medium">Card color</span>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-2 px-3 rounded-full opacity-50 cursor-not-allowed">
              <div className="w-4 h-4 rounded-md border border-black/10 shadow-sm" style={{ backgroundColor: theme.cardBackground }} />
              <span className="text-xs font-semibold uppercase">Default</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
