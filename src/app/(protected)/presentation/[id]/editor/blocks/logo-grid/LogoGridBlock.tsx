import React, { useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createLogoGridContent, type LogoGridContent } from "../definitions";
import { BlockWrapper } from "../../block/BlockWrapper";
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
import { IconTrash, IconPlus, IconPhoto, IconLink } from "@tabler/icons-react";

interface LogoGridBlockProps {
  block: Block;
  onUpdate: (content: LogoGridContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const LogoGridBlock: React.FC<LogoGridBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as LogoGridContent) ?? createLogoGridContent();
  const { logos, columns, grayscale = true } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempColumns, setTempColumns] = useState(columns.toString());
  const [tempGrayscale, setTempGrayscale] = useState(grayscale);
  const isDark = theme.themeType === "dark";

  const handleNameChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
      const newLogos = [...logos];
      newLogos[index] = { ...newLogos[index], name: newContent };
      onUpdate({ ...content, logos: newLogos });
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
      logos: [...logos, { name: "New Partner", link: "" }],
    });
  };

  const removeLogo = (index: number) => {
    const newLogos = logos.filter((_, i) => i !== index);
    onUpdate({ ...content, logos: newLogos });
  };

  const updateLogoImage = (index: number, url: string) => {
    const newLogos = [...logos];
    newLogos[index] = { ...newLogos[index], image: url };
    onUpdate({ ...content, logos: newLogos });
  };

  const updateLogoLink = (index: number, url: string) => {
    const newLogos = [...logos];
    newLogos[index] = { ...newLogos[index], link: url };
    onUpdate({ ...content, logos: newLogos });
  };

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
      <div className={`grid ${gridClass} gap-4 w-full p-4`}>
        {logos.map((logo, index) => (
          <CommonCard
            key={index}
            theme={theme}
            className="group/logo flex flex-col items-center justify-center p-5 relative"
          >
            {logo.image ? (
              <img
                src={logo.image}
                alt=""
                className={`max-w-full max-h-12 object-contain transition-all duration-300 ${
                  grayscale ? "grayscale group-hover/logo:grayscale-0" : ""
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
                  className="text-center font-medium text-sm opacity-60"
                  theme={theme}
                />
              </div>
            )}

            {/* Delete overlay */}
            <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLogo(index);
                }}
                style={{ color: "#ef4444" }}
              >
                <IconTrash size={14} />
              </button>
            </div>
          </CommonCard>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: isDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Logo Grid Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Manage logos and layout.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Columns
                </Label>
                <Select value={tempColumns} onValueChange={setTempColumns}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label
                  htmlFor="grayscale-mode"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  Grayscale
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Logos</Label>
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <IconPhoto size={14} className="opacity-40" />
                      <Input
                        placeholder="Image URL"
                        value={logo.image || ""}
                        onChange={(e) => updateLogoImage(index, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <IconLink size={14} className="opacity-40" />
                      <Input
                        placeholder="Link URL"
                        value={logo.link || ""}
                        onChange={(e) => updateLogoLink(index, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeLogo(index)}
                    className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 mt-1"
                    style={{ color: "#ef4444" }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addLogo}
                className="w-full p-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#aaa" : "#666",
                }}
              >
                <IconPlus size={14} />
                Add Logo
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ backgroundColor: theme.primary }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
