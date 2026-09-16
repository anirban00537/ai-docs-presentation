"use client";

import React, { useState } from "react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  themes: any[];
  selectedTheme: any;
  onSelectTheme: (theme: any) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  selectedTheme,
  onSelectTheme,
}) => {
  const [showAllThemes, setShowAllThemes] = useState(false);

  return (
    <div className="space-y-4 border-t border-secondary/10 pt-8">
        <div className="flex items-center justify-between px-2">
             <h3 className="text-sm font-semibold text-foreground">Customize your style</h3>
             {selectedTheme && <span className="text-xs text-primary font-medium">{selectedTheme.name}</span>}
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
             {themes.slice(0, showAllThemes ? undefined : 6).map(theme => (
                <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme)}
                    className={cn(
                        "group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200",
                        selectedTheme?.id === theme.id 
                            ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20 scale-105" 
                            : "bg-white/40 border-secondary/20 hover:border-primary/30 hover:bg-white hover:scale-105"
                    )}
                >
                    {/* Theme Preview Box */}
                    <div className="w-full aspect-[4/3] rounded-lg shadow-sm overflow-hidden relative border border-black/5">
                         <div className="absolute inset-0" style={{ backgroundColor: theme.themeData?.cardBackground || '#fff' }} />
                         <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-bl-full" style={{ backgroundColor: theme.themeData?.primary || '#8B5CF6' }} />
                         <div className="absolute bottom-2 left-2 text-[8px] font-bold" style={{ color: theme.themeData?.headingColor || '#000' }}>Title</div>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                        {theme.name}
                    </span>
                    {selectedTheme?.id === theme.id && (
                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                            <IconCheck size={8} />
                        </div>
                    )}
                </button>
             ))}
        </div>
        
        {themes.length > 6 && (
            <div className="flex justify-center mt-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllThemes(!showAllThemes)}
                    className="text-xs text-muted-foreground hover:text-primary h-8"
                >
                    {showAllThemes ? (
                        <><IconChevronDown className="rotate-180 mr-1" size={14} /> Show Less</>
                    ) : (
                        <><IconChevronDown className="mr-1" size={14} /> Show All Themes ({themes.length})</>
                    )}
                </Button>
            </div>
        )}
    </div>
  );
};
