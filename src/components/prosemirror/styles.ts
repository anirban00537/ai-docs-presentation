export const PROSEMIRROR_STYLES = `
  .ProseMirror {
    outline: none;
    min-height: 40px;
    width: 100%;
  }
  .ProseMirror:focus {
    outline: none;
  }
  .ProseMirror h1 {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }
  .ProseMirror h2 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 0.5rem;
  }
  .ProseMirror h3 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.5rem;
  }
  .ProseMirror ul, .ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  .ProseMirror ul {
    list-style: disc;
  }
  .ProseMirror ol {
    list-style: decimal;
  }
  .ProseMirror li {
    margin: 0.25rem 0;
  }
  .ProseMirror blockquote {
    border-left: 3px solid #e5e7eb;
    padding-left: 1rem;
    margin: 0.5rem 0;
    color: #6b7280;
    font-style: italic;
  }
  .ProseMirror pre {
    background: #f3f4f6;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-family: monospace;
    font-size: 0.875rem;
    overflow-x: auto;
  }
  .ProseMirror code {
    background: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875em;
  }
  .ProseMirror pre code {
    background: none;
    padding: 0;
  }
  .ProseMirror p:empty::before,
  .ProseMirror h1:empty::before,
  .ProseMirror h2:empty::before,
  .ProseMirror h3:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }
`;

