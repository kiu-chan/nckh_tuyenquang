import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiAlertTriangle,
} from 'react-icons/fi';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Render text có chứa LaTeX: $...$ (inline) và $$...$$ (block)
const renderMathText = (text) => {
  if (!text) return '';
  const parts = [];
  // Tách $$...$$ trước (block), sau đó $...$ (inline)
  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  const inlineRegex = /\$((?:[^$\\]|\\.)+?)\$/g;

  let lastIndex = 0;
  let match;

  // Xử lý block math $$...$$
  const segments = [];
  let cursor = 0;
  const str = text;

  // Tách toàn bộ chuỗi thành segments: text thường / block / inline
  let i = 0;
  while (i < str.length) {
    if (str[i] === '$' && str[i + 1] === '$') {
      // Block math
      const start = i + 2;
      const end = str.indexOf('$$', start);
      if (end !== -1) {
        if (start > cursor + 2) segments.push({ type: 'text', value: str.slice(cursor, i) });
        segments.push({ type: 'block', value: str.slice(start, end) });
        cursor = end + 2;
        i = cursor;
      } else {
        i++;
      }
    } else if (str[i] === '$') {
      // Inline math
      const start = i + 1;
      const end = str.indexOf('$', start);
      if (end !== -1) {
        if (i > cursor) segments.push({ type: 'text', value: str.slice(cursor, i) });
        segments.push({ type: 'inline', value: str.slice(start, end) });
        cursor = end + 1;
        i = cursor;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  if (cursor < str.length) segments.push({ type: 'text', value: str.slice(cursor) });

  return segments.map((seg, idx) => {
    if (seg.type === 'text') return <span key={idx}>{seg.value}</span>;
    try {
      const html = katex.renderToString(seg.value, {
        throwOnError: false,
        displayMode: seg.type === 'block',
      });
      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: html }}
          style={seg.type === 'block' ? { display: 'block', textAlign: 'center', margin: '8px 0' } : {}}
        />
      );
    } catch {
      return <span key={idx}>{seg.value}</span>;
    }
  });
};

// Component hiển thị text có math
const MathText = ({ text, className }) => (
  <span className={className}>{renderMathText(text)}</span>
);

// Modal xác nhận nộp bài
const SubmitConfirmModal = ({ unanswered, total, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiAlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Xác nhận nộp bài</h3>
          {unanswered > 0 && (
            <p className="text-sm text-amber-600 font-medium">
              Còn {unanswered}/{total} câu chưa trả lời
            </p>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        {unanswered > 0
          ? 'Bạn chưa trả lời hết tất cả câu hỏi. Sau khi nộp bài sẽ không thể sửa lại.'
          : 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể sửa lại.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          Nộp bài
        </button>
      </div>
    </div>
  </div>
);

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const startTimeRef = useRef(Date.now());

  // Fetch exam
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`${API}/student-portal/exams/${id}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setExam(data.exam);
          setSubmissionId(data.submission._id);

          // Tính thời gian còn lại dựa trên startedAt từ server (đúng kể cả tải lại)
          const startedAt = new Date(data.submission.startedAt).getTime();
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          const remaining = Math.max(0, data.exam.duration * 60 - elapsed);
          setTimeLeft(remaining);
          startTimeRef.current = startedAt;

          if (data.submission?.answers?.length > 0) {
            const savedAnswers = {};
            data.submission.answers.forEach((a) => {
              if (a.answer !== undefined) savedAnswers[a.questionIndex] = a.answer;
              if (a.essayAnswer) savedAnswers[`essay_${a.questionIndex}`] = a.essayAnswer;
            });
            setAnswers(savedAnswers);
          }
        } else {
          // Bài đã nộp hoặc hết hạn → chuyển hướng về lớp học
          const doneMessages = ['Bạn đã nộp bài thi này rồi', 'Đã hết hạn nộp bài'];
          if (doneMessages.includes(data.message)) {
            navigate('/student/classroom', { replace: true });
            return;
          }
          setError(data.message);
        }
      } catch {
        setError('Không thể tải đề thi');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // Auto-save đáp án sau 3 giây kể từ lần thay đổi cuối
  useEffect(() => {
    if (!exam || !submissionId || result || Object.keys(answers).length === 0) return;
    const timer = setTimeout(async () => {
      const formattedAnswers = exam.questions.map((q, index) => ({
        questionIndex: index,
        answer: answers[index] !== undefined ? answers[index] : undefined,
        essayAnswer: answers[`essay_${index}`] || undefined,
      }));
      try {
        await fetch(`${API}/student-portal/exams/${id}/save-progress`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ answers: formattedAnswers }),
        });
      } catch {
        // Không làm gián đoạn bài thi nếu lưu thất bại
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [answers, exam, submissionId, result, id]);

  // Timer countdown - auto submit khi hết giờ
  useEffect(() => {
    if (!exam || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, result]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleEssayAnswer = (questionIndex, text) => {
    setAnswers((prev) => ({ ...prev, [`essay_${questionIndex}`]: text }));
  };

  // Thực hiện nộp bài thật sự (không hỏi xác nhận)
  const doSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const formattedAnswers = exam.questions.map((q, index) => ({
        questionIndex: index,
        answer: answers[index] !== undefined ? answers[index] : undefined,
        essayAnswer: answers[`essay_${index}`] || undefined,
      }));

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

      const res = await fetch(`${API}/student-portal/exams/${id}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers: formattedAnswers, timeSpent }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert(data.message || 'Có lỗi xảy ra khi nộp bài');
      }
    } catch {
      alert('Lỗi kết nối khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, id, submitting, result]);

  // Mở modal xác nhận nộp bài (hoặc tự nộp nếu hết giờ)
  const handleSubmit = useCallback(() => {
    if (submitting || result) return;
    setShowConfirm(true);
  }, [submitting, result]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <FiXCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{error}</h3>
        <button
          onClick={() => navigate('/student/classroom')}
          className="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          Quay lại lớp học
        </button>
      </div>
    );
  }

  // Show results after submission
  if (result) {
    return (
      <div className="space-y-6">
        {/* Result Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-center mb-6">
            <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã nộp bài thành công!</h2>
            <p className="text-gray-500">{exam.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600">{result.score}</p>
              <p className="text-xs text-gray-600">Điểm</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{result.totalPoints}</p>
              <p className="text-xs text-gray-600">Tổng điểm</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{formatTime(result.timeSpent)}</p>
              <p className="text-xs text-gray-600">Thời gian</p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết kết quả</h3>
          <div className="space-y-4">
            {result.results.map((r, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  r.type === 'multiple-choice'
                    ? r.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 border">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-2">
                      <MathText text={r.question} />
                    </div>

                    {r.type === 'multiple-choice' && (
                      <div className="space-y-1">
                        {r.answers.map((ans, ai) => (
                          <div
                            key={ai}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                              ai === r.correct
                                ? 'bg-green-100 text-green-800 font-medium'
                                : ai === r.studentAnswer && ai !== r.correct
                                  ? 'bg-red-100 text-red-800'
                                  : 'text-gray-600'
                            }`}
                          >
                            {ai === r.correct && <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                            {ai === r.studentAnswer && ai !== r.correct && (
                              <FiXCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span>{String.fromCharCode(65 + ai)}. </span>
                            <MathText text={ans} />
                          </div>
                        ))}
                      </div>
                    )}

                    {r.type === 'essay' && r.studentEssay && (
                      <div className="mt-2 p-3 bg-white rounded-lg border text-sm text-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Câu trả lời của bạn:</p>
                        {r.studentEssay}
                      </div>
                    )}
                  </div>

                  {r.type === 'multiple-choice' && (
                    <span className={`text-sm font-medium flex-shrink-0 ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {r.isCorrect ? `+${r.points}` : '0'}/{r.points}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/student/classroom')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Quay lại lớp học
        </button>
      </div>
    );
  }

  // Exam taking view
  const question = exam.questions[currentQuestion];
  const answeredCount = exam.questions.filter(
    (q, i) => answers[i] !== undefined || answers[`essay_${i}`]
  ).length;
  const unansweredCount = exam.questions.length - answeredCount;

  return (
    <>
      {/* Modal xác nhận nộp bài */}
      {showConfirm && (
        <SubmitConfirmModal
          unanswered={unansweredCount}
          total={exam.questions.length}
          onConfirm={doSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">{exam.title}</h2>
              <p className="text-sm text-gray-500">{exam.subject}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <FiClock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold">
                {currentQuestion + 1}
              </span>
              <div>
                <span className="text-sm text-gray-500">
                  Câu {currentQuestion + 1}/{exam.questions.length}
                </span>
                <span className="text-sm text-gray-400 ml-2">({question.points} điểm)</span>
              </div>
            </div>

            <div className="text-lg text-gray-800 mb-6 leading-relaxed">
              <MathText text={question.question} />
            </div>

            {question.type === 'multiple-choice' ? (
              <div className="space-y-3">
                {question.answers.map((ans, ai) => (
                  <button
                    key={ai}
                    onClick={() => handleAnswer(currentQuestion, ai)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      answers[currentQuestion] === ai
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 ${
                        answers[currentQuestion] === ai
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + ai)}
                    </span>
                    <span className="flex-1">
                      <MathText text={ans} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[`essay_${currentQuestion}`] || ''}
                onChange={(e) => handleEssayAnswer(currentQuestion, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
              Câu trước
            </button>

            {currentQuestion < exam.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Câu tiếp
                <FiChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                <FiSend className="w-4 h-4" />
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="hidden lg:block w-64">
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-1">Danh sách câu hỏi</h3>
            <p className="text-sm text-gray-500 mb-4">
              Đã trả lời: <span className="font-medium text-gray-700">{answeredCount}/{exam.questions.length}</span>
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {exam.questions.map((q, i) => {
                const isAnswered = answers[i] !== undefined || answers[`essay_${i}`];
                const isCurrent = i === currentQuestion;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : isAnswered
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Chú thích */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100" />
                <span>Chưa trả lời</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
            >
              <FiSend className="w-4 h-4" />
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TakeExam;
