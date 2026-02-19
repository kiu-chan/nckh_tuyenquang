import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
} from 'react-icons/fi';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

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
          setTimeLeft(data.exam.duration * 60); // convert to seconds
          startTimeRef.current = Date.now();

          // Restore saved answers if any
          if (data.submission?.answers) {
            const savedAnswers = {};
            data.submission.answers.forEach((a) => {
              if (a.answer !== undefined) savedAnswers[a.questionIndex] = a.answer;
              if (a.essayAnswer) savedAnswers[`essay_${a.questionIndex}`] = a.essayAnswer;
            });
            setAnswers(savedAnswers);
          }
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Không thể tải đề thi');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!exam || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
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

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;

    const confirmed = timeLeft > 0 ? window.confirm('Bạn có chắc chắn muốn nộp bài?') : true;
    if (!confirmed) return;

    setSubmitting(true);
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
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [exam, answers, id, submitting, result, timeLeft]);

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
                    <p className="font-medium text-gray-800 mb-2">{r.question}</p>

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
                            {ai === r.correct && <FiCheckCircle className="w-4 h-4 text-green-600" />}
                            {ai === r.studentAnswer && ai !== r.correct && (
                              <FiXCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>{String.fromCharCode(65 + ai)}. {ans}</span>
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
                    <span className={`text-sm font-medium ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
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

  return (
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

          <p className="text-lg text-gray-800 mb-6 leading-relaxed">{question.question}</p>

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
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 ${
                      answers[currentQuestion] === ai
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {String.fromCharCode(65 + ai)}
                  </span>
                  <span className="flex-1">{ans}</span>
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
          <h3 className="font-bold text-gray-800 mb-3">Danh sách câu hỏi</h3>
          <p className="text-sm text-gray-500 mb-4">
            Đã trả lời: {answeredCount}/{exam.questions.length}
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
  );
};

export default TakeExam;
