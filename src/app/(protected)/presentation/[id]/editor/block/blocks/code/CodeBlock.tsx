import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/types/presentation";
import { createCodeContent, type CodeContent } from "../definitions";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { BlockWrapper } from "../../BlockWrapper";
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
        className="w-full overflow-hidden relative group p-0 border-none"
        style={{
          backgroundColor: isDark ? "#0d0d0d" : "#fafafa",
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
          }}
        >
          <div
            className="text-xs font-mono font-medium uppercase tracking-wider opacity-50"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            {language}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: isDark ? "#252525" : "#e5e5e5",
              color: isDark ? "#fff" : "#000",
            }}
          >
            {copied ? (
              <>
                <IconCheck size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <IconCopy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Area */}
        <div className="relative overflow-x-auto">
          <div className="flex">
            {showLineNumbers && (
              <div
                className="px-4 py-4 text-right select-none font-mono text-sm"
                style={{
                  backgroundColor: isDark ? "#141414" : "#f5f5f5",
                  color: isDark ? "#555" : "#aaa",
                }}
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="flex-1 px-4 py-4 font-mono text-sm leading-6 resize-none outline-none border-none bg-transparent"
              style={{
                color: isDark ? "#e5e5e5" : "#1a1a1a",
                minHeight: `${Math.max(lines.length * 1.5, 6)}rem`,
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
