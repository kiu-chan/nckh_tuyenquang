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

// Xử lý inline: math ($...$, $$...$$), bold (**...**), italic (*...*)
function renderInline(text) {
  if (!text) return '';

  const TOKEN_REGEX = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*|\*[^*]+?\*)/g;
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
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
        const inner = part.slice(1, -1);
        return `<em>${escapeHtml(inner)}</em>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

// Xử lý block-level markdown: headers, lists, hr, newlines
function parseBlock(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const result = [];
  let inList = false;
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
      result.push('<hr class="my-2 border-gray-300" />');
      continue;
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      if (inList) {
        result.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
      }
      const level = headerMatch[1].length;
      const headerClasses = {
        1: 'text-base font-bold mt-3 mb-1',
        2: 'text-sm font-bold mt-2 mb-1',
        3: 'text-sm font-semibold mt-2 mb-1',
      };
      result.push(`<h${level} class="${headerClasses[level]}">${renderInline(headerMatch[2])}</h${level}>`);
      continue;
    }

    // Unordered list items (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(listType === 'ol' ? '</ol>' : '</ul>');
        result.push('<ul class="list-disc list-inside my-1 space-y-0.5">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list items (1. 2. etc.)
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(listType === 'ol' ? '</ol>' : '</ul>');
        result.push('<ol class="list-decimal list-inside my-1 space-y-0.5">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Close list if no longer in list item
    if (inList) {
      result.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
    }

    // Empty line → spacing
    if (trimmed === '') {
      result.push('<div class="h-2"></div>');
      continue;
    }

    // Normal text line
    result.push(`<p class="my-0.5">${renderInline(trimmed)}</p>`);
  }

  if (inList) {
    result.push(listType === 'ol' ? '</ol>' : '</ul>');
  }

  return result.join('');
}

const SANITIZE_CONFIG = {
  ADD_TAGS: [
    'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
    'mfrac', 'msqrt', 'mroot', 'mtext', 'annotation', 'annotation-xml',
    'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd', 'mspace',
    'mpadded', 'menclose', 'mglyph', 'mphantom', 'none',
  ],
  ADD_ATTR: ['style', 'class', 'xmlns', 'encoding', 'display', 'aria-hidden', 'mathvariant', 'stretchy', 'fence', 'separator', 'lspace', 'rspace', 'columnalign', 'rowalign', 'width', 'height', 'depth', 'minsize', 'maxsize', 'movablelimits', 'accent', 'accentunder'],
};

const MathDisplay = ({ text, className = '', block = false }) => {
  const html = useMemo(() => {
    const rendered = block ? parseBlock(text) : renderInline(text);
    return DOMPurify.sanitize(rendered, SANITIZE_CONFIG);
  }, [text, block]);

  if (block) {
    return (
      <div
        className={`math-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathDisplay;
