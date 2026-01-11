// Base ProseMirror styles - these will be injected globally ONCE
export const PROSEMIRROR_STYLES = `
  .ProseMirror {
    outline: none;
    min-height: 40px;
    width: 100%;
  }
  .ProseMirror:focus {
    outline: none;
  }
  
  /* Remove top margin from first child to eliminate unwanted spacing */
  .ProseMirror > *:first-child {
    margin-top: 0 !important;
  }
  
  /* Default fixed font sizes for editor mode */
  .ProseMirror h1 {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.35;
    margin-bottom: 0.5rem;
  }
  .ProseMirror h2 {
    font-size: 2.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0.4rem;
  }
  .ProseMirror h3 {
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 1.45;
    margin-bottom: 0.3rem;
  }
  .ProseMirror h4 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.5;
    margin-bottom: 0.25rem;
  }
  .ProseMirror p,
  .ProseMirror li {
    font-size: 1rem;
    line-height: 1.75;
  }
  .ProseMirror p {
    margin-bottom: 0.5rem;
  }
  .ProseMirror ul, .ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0.6rem 0;
  }
  .ProseMirror ul {
    list-style: disc;
  }
  .ProseMirror ol {
    list-style: decimal;
  }
  .ProseMirror li {
    margin: 0.3rem 0;
  }
  .ProseMirror blockquote {
    border-left: 3px solid #e5e7eb;
    padding-left: 1rem;
    margin: 0.6rem 0;
    color: #6b7280;
    font-style: italic;
    line-height: 1.75;
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
  .ProseMirror .is-empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
    opacity: 0.4;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    font-weight: 400;
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Presentation mode: viewport-responsive font sizes */
  .presentation-mode .ProseMirror h1 {
    font-size: clamp(1.75rem, 3.2vw, 4.5rem);
  }
  .presentation-mode .ProseMirror h2 {
    font-size: clamp(1.35rem, 2.4vw, 3.5rem);
  }
  .presentation-mode .ProseMirror h3 {
    font-size: clamp(1.125rem, 2vw, 2.75rem);
  }
  .presentation-mode .ProseMirror h4 {
    font-size: clamp(1rem, 1.6vw, 2.25rem);
  }
  .presentation-mode .ProseMirror p,
  .presentation-mode .ProseMirror li {
    font-size: clamp(0.8rem, 1.2vw, 1.75rem);
  }
  .presentation-mode .ProseMirror ul,
  .presentation-mode .ProseMirror ol {
    padding-left: clamp(0.875rem, 1.6vw, 2.5rem);
    margin: clamp(0.2rem, 0.4vw, 0.75rem) 0;
  }
  .presentation-mode .ProseMirror li {
    margin: clamp(0.1rem, 0.2vw, 0.4rem) 0;
  }
  .presentation-mode .ProseMirror blockquote {
    border-left-width: clamp(2px, 0.2vw, 4px);
    padding-left: clamp(0.625rem, 1.2vw, 1.5rem);
    margin: clamp(0.2rem, 0.4vw, 0.75rem) 0;
    font-size: clamp(0.8rem, 1.2vw, 1.75rem);
  }
  .presentation-mode .ProseMirror pre {
    border-radius: clamp(0.2rem, 0.4vw, 0.75rem);
    padding: clamp(0.4rem, 0.8vw, 1.25rem);
    font-size: clamp(0.7rem, 1vw, 1.5rem);
  }
  .presentation-mode .ProseMirror code {
    padding: clamp(0.05rem, 0.1vw, 0.2rem) clamp(0.1rem, 0.2vw, 0.4rem);
    border-radius: clamp(0.1rem, 0.2vw, 0.4rem);
    font-size: clamp(0.7rem, 1vw, 1.5rem);
  }
  
  /* Image cursor blink animation */
  @keyframes image-cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  .image-bottom-cursor {
    animation: image-cursor-blink 1s step-end infinite;
  }
  .prosemirror-image-wrapper .group:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

// Track if base styles have been injected globally
let baseStylesInjected = false;

/**
 * Injects base ProseMirror styles into the document head ONCE.
 * This prevents memory bloat from duplicating styles per editor instance.
 */
export function injectBaseStyles(): void {
  if (typeof document === 'undefined') return;
  if (baseStylesInjected) return;

  const styleId = 'prosemirror-base-styles';
  if (document.getElementById(styleId)) {
    baseStylesInjected = true;
    return;
  }

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = PROSEMIRROR_STYLES;
  document.head.appendChild(styleEl);
  baseStylesInjected = true;
}
