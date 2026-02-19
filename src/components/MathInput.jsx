import { useState, useRef, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MathDisplay from './MathDisplay';

// ===== Ký hiệu chèn trực tiếp =====
const SIMPLE_SYMBOLS = [
  {
    label: 'Phổ biến',
    symbols: [
      { label: 'B', title: 'In đậm', type: 'bold' },
      { label: '²', title: 'Bình phương', insert: '²' },
      { label: '³', title: 'Lập phương', insert: '³' },
      { label: '⁴', title: 'Mũ 4', insert: '⁴' },
      { label: '±', title: 'Cộng trừ', insert: '±' },
      { label: '≤', title: 'Nhỏ hơn hoặc bằng', insert: '≤' },
      { label: '≥', title: 'Lớn hơn hoặc bằng', insert: '≥' },
      { label: '≠', title: 'Khác', insert: '≠' },
      { label: '≈', title: 'Xấp xỉ', insert: '≈' },
      { label: '∞', title: 'Vô cùng', insert: '∞' },
      { label: '°', title: 'Độ', insert: '°' },
      { label: '→', title: 'Mũi tên phải', insert: '→' },
      { label: '⇒', title: 'Suy ra', insert: '⇒' },
      { label: '⇔', title: 'Tương đương', insert: '⇔' },
      { label: '∈', title: 'Thuộc', insert: '∈' },
      { label: '∉', title: 'Không thuộc', insert: '∉' },
      { label: '⊂', title: 'Tập con', insert: '⊂' },
      { label: '∪', title: 'Hợp', insert: '∪' },
      { label: '∩', title: 'Giao', insert: '∩' },
      { label: '∅', title: 'Tập rỗng', insert: '∅' },
      { label: '∀', title: 'Với mọi', insert: '∀' },
      { label: '∃', title: 'Tồn tại', insert: '∃' },
    ],
  },
  {
    label: 'Hy Lạp',
    symbols: [
      { label: 'α', title: 'Alpha', insert: 'α' },
      { label: 'β', title: 'Beta', insert: 'β' },
      { label: 'γ', title: 'Gamma', insert: 'γ' },
      { label: 'δ', title: 'Delta', insert: 'δ' },
      { label: 'π', title: 'Pi', insert: 'π' },
      { label: 'θ', title: 'Theta', insert: 'θ' },
      { label: 'λ', title: 'Lambda', insert: 'λ' },
      { label: 'μ', title: 'Mu', insert: 'μ' },
      { label: 'σ', title: 'Sigma', insert: 'σ' },
      { label: 'ω', title: 'Omega', insert: 'ω' },
      { label: 'φ', title: 'Phi', insert: 'φ' },
      { label: 'ε', title: 'Epsilon', insert: 'ε' },
      { label: 'Δ', title: 'Delta lớn', insert: 'Δ' },
      { label: 'Σ', title: 'Sigma lớn', insert: 'Σ' },
      { label: 'Ω', title: 'Omega lớn', insert: 'Ω' },
      { label: 'Π', title: 'Pi lớn', insert: 'Π' },
    ],
  },
  {
    label: 'Hóa & Lý',
    symbols: [
      { label: '₀', title: 'Chỉ số 0', insert: '₀' },
      { label: '₁', title: 'Chỉ số 1', insert: '₁' },
      { label: '₂', title: 'Chỉ số 2', insert: '₂' },
      { label: '₃', title: 'Chỉ số 3', insert: '₃' },
      { label: '₄', title: 'Chỉ số 4', insert: '₄' },
      { label: '⁺', title: 'Ion dương', insert: '⁺' },
      { label: '⁻', title: 'Ion âm', insert: '⁻' },
      { label: '↑', title: 'Khí thoát ra', insert: '↑' },
      { label: '↓', title: 'Kết tủa', insert: '↓' },
      { label: '⇌', title: 'Cân bằng', insert: '⇌' },
      { label: '°C', title: 'Độ C', insert: '°C' },
    ],
  },
];

// ===== Nút công thức con cho popup lồng =====
const NESTED_SHORTCUTS = [
  { label: 'xⁿ', title: 'Lũy thừa', build: (v) => `${v || 'x'}^{${v ? '' : 'n'}}` },
  { label: 'x_n', title: 'Chỉ số dưới', build: (v) => `${v || 'x'}_{${v ? '' : 'n'}}` },
  { label: '√', title: 'Căn bậc 2', build: (v) => `\\sqrt{${v || ''}}` },
  { label: 'a/b', title: 'Phân số', build: (v) => `\\frac{${v || 'a'}}{b}` },
];

// ===== Công thức phức tạp =====
const FORMULA_TEMPLATES = [
  {
    label: 'Phân số', icon: 'ᵃ⁄ᵦ',
    fields: [
      { key: 'num', label: 'Tử số', placeholder: 'VD: a + b' },
      { key: 'den', label: 'Mẫu số', placeholder: 'VD: 2' },
    ],
    build: (v) => `$\\frac{${v.num || 'a'}}{${v.den || 'b'}}$`,
  },
  {
    label: 'Căn bậc 2', icon: '√x',
    fields: [{ key: 'expr', label: 'Biểu thức trong căn', placeholder: 'VD: x + 1' }],
    build: (v) => `$\\sqrt{${v.expr || 'x'}}$`,
  },
  {
    label: 'Căn bậc n', icon: 'ⁿ√x',
    fields: [
      { key: 'n', label: 'Bậc', placeholder: 'VD: 3' },
      { key: 'expr', label: 'Biểu thức trong căn', placeholder: 'VD: x' },
    ],
    build: (v) => `$\\sqrt[${v.n || 'n'}]{${v.expr || 'x'}}$`,
  },
  {
    label: 'Lũy thừa', icon: 'xⁿ',
    fields: [
      { key: 'base', label: 'Cơ số', placeholder: 'VD: x' },
      { key: 'exp', label: 'Số mũ', placeholder: 'VD: 2' },
    ],
    build: (v) => `$${v.base || 'x'}^{${v.exp || 'n'}}$`,
  },
  {
    label: 'Chỉ số dưới', icon: 'xₙ',
    fields: [
      { key: 'base', label: 'Ký hiệu', placeholder: 'VD: a' },
      { key: 'sub', label: 'Chỉ số', placeholder: 'VD: n' },
    ],
    build: (v) => `$${v.base || 'x'}_{${v.sub || 'n'}}$`,
  },
  {
    label: 'Tích phân', icon: '∫',
    fields: [
      { key: 'lower', label: 'Cận dưới', placeholder: 'VD: 0' },
      { key: 'upper', label: 'Cận trên', placeholder: 'VD: 1' },
      { key: 'expr', label: 'Biểu thức', placeholder: 'VD: f(x)dx' },
    ],
    build: (v) => `$\\int_{${v.lower || '0'}}^{${v.upper || '1'}} ${v.expr || 'f(x)dx'}$`,
  },
  {
    label: 'Tổng Σ', icon: 'Σ',
    fields: [
      { key: 'var', label: 'Biến', placeholder: 'VD: i=1' },
      { key: 'upper', label: 'Đến', placeholder: 'VD: n' },
      { key: 'expr', label: 'Biểu thức', placeholder: 'VD: a_i' },
    ],
    build: (v) => `$\\sum_{${v.var || 'i=1'}}^{${v.upper || 'n'}} ${v.expr || 'a_i'}$`,
  },
  {
    label: 'Giới hạn', icon: 'lim',
    fields: [
      { key: 'var', label: 'Biến tiến tới', placeholder: 'VD: x → 0' },
      { key: 'expr', label: 'Biểu thức', placeholder: 'VD: f(x)' },
    ],
    build: (v) => `$\\lim_{${v.var || 'x \\to 0'}} ${v.expr || 'f(x)'}$`,
  },
  {
    label: 'Vector', icon: '→a',
    fields: [{ key: 'name', label: 'Tên vector', placeholder: 'VD: a' }],
    build: (v) => `$\\vec{${v.name || 'a'}}$`,
  },
  {
    label: 'Logarithm', icon: 'log',
    fields: [
      { key: 'base', label: 'Cơ số (trống = ln)', placeholder: 'VD: 2' },
      { key: 'expr', label: 'Biểu thức', placeholder: 'VD: x' },
    ],
    build: (v) => v.base ? `$\\log_{${v.base}} ${v.expr || 'x'}$` : `$\\ln ${v.expr || 'x'}$`,
  },
  {
    label: 'Trị tuyệt đối', icon: '|x|',
    fields: [{ key: 'expr', label: 'Biểu thức', placeholder: 'VD: x - 1' }],
    build: (v) => `$|${v.expr || 'x'}|$`,
  },
  {
    label: 'Phản ứng hóa học', icon: '→ HH',
    fields: [
      { key: 'left', label: 'Chất tham gia', placeholder: 'VD: 2H₂ + O₂' },
      { key: 'cond', label: 'Điều kiện (tùy chọn)', placeholder: 'VD: t°' },
      { key: 'right', label: 'Sản phẩm', placeholder: 'VD: 2H₂O' },
    ],
    build: (v) => v.cond
      ? `${v.left || ''} $\\xrightarrow{${v.cond}}$ ${v.right || ''}`
      : `${v.left || ''} → ${v.right || ''}`,
  },
];

// ===== Helpers: parse/build/extract cho contentEditable =====
function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFormulaChip(raw) {
  const isDisplay = raw.startsWith('$$');
  const latex = isDisplay ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim();
  try {
    return katex.renderToString(latex, { displayMode: isDisplay, throwOnError: false });
  } catch {
    return escapeHtml(raw);
  }
}

function buildEditorHTML(text) {
  if (!text) return '';
  const REGEX = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*)/g;
  const parts = text.split(REGEX);

  return parts.map((part) => {
    if ((part.startsWith('$$') && part.endsWith('$$')) ||
        (part.startsWith('$') && part.endsWith('$') && part.length > 2)) {
      const encoded = encodeURIComponent(part);
      const html = renderFormulaChip(part);
      return `<span class="formula-chip" contenteditable="false" data-formula="${encoded}" title="Click đúp để sửa">${html}</span>\u200B`;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
    }
    return escapeHtml(part).replace(/\n/g, '<br>');
  }).join('');
}

function extractValueFromDOM(editor) {
  let result = '';
  function walk(parent) {
    parent.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent.replace(/\u200B/g, '');
      } else if (node.dataset?.formula) {
        result += decodeURIComponent(node.dataset.formula);
      } else if (node.tagName === 'STRONG' || node.tagName === 'B') {
        result += '**';
        walk(node);
        result += '**';
      } else if (node.tagName === 'BR') {
        result += '\n';
      } else {
        walk(node);
      }
    });
  }
  walk(editor);
  return result;
}

function insertFormulaAtCursor(editor, formulaText) {
  editor.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) {
    range.selectNodeContents(editor);
    range.collapse(false);
  }

  const encoded = encodeURIComponent(formulaText);
  const span = document.createElement('span');
  span.className = 'formula-chip';
  span.contentEditable = 'false';
  span.dataset.formula = encoded;
  span.title = 'Click đúp để sửa';
  span.innerHTML = renderFormulaChip(formulaText);

  range.deleteContents();
  range.insertNode(span);

  const zwsp = document.createTextNode('\u200B');
  span.after(zwsp);

  const newRange = document.createRange();
  newRange.setStartAfter(zwsp);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// ===== Ô nhập trong popup có nút lồng =====
const FormulaFieldInput = ({ value, onChange, placeholder, onKeyDown }) => {
  const [showNested, setShowNested] = useState(false);
  const inputRef = useRef(null);

  const insertNested = (shortcut) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = value.slice(start, end);
    const result = shortcut.build(selected);
    onChange(value.slice(0, start) + result + value.slice(end));
    setShowNested(false);
    requestAnimationFrame(() => input.focus());
  };

  return (
    <div>
      <div className="flex gap-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          onClick={() => setShowNested(!showNested)}
          className={`px-2 py-1 text-xs border rounded-lg transition-colors ${
            showNested ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-purple-50'
          }`}
          title="Chèn công thức lồng"
        >fx</button>
      </div>
      {showNested && (
        <div className="flex gap-1 mt-1">
          {NESTED_SHORTCUTS.map((s, i) => (
            <button key={i} type="button" title={s.title} onClick={() => insertNested(s)}
              className="px-2 py-0.5 text-xs bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 text-purple-700 transition-colors"
            >{s.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Popup chèn công thức =====
const FormulaPopup = ({ formula, onInsert, onClose }) => {
  const [values, setValues] = useState({});
  const popupRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleInsert = () => { onInsert(formula.build(values)); onClose(); };

  return (
    <div ref={popupRef} className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-gray-800">{formula.label}</h4>
        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <FiX className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="space-y-3">
        {formula.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
            <FormulaFieldInput
              value={values[field.key] || ''}
              onChange={(val) => setValues((p) => ({ ...p, [field.key]: val }))}
              placeholder={field.placeholder}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-[10px] text-gray-400 mb-1">Xem trước:</div>
        <div className="text-base"><MathDisplay text={formula.build(values)} /></div>
      </div>
      <button type="button" onClick={handleInsert}
        className="mt-3 w-full py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
      >Chèn vào nội dung</button>
    </div>
  );
};

// ===== Popup sửa công thức đã chèn =====
const EditFormulaPopup = ({ raw, onSave, onDelete, onClose, anchorRect }) => {
  const [latex, setLatex] = useState(raw);
  const popupRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const style = anchorRect ? {
    position: 'fixed',
    top: anchorRect.bottom + 4,
    left: Math.min(anchorRect.left, window.innerWidth - 320),
    zIndex: 50,
  } : {};

  return (
    <div ref={popupRef} className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80" style={style}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm text-gray-800">Sửa công thức</h4>
        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <FiX className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <input
        type="text"
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono mb-2"
        onKeyDown={(e) => e.key === 'Enter' && onSave(latex)}
      />
      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 mb-3 text-base">
        <MathDisplay text={latex} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onDelete()}
          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >Xóa</button>
        <button type="button" onClick={() => onSave(latex)}
          className="flex-1 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >Lưu</button>
      </div>
    </div>
  );
};

// ===== Component chính: WYSIWYG Editor =====
const MathInput = ({ value, onChange, placeholder, rows = 3, className = '' }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeFormula, setActiveFormula] = useState(null);
  const [editingChip, setEditingChip] = useState(null); // { element, raw, rect }
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const lastValueRef = useRef(value);

  // Build editor HTML from value
  const syncEditorHTML = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = buildEditorHTML(value) || '';
    lastValueRef.current = value;
  }, [value]);

  // Init editor on mount
  useEffect(() => {
    syncEditorHTML();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when value changes externally
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (value !== lastValueRef.current) {
      syncEditorHTML();
    }
  }, [value, syncEditorHTML]);

  // Extract value from DOM on input
  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const newValue = extractValueFromDOM(editor);
    isInternalChange.current = true;
    lastValueRef.current = newValue;
    onChange(newValue);
  }, [onChange]);

  // Insert formula text at cursor
  const handleInsertFormula = useCallback((formulaText) => {
    const editor = editorRef.current;
    if (!editor) return;
    insertFormulaAtCursor(editor, formulaText);
    handleInput();
  }, [handleInput]);

  // Insert plain text at cursor
  const handleInsertText = useCallback((text) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('insertText', false, text);
    // handleInput called by browser's input event
  }, []);

  // Handle symbol button click
  const handleSimpleSymbol = (sym) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    if (sym.type === 'bold') {
      document.execCommand('bold', false, null);
      handleInput();
    } else {
      handleInsertText(sym.insert);
    }
  };

  // Double-click on formula chip to edit
  const handleEditorDblClick = (e) => {
    const chip = e.target.closest('.formula-chip');
    if (chip && chip.dataset.formula) {
      const raw = decodeURIComponent(chip.dataset.formula);
      const rect = chip.getBoundingClientRect();
      setEditingChip({ element: chip, raw, rect });
    }
  };

  // Save edited formula
  const handleSaveEditedFormula = (newRaw) => {
    if (!editingChip) return;
    const chip = editingChip.element;
    chip.dataset.formula = encodeURIComponent(newRaw);
    chip.innerHTML = renderFormulaChip(newRaw);
    chip.title = 'Click đúp để sửa';
    setEditingChip(null);
    handleInput();
  };

  // Delete formula chip
  const handleDeleteFormula = () => {
    if (!editingChip) return;
    editingChip.element.remove();
    setEditingChip(null);
    handleInput();
  };

  // Paste as plain text
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-visible ${className}`}>
      {/* Toolbar tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto rounded-t-lg">
        {SIMPLE_SYMBOLS.map((cat, i) => (
          <button
            key={i} type="button"
            onClick={() => { setActiveCategory(i); setActiveFormula(null); }}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === i && activeFormula === null
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >{cat.label}</button>
        ))}
        <button
          type="button"
          onClick={() => setActiveFormula(activeFormula === null ? -1 : null)}
          className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
            activeFormula !== null
              ? 'bg-white text-purple-700 border-b-2 border-purple-500'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >Công thức</button>
      </div>

      {/* Simple symbol buttons */}
      {activeFormula === null && (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 min-h-[36px]">
          {SIMPLE_SYMBOLS[activeCategory].symbols.map((sym, i) => (
            <button key={i} type="button" title={sym.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSimpleSymbol(sym)}
              className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >{sym.label}</button>
          ))}
        </div>
      )}

      {/* Formula buttons with popup */}
      {activeFormula !== null && (
        <div className="relative p-2 bg-purple-50 border-b border-gray-200 min-h-[36px]">
          <div className="flex flex-wrap gap-1">
            {FORMULA_TEMPLATES.map((formula, i) => (
              <button key={i} type="button" title={formula.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setActiveFormula(activeFormula === i ? -1 : i)}
                className={`px-2 py-0.5 text-xs border rounded transition-colors ${
                  activeFormula === i
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white border-gray-200 hover:bg-purple-100 hover:border-purple-300 hover:text-purple-700'
                }`}
              >{formula.icon} {formula.label}</button>
            ))}
          </div>
          {activeFormula >= 0 && activeFormula < FORMULA_TEMPLATES.length && (
            <FormulaPopup
              formula={FORMULA_TEMPLATES[activeFormula]}
              onInsert={handleInsertFormula}
              onClose={() => setActiveFormula(-1)}
            />
          )}
        </div>
      )}

      {/* WYSIWYG contentEditable editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onDoubleClick={handleEditorDblClick}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Nhập nội dung tại đây...'}
        className="wysiwyg-editor px-3 py-2 text-sm outline-none"
        style={{ minHeight: `${Math.max(rows * 1.5, 2.5)}rem` }}
      />

      {/* Edit formula popup */}
      {editingChip && (
        <EditFormulaPopup
          raw={editingChip.raw}
          anchorRect={editingChip.rect}
          onSave={handleSaveEditedFormula}
          onDelete={handleDeleteFormula}
          onClose={() => setEditingChip(null)}
        />
      )}
    </div>
  );
};

export default MathInput;
