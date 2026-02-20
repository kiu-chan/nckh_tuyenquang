import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiUsers, FiLoader, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_URL, getAuthHeaders } from './utils';
import MathDisplay from '../../../components/MathDisplay';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const CreateGameModal = ({ type, onClose, onCreated, editGame = null }) => {
  const isEdit = !!editGame;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [quizForm, setQuizForm] = useState(() => {
    if (editGame && type === 'quiz') {
      return {
        title: editGame.title || '',
        subject: editGame.subject || '',
        duration: editGame.duration || 10,
        difficulty: editGame.difficulty || 'medium',
        questions: editGame.questions?.length > 0
          ? editGame.questions.map((q) => ({
              question: q.question || '',
              answers: Array.isArray(q.answers) && q.answers.length === 4
                ? q.answers.map((a) => String(a))
                : ['', '', '', ''],
              correct: typeof q.correct === 'number' ? q.correct : 0,
            }))
          : [{ question: '', answers: ['', '', '', ''], correct: 0 }],
      };
    }
    return {
      title: '',
      subject: '',
      duration: 10,
      difficulty: 'medium',
      questions: [{ question: '', answers: ['', '', '', ''], correct: 0 }],
    };
  });

  const [wheelForm, setWheelForm] = useState(() => {
    if (editGame && type === 'wheel') {
      return {
        title: editGame.title || '',
        color: editGame.color || 'blue',
        items: editGame.items?.length > 0 ? [...editGame.items] : ['', ''],
      };
    }
    return {
      title: '',
      color: 'blue',
      items: ['', ''],
    };
  });

  // AI generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: '', answers: ['', '', '', ''], correct: 0 }],
    }));
  };

  const removeQuestion = (index) => {
    if (quizForm.questions.length <= 1) return;
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q)),
    }));
  };

  const updateAnswer = (qIndex, aIndex, value) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, answers: q.answers.map((a, j) => (j === aIndex ? value : a)) } : q
      ),
    }));
  };

  const addWheelItem = () => {
    setWheelForm((prev) => ({ ...prev, items: [...prev.items, ''] }));
  };

  const removeWheelItem = (index) => {
    if (wheelForm.items.length <= 2) return;
    setWheelForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // Import students
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (type !== 'wheel') return;
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/students/stats', { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) setClasses(data.stats.classes || []);
      } catch {
        // ignore
      }
    };
    fetchClasses();
  }, [type]);

  const importStudents = async () => {
    setLoadingStudents(true);
    try {
      const url = selectedClass
        ? `/api/students/names?className=${encodeURIComponent(selectedClass)}`
        : '/api/students/names';
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.students.length > 0) {
        const names = data.students.map((s) => s.name);
        const existing = new Set(wheelForm.items.filter((i) => i.trim()));
        const newNames = names.filter((n) => !existing.has(n));
        setWheelForm((prev) => ({
          ...prev,
          items: [...prev.items.filter((i) => i.trim()), ...newNames].length >= 2
            ? [...prev.items.filter((i) => i.trim()), ...newNames]
            : [...prev.items.filter((i) => i.trim()), ...newNames, ''],
        }));
      } else {
        setError('Không tìm thấy học sinh nào');
      }
    } catch {
      setError('Lỗi khi tải danh sách học sinh');
    }
    setLoadingStudents(false);
  };

  // Sanitize JSON text từ AI - loại bỏ ký tự điều khiển trong string literals
  const sanitizeJSONText = (text) => {
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    cleaned = cleaned.replace(/"((?:[^"\\]|\\.)*)"/g, (_match, content) => {
      const sanitized = content
        .replace(/[\x00-\x1F]/g, (ch) => {
          switch (ch) {
            case '\n': return '\\n';
            case '\r': return '\\r';
            case '\t': return '\\t';
            default: return '';
          }
        });
      return `"${sanitized}"`;
    });
    return cleaned;
  };

  // AI generate quiz questions
  const generateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setError('');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const difficultyText = aiDifficulty === 'easy' ? 'dễ' : aiDifficulty === 'medium' ? 'trung bình' : 'khó';
      const prompt = `Tạo ${aiCount} câu hỏi trắc nghiệm về chủ đề "${aiTopic}" cho học sinh, độ khó ${difficultyText}.
Mỗi câu hỏi có 4 đáp án (A, B, C, D), chỉ 1 đáp án đúng.

QUAN TRỌNG - CÔNG THỨC TOÁN/HÓA/LÝ: Sử dụng cú pháp LaTeX với ký hiệu $ để bao quanh công thức.
- Công thức inline: $công_thức$ (VD: $x^{2}+1$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\alpha$)
- Công thức block (căn giữa): $$công_thức$$ (VD: $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$)
- VD câu hỏi: "Tìm nghiệm của phương trình $x^{2} - 5x + 6 = 0$"
- VD đáp án: "$x = 2$ hoặc $x = 3$"
- Hóa học: "$H_2SO_4$", "$Fe + 2HCl \\rightarrow FeCl_2 + H_2\\uparrow$"
- Vật lý: "$F = ma$", "$E = mc^{2}$", "$v = \\frac{s}{t}$"
- Lưu ý: trong JSON, ký tự \\ phải được escape thành \\\\ (VD: "\\\\frac", "\\\\sqrt")

ĐỊNH DẠNG TRẢ VỀ (JSON):
Trả về một mảng JSON với định dạng sau (KHÔNG có markdown, KHÔNG có \`\`\`json):
[{"question":"Câu hỏi?","answers":["Đáp án A","Đáp án B","Đáp án C","Đáp án D"],"correct":0}]
Trong đó "correct" là index (0-3) của đáp án đúng.

CHÚ Ý: Chỉ trả về JSON thuần túy, không thêm bất kỳ text nào khác.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const generated = JSON.parse(sanitizeJSONText(text));

      if (Array.isArray(generated) && generated.length > 0) {
        const validQuestions = generated.map((q) => ({
          question: q.question || '',
          answers: Array.isArray(q.answers) && q.answers.length === 4
            ? q.answers.map((a) => String(a))
            : ['', '', '', ''],
          correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 ? q.correct : 0,
        }));
        setQuizForm((prev) => ({
          ...prev,
          questions: validQuestions,
          difficulty: aiDifficulty,
        }));
        if (!quizForm.title.trim()) {
          setQuizForm((prev) => ({ ...prev, title: aiTopic }));
        }
        if (!quizForm.subject.trim()) {
          setQuizForm((prev) => ({ ...prev, subject: aiTopic }));
        }
        setShowPreview(true);
      }
    } catch (err) {
      setError('Không thể tạo câu hỏi bằng AI. Vui lòng thử lại.');
      console.error('AI generate error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const body = type === 'quiz'
        ? { type: 'quiz', ...quizForm }
        : { type: 'wheel', ...wheelForm, items: wheelForm.items.filter((i) => i.trim()) };

      if (type === 'quiz') {
        const emptyQ = quizForm.questions.find((q) => !q.question.trim() || q.answers.some((a) => !a.trim()));
        if (emptyQ) {
          setError('Vui lòng điền đầy đủ câu hỏi và đáp án');
          setSubmitting(false);
          return;
        }
      } else {
        const validItems = wheelForm.items.filter((i) => i.trim());
        if (validItems.length < 2) {
          setError('Vòng quay cần ít nhất 2 phần tử');
          setSubmitting(false);
          return;
        }
      }

      const url = isEdit ? `${API_URL}/${editGame._id}` : API_URL;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra');
        setSubmitting(false);
        return;
      }

      onCreated();
    } catch {
      setError('Lỗi kết nối server');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit
              ? (type === 'quiz' ? 'Sửa Quiz' : 'Sửa Vòng quay')
              : (type === 'quiz' ? 'Tạo Quiz mới' : 'Tạo Vòng quay mới')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'quiz' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Ôn tập Hàm số"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                  <input
                    type="text"
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Toán học"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian (phút)</label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.duration}
                    onChange={(e) => setQuizForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              {/* AI Generate */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
                  <FiZap className="w-4 h-4" />
                  Tạo câu hỏi bằng AI
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Nhập chủ đề, VD: Phương trình bậc 2"
                    className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-16 px-3 py-2 border border-blue-200 rounded-lg text-sm text-center outline-none"
                    title="Số câu hỏi"
                  />
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="px-3 py-2 border border-blue-200 rounded-lg text-sm outline-none bg-white"
                    title="Độ khó"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">TB</option>
                    <option value="hard">Khó</option>
                  </select>
                  <button
                    type="button"
                    onClick={generateWithAI}
                    disabled={aiLoading || !aiTopic.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                  >
                    {aiLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
                    Tạo
                  </button>
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Câu hỏi ({quizForm.questions.length})</h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                        showPreview ? 'text-blue-600 hover:text-blue-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                    </button>
                    <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <FiPlus className="w-4 h-4" /> Thêm câu hỏi
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {quizForm.questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Câu {qIndex + 1}</span>
                        {quizForm.questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-600">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {showPreview ? (
                        /* Preview mode - render LaTeX */
                        <div>
                          <p className="font-medium text-gray-800 mb-3">
                            <MathDisplay text={q.question} />
                          </p>
                          <div className="space-y-2">
                            {q.answers.map((a, aIndex) => {
                              const isCorrect = aIndex === q.correct;
                              return (
                                <div
                                  key={aIndex}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                    isCorrect ? 'bg-green-50 border border-green-300' : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + aIndex)}
                                  </span>
                                  <MathDisplay text={a} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Edit mode - input fields */
                        <>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {q.answers.map((a, aIndex) => (
                              <div key={aIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={q.correct === aIndex}
                                  onChange={() => updateQuestion(qIndex, 'correct', aIndex)}
                                  className="text-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={a}
                                  onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                                  placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}`}
                                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                    q.correct === aIndex ? 'border-green-400 bg-green-50' : 'border-gray-200'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">Chọn radio để đánh dấu đáp án đúng</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={wheelForm.title}
                  onChange={(e) => setWheelForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Vòng quay kiến thức"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
                <div className="flex gap-3">
                  {[
                    { value: 'blue', bg: 'bg-blue-500' },
                    { value: 'green', bg: 'bg-green-500' },
                    { value: 'purple', bg: 'bg-purple-500' },
                    { value: 'red', bg: 'bg-red-500' },
                    { value: 'orange', bg: 'bg-orange-500' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setWheelForm((p) => ({ ...p, color: c.value }))}
                      className={`w-10 h-10 rounded-full ${c.bg} transition-all ${
                        wheelForm.color === c.value ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Import students */}
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <FiUsers className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-800">Thêm học sinh từ danh sách</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Tất cả lớp</option>
                    {classes.map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.count} HS)</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={importStudents}
                    disabled={loadingStudents}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    {loadingStudents ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiUsers className="w-4 h-4" />}
                    <span>Thêm</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Các phần tử ({wheelForm.items.filter((i) => i.trim()).length})</label>
                  <button type="button" onClick={addWheelItem} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
                    <FiPlus className="w-4 h-4" /> Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {wheelForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">{index + 1}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => setWheelForm((p) => ({ ...p, items: p.items.map((v, i) => (i === index ? e.target.value : v)) }))}
                        placeholder={`Phần tử ${index + 1}`}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {wheelForm.items.length > 2 && (
                        <button type="button" onClick={() => removeWheelItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                type === 'quiz'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {submitting
                ? (isEdit ? 'Đang lưu...' : 'Đang tạo...')
                : isEdit
                  ? 'Lưu thay đổi'
                  : (type === 'quiz' ? 'Tạo Quiz' : 'Tạo Vòng quay')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;
