import { useState, useEffect } from 'react';
import {
  FiX,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
  FiSave,
} from 'react-icons/fi';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const GradeExamModal = ({ exam, onClose, onGraded }) => {
  const [submissions, setSubmissions] = useState([]);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detail grading view
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch submissions list
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${API}/exams/${exam._id}/submissions`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.submissions);
          setExamInfo(data.exam);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [exam._id]);

  // Fetch submission detail for grading
  const openSubmission = async (submissionId) => {
    try {
      const res = await fetch(`${API}/exams/${exam._id}/submissions/${submissionId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSubmission(data.submission);
        setQuestions(data.questions);

        // Pre-fill grades from existing
        const existingGrades = {};
        data.questions.forEach((q) => {
          if (q.type === 'essay' && q.essayScore !== undefined && q.essayScore !== null) {
            existingGrades[q.index] = {
              score: q.essayScore,
              feedback: q.essayFeedback || '',
            };
          }
        });
        setGrades(existingGrades);
      }
    } catch (err) {
      console.error('Error fetching submission detail:', err);
    }
  };

  const handleGradeChange = (questionIndex, field, value) => {
    setGrades((prev) => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        [field]: value,
      },
    }));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const gradeList = Object.entries(grades).map(([questionIndex, data]) => ({
        questionIndex: parseInt(questionIndex),
        score: parseFloat(data.score) || 0,
        feedback: data.feedback || '',
      }));

      const res = await fetch(
        `${API}/exams/${exam._id}/submissions/${selectedSubmission._id}/grade`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ grades: gradeList }),
        }
      );
      const data = await res.json();
      if (data.success) {
        // Refresh submissions list
        const listRes = await fetch(`${API}/exams/${exam._id}/submissions`, {
          headers: getAuthHeaders(),
        });
        const listData = await listRes.json();
        if (listData.success) setSubmissions(listData.submissions);

        setSelectedSubmission(null);
        setQuestions([]);
        setGrades({});
        onGraded?.();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Lỗi khi lưu điểm');
    } finally {
      setSaving(false);
    }
  };

  const essayQuestions = questions.filter((q) => q.type === 'essay');
  const allEssayGraded = essayQuestions.every(
    (q) => grades[q.index]?.score !== undefined && grades[q.index]?.score !== ''
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {selectedSubmission && (
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setQuestions([]);
                  setGrades({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedSubmission ? 'Chấm bài' : 'Danh sách bài nộp'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {examInfo?.title || exam.title}
                {selectedSubmission && ` — ${selectedSubmission.student?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedSubmission ? (
            // Grading Detail View
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Trắc nghiệm</p>
                  <p className="text-lg font-bold text-blue-700">{selectedSubmission.mcScore}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Tự luận</p>
                  <p className="text-lg font-bold text-purple-700">{selectedSubmission.essayScore}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Tổng</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {selectedSubmission.score}/{selectedSubmission.totalPoints}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Thời gian</p>
                  <p className="text-lg font-bold text-gray-700">
                    {Math.floor((selectedSubmission.timeSpent || 0) / 60)}p
                  </p>
                </div>
              </div>

              {/* Questions */}
              {questions.map((q) => (
                <div
                  key={q.index}
                  className={`p-4 rounded-xl border ${
                    q.type === 'multiple-choice'
                      ? q.isCorrect
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 border">
                      {q.index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-800">{q.question}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          q.type === 'multiple-choice' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {q.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                        <span className="text-xs text-gray-500">({q.points} điểm)</span>
                      </div>

                      {q.type === 'multiple-choice' && (
                        <div className="space-y-1">
                          {q.answers.map((ans, ai) => (
                            <div
                              key={ai}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                                ai === q.correct
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : ai === q.studentAnswer && ai !== q.correct
                                    ? 'bg-red-100 text-red-800'
                                    : 'text-gray-600'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + ai)}. {ans}</span>
                              {ai === q.correct && <FiCheckCircle className="w-3 h-3 text-green-600" />}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'essay' && (
                        <div className="space-y-3 mt-2">
                          <div className="p-3 bg-white rounded-lg border text-sm text-gray-700">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Câu trả lời:</p>
                            <p className="whitespace-pre-wrap">{q.studentEssay || '(Không trả lời)'}</p>
                          </div>
                          {/* Grading inputs */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Điểm:</label>
                              <input
                                type="number"
                                min="0"
                                max={q.points}
                                step="0.5"
                                value={grades[q.index]?.score ?? ''}
                                onChange={(e) => handleGradeChange(q.index, 'score', e.target.value)}
                                className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                placeholder={`/${q.points}`}
                              />
                              <span className="text-sm text-gray-500">/ {q.points}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Nhận xét:</label>
                            <textarea
                              value={grades[q.index]?.feedback || ''}
                              onChange={(e) => handleGradeChange(q.index, 'feedback', e.target.value)}
                              rows={2}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                              placeholder="Nhận xét cho câu trả lời..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Submissions List View
            <div>
              {submissions.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Chưa có bài nộp nào</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const hasUngradedEssay =
                      sub.totalEssayQuestions > 0 && sub.gradedEssayQuestions < sub.totalEssayQuestions;

                    return (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {sub.student?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{sub.student?.name}</p>
                            <p className="text-xs text-gray-500">
                              {sub.student?.className} — {sub.student?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Scores */}
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">
                              {sub.score}/{sub.totalPoints}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-blue-600">TN: {sub.mcScore}</span>
                              {sub.totalEssayQuestions > 0 && (
                                <span className="text-purple-600">TL: {sub.essayScore}</span>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              sub.status === 'graded'
                                ? 'bg-green-100 text-green-700'
                                : sub.status === 'submitted'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sub.status === 'graded'
                              ? 'Đã chấm'
                              : sub.status === 'submitted'
                                ? `Cần chấm ${sub.totalEssayQuestions - sub.gradedEssayQuestions} câu TL`
                                : 'Đang làm'}
                          </span>

                          {/* Grade button */}
                          {(sub.status === 'submitted' || sub.status === 'graded') && sub.totalEssayQuestions > 0 && (
                            <button
                              onClick={() => openSubmission(sub._id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                hasUngradedEssay
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {hasUngradedEssay ? 'Chấm bài' : 'Xem lại'}
                            </button>
                          )}

                          {/* View for MC-only */}
                          {(sub.status === 'submitted' || sub.status === 'graded') && sub.totalEssayQuestions === 0 && (
                            <button
                              onClick={() => openSubmission(sub._id)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              Xem chi tiết
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - only in grading view */}
        {selectedSubmission && essayQuestions.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Đã chấm {Object.keys(grades).filter((k) => grades[k]?.score !== undefined && grades[k]?.score !== '').length}/{essayQuestions.length} câu tự luận
            </p>
            <button
              onClick={handleSaveGrades}
              disabled={!allEssayGraded || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeExamModal;
