import React, { useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createLogoGridContent, type LogoGridContent } from "../definitions";
import { withAlpha } from "../utils";
import { BlockWrapper } from "../BlockWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { createParagraphContent } from "../definitions/common";

interface LogoGridBlockProps {
  block: Block;
  onUpdate: (content: LogoGridContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as LogoGridContent) ?? createLogoGridContent();
  const { logos, columns, grayscale = true } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Local state
  const [tempColumns, setTempColumns] = useState(columns.toString());
  const [tempGrayscale, setTempGrayscale] = useState(grayscale);

  const handleNameChange = useCallback(
    (index: number, newContent: any) => {
      const newLogos = [...logos];
      newLogos[index] = {
        ...newLogos[index],
        name: newContent,
      };
      onUpdate({
        ...content,
        logos: newLogos,
      });
    },
    [logos, content, onUpdate]
  );

  const handleOpenEdit = () => {
    setTempColumns(columns.toString());
    setTempGrayscale(grayscale);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      columns: parseInt(tempColumns) as 3 | 4 | 5 | 6,
      grayscale: tempGrayscale,
    });
    setIsEditOpen(false);
  };

  const addLogo = () => {
    onUpdate({
      ...content,
      logos: [...logos, { name: createParagraphContent("New Partner"), link: "" }],
    });
  };

  const removeLogo = (index: number) => {
    const newLogos = logos.filter((_, i) => i !== index);
    onUpdate({ ...content, logos: newLogos });
  };

  const updateLogoImage = (index: number, url: string) => {
     const newLogos = [...logos];
      newLogos[index] = {
        ...newLogos[index],
        image: url,
      };
      onUpdate({ ...content, logos: newLogos });
  }

   const updateLogoLink = (index: number, url: string) => {
     const newLogos = [...logos];
      newLogos[index] = {
        ...newLogos[index],
        link: url,
      };
      onUpdate({ ...content, logos: newLogos });
  }

  const gridClass =
    columns === 3
      ? "grid-cols-3"
      : columns === 4
      ? "grid-cols-4"
      : columns === 5
      ? "grid-cols-5"
      : "grid-cols-6";

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addLogo} theme={theme}>
      <div
        className={`grid ${gridClass} gap-8 w-full transition-all duration-300`}
        style={{
          padding: "2rem",
        }}
      >
        {logos.map((logo, index) => (
          <div
            key={index}
            className="group flex flex-col items-center justify-center p-6 rounded-xl transition-all relative"
            style={{
              backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.3),
              border: `1px solid ${withAlpha(theme.primary, 0.08)}`,
            }}
          >
            {logo.image ? (
              <img
                src={logo.image}
                alt=""
                className={`max-w-full max-h-16 object-contain transition-all duration-300 ${
                  grayscale ? "grayscale group-hover:grayscale-0" : ""
                }`}
              />
            ) : (
              <div className="w-full">
                <ProseMirrorEditor
                  key={`${block.id}-logo-${index}`}
                  blockId={`${block.id}-logo-${index}`}
                  value={logo.name}
                  onChange={(newContent) => handleNameChange(index, newContent)}
                  placeholder="Company Name"
                  className="text-center font-semibold text-sm opacity-70"
                />
              </div>
            )}
             {/* Simple Edit Overlay for Image/Link */}
             <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                 <button 
                    onClick={(e) => { e.stopPropagation(); removeLogo(index); }}
                    className="p-1 bg-white/80 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
             </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Logo Grid</DialogTitle>
             <DialogDescription>
                Manage logos and layout settings.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                    <Label>Columns</Label>
                    <Select
                        value={tempColumns}
                        onValueChange={setTempColumns}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select columns" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3">3 Columns</SelectItem>
                        <SelectItem value="4">4 Columns</SelectItem>
                        <SelectItem value="5">5 Columns</SelectItem>
                        <SelectItem value="6">6 Columns</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <Switch
                        id="grayscale-mode"
                        checked={tempGrayscale}
                        onCheckedChange={setTempGrayscale}
                    />
                    <Label htmlFor="grayscale-mode">Grayscale Images</Label>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Logos</Label>
                {logos.map((logo, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20">
                        <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 opacity-50" />
                                <Input 
                                    placeholder="Image URL (empty for text)"
                                    value={logo.image || ""}
                                    onChange={(e) => updateLogoImage(index, e.target.value)}
                                    className="h-8 text-xs"
                                />
                             </div>
                              <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 opacity-50" />
                                <Input 
                                    placeholder="Link URL"
                                    value={logo.link || ""}
                                    onChange={(e) => updateLogoLink(index, e.target.value)}
                                     className="h-8 text-xs"
                                />
                             </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLogo(index)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addLogo} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Logo
                </Button>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
