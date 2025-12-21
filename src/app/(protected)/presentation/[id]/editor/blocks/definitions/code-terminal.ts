import { CodeTerminalContent } from "@/types/presentation";

export const createCodeTerminalContent = (
  command: string = "npm install butterfast",
  output: string = "✨ Success! Added 32 packages in 0.5s"
): CodeTerminalContent => ({
  type: "code-terminal",
  command,
  output,
});

export const normalizeCodeTerminalContent = (
  content: any
): CodeTerminalContent => {
  const incoming = content as CodeTerminalContent | undefined;
  return {
    type: "code-terminal",
    command: incoming?.command ?? "npm install butterfast",
    output: incoming?.output ?? "✨ Success! Added 32 packages in 0.5s",
  };
};
