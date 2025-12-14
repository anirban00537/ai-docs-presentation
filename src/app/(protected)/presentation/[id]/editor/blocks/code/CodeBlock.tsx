import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { createCodeContent, type CodeContent } from "../definitions";
import { withAlpha } from "../utils";
import { IconCopy, IconCheck } from "@tabler/icons-react";
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

interface CodeBlockProps {
  block: Block;
  onUpdate: (content: CodeContent) => void;
  theme: Theme;
  placeholder?: string;
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

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as CodeContent) ?? createCodeContent();
  const { language, code, showLineNumbers, theme: codeTheme } = content;
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Local state
  const [tempLanguage, setTempLanguage] = useState(language);
  const [tempShowLineNumbers, setTempShowLineNumbers] = useState(showLineNumbers);
  const [tempCodeTheme, setTempCodeTheme] = useState(codeTheme);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({
        ...content,
        code: e.target.value,
      });
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
  const isDark = (codeTheme === "dark" || (!codeTheme && theme.themeType === "dark"));

  return (
    <BlockWrapper onEdit={handleOpenEdit} theme={theme}>
      <div
        className="w-full rounded-xl overflow-hidden relative group"
        style={{
          backgroundColor: isDark ? "#121212" : "#ffffff",
          border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            backgroundColor: isDark ? "#252526" : "#e9ecef",
            borderColor: withAlpha(theme.primary, 0.1),
          }}
        >
          <div className="text-xs font-mono opacity-80 uppercase" style={{ color: isDark ? "#d4d4d4" : theme.bodyColor }}>
              {language}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors"
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              color: isDark ? "#d4d4d4" : theme.bodyColor,
            }}
          >
            {copied ? (
              <>
                <IconCheck className="size-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <IconCopy className="size-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="relative overflow-x-auto">
          <div className="flex">
            {showLineNumbers && (
              <div
                className="px-4 py-4 text-right select-none font-mono text-sm border-r"
                style={{
                  backgroundColor: isDark ? "#252526" : "#f1f3f5",
                  color: isDark ? "#858585" : "#868e96",
                  borderColor: withAlpha(theme.primary, 0.1),
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
                color: isDark ? "#d4d4d4" : "#212529",
                minHeight: `${Math.max(lines.length * 1.5, 6)}rem`,
              }}
              rows={lines.length}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Code Block</DialogTitle>
             <DialogDescription>
                Customize code snippets.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="space-y-2">
                <Label>Language</Label>
                <Select
                    value={tempLanguage}
                    onValueChange={(v: string) => setTempLanguage(v)}
                >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {languages.map((lang) => (
                         <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="line-numbers">Show Line Numbers</Label>
                <Switch
                  id="line-numbers"
                  checked={tempShowLineNumbers}
                  onCheckedChange={setTempShowLineNumbers}
                />
              </div>
               <div className="flex items-center justify-between">
                <Label htmlFor="theme-select">Dark Theme</Label>
                 <Switch
                  id="theme-select"
                  checked={tempCodeTheme === 'dark'}
                  onCheckedChange={(checked) => setTempCodeTheme(checked ? 'dark' : 'light')}
                />
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
