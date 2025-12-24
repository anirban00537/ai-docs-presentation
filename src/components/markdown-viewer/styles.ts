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
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--foreground);
    font-family: var(--font-sans);
  }

  .markdown-viewer-prosemirror:focus {
    outline: none;
  }

  /* Headings - Using Serif Font */
  .markdown-viewer-prosemirror h1 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.75rem;
    margin-top: 0;
    color: var(--foreground);
    letter-spacing: -0.01em;
  }

  .markdown-viewer-prosemirror h2 {
    font-family: var(--font-serif);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
    color: var(--foreground);
  }

  .markdown-viewer-prosemirror h3 {
    font-family: var(--font-serif);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 0.375rem;
    margin-top: 0.75rem;
    color: var(--foreground);
  }

  .markdown-viewer-prosemirror h4 {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    margin-top: 0.5rem;
    color: var(--foreground);
  }

  /* Paragraphs */
  .markdown-viewer-prosemirror p {
    margin: 0;
    margin-bottom: 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--foreground);
    opacity: 0.9;
  }

  .markdown-viewer-prosemirror p:last-child {
    margin-bottom: 0;
  }

  /* Lists - Themed Markers */
  .markdown-viewer-prosemirror ul,
  .markdown-viewer-prosemirror ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .markdown-viewer-prosemirror ul {
    list-style: disc;
  }

  .markdown-viewer-prosemirror ol {
    list-style: decimal;
  }

  .markdown-viewer-prosemirror li {
    margin: 0.25rem 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--foreground);
    opacity: 0.9;
  }

  .markdown-viewer-prosemirror li p {
    margin: 0;
  }

  .markdown-viewer-prosemirror li::marker {
    color: var(--primary);
    font-weight: 700;
  }

  /* Blockquote - Effortless Silk Aesthetic */
  .markdown-viewer-prosemirror blockquote {
    border-left: 3px solid var(--primary);
    padding: 0.75rem 1rem;
    margin: 1rem 0;
    color: var(--foreground);
    font-style: italic;
    font-size: 0.9375rem;
    background: color-mix(in srgb, var(--primary) 5%, transparent);
    border-radius: 0 1rem 1rem 0;
  }

  /* Code blocks */
  .markdown-viewer-prosemirror pre {
    background: color-mix(in srgb, var(--secondary) 10%, transparent);
    border-radius: 1rem;
    padding: 1rem;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    overflow-x: auto;
    margin: 1rem 0;
    border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent);
    color: var(--foreground);
  }

  .markdown-viewer-prosemirror code {
    background: color-mix(in srgb, var(--secondary) 20%, transparent);
    padding: 0.2rem 0.4rem;
    border-radius: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.875em;
    color: var(--primary);
    font-weight: 500;
  }

  .markdown-viewer-prosemirror pre code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
  }

  /* Links */
  .markdown-viewer-prosemirror a {
    color: var(--primary);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--primary) 30%, transparent);
    text-underline-offset: 3px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .markdown-viewer-prosemirror a:hover {
    color: var(--primary);
    text-decoration-color: var(--primary);
  }

  /* Strong and Emphasis */
  .markdown-viewer-prosemirror strong {
    font-weight: 700;
    color: var(--foreground);
  }

  .markdown-viewer-prosemirror em {
    font-style: italic;
  }

  /* Horizontal Rule */
  .markdown-viewer-prosemirror hr {
    border: none;
    border-top: 1px solid color-mix(in srgb, var(--secondary) 30%, transparent);
    margin: 1.25rem 0;
  }

  /* Empty state placeholder */
  .markdown-viewer-prosemirror p.is-empty:first-child::before {
    content: "Start typing...";
    color: var(--muted-foreground);
    opacity: 0.5;
    pointer-events: none;
    float: left;
    height: 0;
    font-style: italic;
  }

  /* Selection styling */
  .markdown-viewer-prosemirror ::selection {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
  }

  /* Smooth transitions */
  .markdown-viewer-prosemirror * {
    transition: all 0.2s ease;
  }
`;
