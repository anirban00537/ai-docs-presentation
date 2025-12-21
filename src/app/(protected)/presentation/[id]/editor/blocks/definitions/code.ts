import { CodeContent } from "@/types/presentation";


export const createCodeContent = (): CodeContent => ({
  type: "code",
  language: "javascript",
  code: `function greet(name) {
  return \`Hello, \${name}!\`;
}`,
  showLineNumbers: true,
  theme: "light",
});

export const normalizeCodeContent = (content: any): CodeContent => {
  const incoming = content as CodeContent | undefined;
  if (incoming) {
    return {
      type: "code",
      language: incoming.language ?? "javascript",
      code: incoming.code ?? "",
      showLineNumbers: incoming.showLineNumbers ?? true,
      theme: incoming.theme ?? "light",
    };
  }
  return createCodeContent();
};
