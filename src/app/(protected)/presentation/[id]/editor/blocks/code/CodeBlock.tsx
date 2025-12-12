import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { createCodeContent, type CodeContent } from "../definitions";
import { withAlpha } from "../utils";
import { IconCopy, IconCheck } from "@tabler/icons-react";

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

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({
        ...content,
        code: e.target.value,
      });
    },
    [content, onUpdate]
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({
        ...content,
        language: e.target.value,
      });
    },
    [content, onUpdate]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const lines = code.split("\n");
  const isDark = codeTheme === "dark" || theme.themeType === "dark";

  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative group"
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa",
        border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
        boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: isDark ? "#252526" : "#e9ecef",
          borderColor: withAlpha(theme.primary, 0.1),
        }}
      >
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-3 py-1 rounded text-sm font-medium border-none outline-none cursor-pointer"
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
            color: isDark ? "#d4d4d4" : theme.bodyColor,
          }}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
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
            className="flex-1 px-4 py-4 font-mono text-sm leading-6 resize-none outline-none border-none"
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              color: isDark ? "#d4d4d4" : "#212529",
              minHeight: `${lines.length * 1.5}rem`,
            }}
            rows={lines.length}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
