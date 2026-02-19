import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseAndRender(text) {
  if (!text) return '';

  // Split by display math $$...$$, inline math $...$, and bold **...**
  const TOKEN_REGEX = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*)/g;
  const parts = text.split(TOKEN_REGEX);

  return parts
    .map((part) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const inner = part.slice(2, -2).trim();
        try {
          return `<span class="math-display-block">${katex.renderToString(inner, { displayMode: true, throwOnError: false })}</span>`;
        } catch {
          return `<span class="math-error">${escapeHtml(part)}</span>`;
        }
      }
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const inner = part.slice(1, -1).trim();
        try {
          return katex.renderToString(inner, { displayMode: false, throwOnError: false });
        } catch {
          return `<span class="math-error">${escapeHtml(part)}</span>`;
        }
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const inner = part.slice(2, -2);
        return `<strong>${escapeHtml(inner)}</strong>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

const MathDisplay = ({ text, className = '' }) => {
  const html = useMemo(() => {
    const rendered = parseAndRender(text);
    return DOMPurify.sanitize(rendered, {
      ADD_TAGS: [
        'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
        'mfrac', 'msqrt', 'mroot', 'mtext', 'annotation', 'annotation-xml',
        'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd', 'mspace',
        'mpadded', 'menclose', 'mglyph', 'mphantom', 'none',
      ],
      ADD_ATTR: ['xmlns', 'encoding', 'display', 'aria-hidden', 'mathvariant', 'stretchy', 'fence', 'separator', 'lspace', 'rspace', 'columnalign', 'rowalign', 'width', 'height', 'depth', 'minsize', 'maxsize', 'movablelimits', 'accent', 'accentunder'],
    });
  }, [text]);

  return (
    <span
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathDisplay;
