/**
 * Custom ProseMirror styles for the Markdown Viewer component
 * These styles are optimized for compact display with reduced font sizes
 * and a clean, minimal aesthetic for outline viewing
 */
export const MARKDOWN_VIEWER_STYLES = `
  .markdown-viewer-prosemirror {
    outline: none;
    min-height: 24px;
    width: 100%;
    font-size: 0.875rem;
    line-height: 1.6;
    color: inherit;
  }

  .markdown-viewer-prosemirror:focus {
    outline: none;
  }

  /* Headings - Compact sizes */
  .markdown-viewer-prosemirror h1 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.375rem;
    margin-top: 0;
    color: inherit;
  }

  .markdown-viewer-prosemirror h2 {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.35;
    margin-bottom: 0.375rem;
    margin-top: 0.5rem;
    color: inherit;
  }

  .markdown-viewer-prosemirror h3 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    margin-top: 0.5rem;
    color: inherit;
  }

  .markdown-viewer-prosemirror h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    margin-top: 0.375rem;
    color: inherit;
  }

  /* Paragraphs */
  .markdown-viewer-prosemirror p {
    margin: 0;
    margin-bottom: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .markdown-viewer-prosemirror p:last-child {
    margin-bottom: 0;
  }

  /* Lists - Compact */
  .markdown-viewer-prosemirror ul,
  .markdown-viewer-prosemirror ol {
    padding-left: 1.25rem;
    margin: 0.25rem 0;
  }

  .markdown-viewer-prosemirror ul {
    list-style: disc;
  }

  .markdown-viewer-prosemirror ol {
    list-style: decimal;
  }

  .markdown-viewer-prosemirror li {
    margin: 0.125rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .markdown-viewer-prosemirror li p {
    margin: 0;
  }

  .markdown-viewer-prosemirror li::marker {
    color: rgba(139, 92, 246, 0.7);
  }

  /* Blockquote - Styled for glassmorphism */
  .markdown-viewer-prosemirror blockquote {
    border-left: 2px solid rgba(139, 92, 246, 0.5);
    padding-left: 0.75rem;
    margin: 0.375rem 0;
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
    font-size: 0.8125rem;
    background: rgba(139, 92, 246, 0.05);
    border-radius: 0 0.375rem 0.375rem 0;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-right: 0.5rem;
  }

  /* Code blocks - Compact */
  .markdown-viewer-prosemirror pre {
    background: rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.75rem;
    overflow-x: auto;
    margin: 0.375rem 0;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .markdown-viewer-prosemirror code {
    background: rgba(139, 92, 246, 0.1);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.8125em;
    color: #7c3aed;
  }

  .markdown-viewer-prosemirror pre code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  /* Links */
  .markdown-viewer-prosemirror a {
    color: #8b5cf6;
    text-decoration: underline;
    text-decoration-color: rgba(139, 92, 246, 0.3);
    text-underline-offset: 2px;
    transition: all 0.2s ease;
  }

  .markdown-viewer-prosemirror a:hover {
    color: #7c3aed;
    text-decoration-color: rgba(124, 58, 237, 0.6);
  }

  /* Strong and Emphasis */
  .markdown-viewer-prosemirror strong {
    font-weight: 600;
    color: inherit;
  }

  .markdown-viewer-prosemirror em {
    font-style: italic;
  }

  /* Horizontal Rule */
  .markdown-viewer-prosemirror hr {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 0.75rem 0;
  }

  /* Empty state placeholder */
  .markdown-viewer-prosemirror p.is-empty:first-child::before,
  .markdown-viewer-prosemirror h1.is-empty:first-child::before,
  .markdown-viewer-prosemirror h2.is-empty:first-child::before,
  .markdown-viewer-prosemirror h3.is-empty:first-child::before {
    content: "Start typing...";
    color: rgba(0, 0, 0, 0.35);
    pointer-events: none;
    float: left;
    height: 0;
    font-size: 0.875rem;
    font-style: italic;
  }

  /* Selection styling */
  .markdown-viewer-prosemirror ::selection {
    background: rgba(139, 92, 246, 0.2);
  }

  /* Focus ring for editable mode */
  .markdown-viewer-prosemirror.ProseMirror-focused {
    outline: none;
  }

  /* Smooth transitions */
  .markdown-viewer-prosemirror * {
    transition: color 0.2s ease;
  }
`;
