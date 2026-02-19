import { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import MathInput from '../../../components/MathInput';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

import { subjectOptions } from './constants';

const emptyQuestion = (type = 'multiple-choice') => ({
  question: '',
  type,
  answers: type === 'multiple-choice' ? ['', '', '', ''] : [],
  correct: 0,
  points: 1,
});

const ExamEditModal = ({ exam, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: exam.title,
    subject: exam.subject,
    subjectId: exam.subjectId || '',
    type: exam.type,
    difficulty: exam.difficulty,
    duration: exam.duration,
    questions: exam.questions?.length > 0 ? exam.questions.map((q) => ({ ...q })) : [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const answers = [...questions[qIndex].answers];
      answers[aIndex] = value;
      questions[qIndex] = { ...questions[qIndex], answers };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.type === 'essay' ? 'essay' : 'multiple-choice')],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.subject) {
      setError('Vui lòng nhập tên đề thi và chọn môn học');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const cleanedQuestions = form.questions.map((q) => ({
        question: q.question,
        type: q.type || 'multiple-choice',
        answers: q.answers || [],
        correct: q.correct,
        points: q.points || 1,
      }));
      const res = await fetch(`${API}/exams/${exam._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...form, questions: cleanedQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa đề thi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đề thi</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <select
                value={form.subject}
                onChange={(e) => {
                  const subject = e.target.value;
                  const subjectId = subjectOptions.find((s) => s.name === subject)?.id || '';
                  setForm((prev) => ({ ...prev, subject, subjectId }));
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
                value={form.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
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
                value={form.duration}
                onChange={(e) => handleFieldChange('duration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
              <select
                value={form.difficulty}
                onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Câu hỏi ({form.questions.length})
              </h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-4">
              {form.questions.map((q, qIndex) => (
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEditModal;
