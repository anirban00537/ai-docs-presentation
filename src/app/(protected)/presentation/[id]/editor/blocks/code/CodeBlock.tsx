import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/types/presentation";
import { createCodeContent, type CodeContent } from "../definitions";
import { IconCopy, IconCheck } from "@tabler/icons-react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeBlockProps {
  block: Block;
  onUpdate: (content: CodeContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "json",
  "xml",
  "sql",
  "bash",
  "plaintext",
];

import { CommonCard } from "../CommonCard";

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as CodeContent) ?? createCodeContent();
  const { language, code, showLineNumbers, theme: codeTheme } = content;
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [tempShowLineNumbers, setTempShowLineNumbers] =
    useState(showLineNumbers);
  const [tempCodeTheme, setTempCodeTheme] = useState(codeTheme);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ ...content, code: e.target.value });
    },
    [content, onUpdate]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleOpenEdit = () => {
    setTempLanguage(language);
    setTempShowLineNumbers(showLineNumbers);
    setTempCodeTheme(codeTheme);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      language: tempLanguage,
      showLineNumbers: tempShowLineNumbers,
      theme: tempCodeTheme,
    });
    setIsEditOpen(false);
  };

  const lines = code.split("\n");
  const isDark =
    codeTheme === "dark" || (!codeTheme && theme.themeType === "dark");
  const panelDark = theme.themeType === "dark";

  return (
    <BlockWrapper onEdit={handleOpenEdit} theme={theme}>
      <CommonCard
        theme={theme}
        className="w-full overflow-hidden relative group h-full flex flex-col border-none transition-all duration-300 hover:shadow-2xl"
        style={{ 
          borderRadius: "24px",
          backgroundColor: isDark ? "#08080a" : "#fafafa",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 relative overflow-hidden"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.05] blur-xl pointer-events-none"
            style={{ backgroundColor: theme.primary }}
          />

          <div
            className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 relative z-10"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            {language}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 relative z-10 border shadow-sm"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              color: isDark ? "#fff" : "#000",
              backdropFilter: "blur(8px)"
            }}
          >
            {copied ? (
              <>
                <IconCheck size={14} strokeWidth={2.5} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <IconCopy size={14} strokeWidth={2.5} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Area */}
        <div className="relative overflow-x-auto flex-1">
          <div className="flex h-full">
            {showLineNumbers && (
              <div
                className="px-6 py-6 text-right select-none font-mono text-sm border-r"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
                  borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "#444" : "#ccc",
                }}
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-7">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="flex-1 px-8 py-6 font-mono text-sm leading-7 resize-none outline-none border-none bg-transparent"
              style={{
                color: isDark ? "#d1d5db" : "#1f2937",
                minHeight: `${Math.max(lines.length * 1.75, 8)}rem`,
              }}
              rows={lines.length}
              spellCheck={false}
            />
          </div>
        </div>
      </CommonCard>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: panelDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: panelDark ? "#fff" : "#000" }}>
              Code Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: panelDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize code block appearance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Language
              </Label>
              <Select value={tempLanguage} onValueChange={setTempLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Line Numbers
              </Label>
              <Switch
                checked={tempShowLineNumbers}
                onCheckedChange={setTempShowLineNumbers}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Dark Theme
              </Label>
              <Switch
                checked={tempCodeTheme === "dark"}
                onCheckedChange={(checked) =>
                  setTempCodeTheme(checked ? "dark" : "light")
                }
              />
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
