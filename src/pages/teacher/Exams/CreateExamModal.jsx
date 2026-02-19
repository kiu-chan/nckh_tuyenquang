import { useState } from 'react';
import { FiXCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  IoCreateOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import AIExamCreator from '../../../components/AIExamCreator';
import MathInput from '../../../components/MathInput';
import { subjectOptions } from './constants';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const defaultConfig = {
  title: '',
  subject: '',
  subjectId: '',
  type: 'multiple-choice',
  difficulty: 'medium',
  duration: 90,
  totalQuestions: 30,
};

const emptyQuestion = (type = 'multiple-choice') => ({
  question: '',
  type,
  answers: type === 'multiple-choice' ? ['', '', '', ''] : [],
  correct: 0,
  points: 1,
});

/**
 * Chuyển đổi câu hỏi từ format AI sang format schema
 */
const transformAIQuestions = (data) => {
  const questions = [];
  const topicSet = new Set();

  // Xử lý câu trắc nghiệm
  const mcQuestions = data.multipleChoiceQuestions || [];
  mcQuestions.forEach((q) => {
    const answers = (q.options || []).map((opt) => opt.text || opt);
    const correctLetter = q.correctAnswer || 'A';
    const correctIndex = correctLetter.charCodeAt(0) - 65;

    questions.push({
      question: q.question,
      type: 'multiple-choice',
      answers,
      correct: correctIndex >= 0 && correctIndex < answers.length ? correctIndex : 0,
      points: q.points || 1,
    });

    if (q.topic) topicSet.add(q.topic);
  });

  // Xử lý câu tự luận
  const essayQuestions = data.essayQuestions || [];
  essayQuestions.forEach((q) => {
    questions.push({
      question: q.question,
      type: 'essay',
      answers: [],
      correct: undefined,
      points: q.points || 2,
    });

    if (q.topic) topicSet.add(q.topic);
  });

  return { questions, topics: [...topicSet] };
};

const CreateExamModal = ({ onClose, onCreated }) => {
  const [creationMethod, setCreationMethod] = useState('ai');
  const [examConfig, setExamConfig] = useState({ ...defaultConfig });
  const [manualQuestions, setManualQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfigChange = (field, value) => {
    setExamConfig((prev) => ({ ...prev, [field]: value }));
  };

  // --- Manual question editing ---
  const addQuestion = () => {
    setManualQuestions((prev) => [
      ...prev,
      emptyQuestion(examConfig.type === 'essay' ? 'essay' : 'multiple-choice'),
    ]);
  };

  const removeQuestion = (index) => {
    setManualQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setManualQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setManualQuestions((prev) => {
      const copy = [...prev];
      const answers = [...copy[qIndex].answers];
      answers[aIndex] = value;
      copy[qIndex] = { ...copy[qIndex], answers };
      return copy;
    });
  };

  // --- Save manual exam ---
  const handleCreateManual = async () => {
    if (!examConfig.title || !examConfig.subject) {
      setError('Vui lòng nhập tên đề thi và chọn môn học');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const cleanedQuestions = manualQuestions
        .filter((q) => q.question.trim())
        .map((q) => ({
          question: q.question.trim(),
          type: q.type,
          answers: q.answers || [],
          correct: q.correct,
          points: q.points || 1,
        }));

      const res = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: examConfig.title,
          subject: examConfig.subject,
          subjectId: examConfig.subjectId,
          type: examConfig.type,
          difficulty: examConfig.difficulty,
          duration: examConfig.duration,
          questions: cleanedQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Save AI-generated exam ---
  const handleQuestionsGenerated = async (data) => {
    const { questions, topics } = transformAIQuestions(data);

    if (questions.length === 0) {
      alert('Không có câu hỏi hợp lệ để lưu');
      return;
    }

    if (!examConfig.subject) {
      alert('Vui lòng chọn môn học trước khi lưu');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: examConfig.title || `Đề thi ${examConfig.subject} - ${new Date().toLocaleDateString('vi-VN')}`,
          subject: examConfig.subject,
          subjectId: examConfig.subjectId,
          type: examConfig.type,
          difficulty: examConfig.difficulty,
          duration: examConfig.duration,
          questions,
          topics,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      onCreated();
    } catch (err) {
      alert('Lỗi khi lưu đề thi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo đề thi mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiXCircle className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div className="space-y-6">
          {/* Choose Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn phương thức tạo đề
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCreationMethod('manual')}
                className={`p-6 border-2 rounded-xl transition-all text-left ${
                  creationMethod === 'manual'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                  <IoCreateOutline className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Tạo thủ công</h3>
                <p className="text-sm text-gray-500">Tự soạn từng câu hỏi theo ý muốn</p>
              </button>
              <button
                onClick={() => setCreationMethod('ai')}
                className={`p-6 border-2 rounded-xl transition-all text-left ${
                  creationMethod === 'ai'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <IoSparklesOutline className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Tạo bằng AI</h3>
                <p className="text-sm text-gray-500">AI tự động tạo câu hỏi từ tài liệu</p>
              </button>
            </div>
          </div>

          {/* ========== MANUAL MODE ========== */}
          {creationMethod === 'manual' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên đề thi</label>
                <input
                  type="text"
                  value={examConfig.title}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  placeholder="VD: Kiểm tra giữa kỳ I - Toán 10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                  <select
                    value={examConfig.subject}
                    onChange={(e) => {
                      const subject = e.target.value;
                      const subjectId = subjectOptions.find((s) => s.name === subject)?.id || '';
                      setExamConfig((prev) => ({ ...prev, subject, subjectId }));
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Chọn môn học</option>
                    {subjectOptions.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại đề</label>
                  <select
                    value={examConfig.type}
                    onChange={(e) => handleConfigChange('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="multiple-choice">Trắc nghiệm</option>
                    <option value="essay">Tự luận</option>
                    <option value="mixed">Trắc nghiệm + Tự luận</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={examConfig.duration}
                    onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || 0)}
                    placeholder="90"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <select
                    value={examConfig.difficulty}
                    onChange={(e) => handleConfigChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              {/* Manual Questions Editor */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Câu hỏi ({manualQuestions.length})
                  </h3>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Thêm câu hỏi
                  </button>
                </div>

                {manualQuestions.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">Chưa có câu hỏi nào</p>
                    <button
                      onClick={addQuestion}
                      className="mt-2 text-emerald-600 text-sm font-medium hover:underline"
                    >
                      + Thêm câu hỏi đầu tiên
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {manualQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-semibold">
                          {qIndex + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={q.type}
                            onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-lg"
                          >
                            <option value="multiple-choice">Trắc nghiệm</option>
                            <option value="essay">Tự luận</option>
                          </select>
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg text-center"
                            min="1"
                          />
                          <span className="text-xs text-gray-500">điểm</span>
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <MathInput
                        value={q.question}
                        onChange={(val) => handleQuestionChange(qIndex, 'question', val)}
                        placeholder="Nhập nội dung câu hỏi... (dùng $...$ cho công thức toán)"
                        rows={2}
                        className="mb-3"
                      />

                      {q.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          {(q.answers || ['', '', '', '']).map((answer, aIndex) => (
                            <div key={aIndex} className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuestionChange(qIndex, 'correct', aIndex)}
                                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  q.correct === aIndex
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {q.correct === aIndex && <IoCheckmarkCircleOutline className="w-4 h-4" />}
                              </button>
                              <span className="text-sm font-medium text-gray-500 w-5">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <MathInput
                                value={answer}
                                onChange={(val) => handleAnswerChange(qIndex, aIndex, val)}
                                placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}`}
                                rows={1}

                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateManual}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo đề thi'}
                </button>
              </div>
            </>
          ) : (
            /* ========== AI MODE ========== */
            <>
              <div className="space-y-4">
                {/* Tên đề thi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên đề thi</label>
                  <input
                    type="text"
                    value={examConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="VD: Kiểm tra giữa kỳ I - Toán 10 (để trống sẽ tự động đặt tên)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                    <select
                      value={examConfig.subject}
                      onChange={(e) => {
                        const subject = e.target.value;
                        const subjectId = subjectOptions.find((s) => s.name === subject)?.id || '';
                        setExamConfig((prev) => ({ ...prev, subject, subjectId }));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Chọn môn học</option>
                      {subjectOptions.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại đề</label>
                    <select
                      value={examConfig.type}
                      onChange={(e) => handleConfigChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="multiple-choice">Trắc nghiệm</option>
                      <option value="essay">Tự luận</option>
                      <option value="mixed">Trắc nghiệm + Tự luận</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian (phút)</label>
                    <input
                      type="number"
                      value={examConfig.duration}
                      onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || 0)}
                      placeholder="90"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                    <select
                      value={examConfig.difficulty}
                      onChange={(e) => handleConfigChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <AIExamCreator
                examType={examConfig.type}
                subject={examConfig.subject}
                difficulty={examConfig.difficulty}
                onQuestionsGenerated={handleQuestionsGenerated}
                onClose={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExamModal;
