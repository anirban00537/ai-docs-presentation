import { CodeTerminalContentSchema, type CodeTerminalContent } from "@/types/presentation";

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
  const result = CodeTerminalContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  return createCodeTerminalContent(content?.command, content?.output);
};
