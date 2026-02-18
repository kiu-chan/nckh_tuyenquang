import { useState, useEffect, useCallback } from 'react';
import {
  FiPlay,
  FiUsers,
  FiRefreshCw,
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLoader,
} from 'react-icons/fi';
import {
  IoGameControllerOutline,
  IoTrophyOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoStarOutline,
} from 'react-icons/io5';

const API_URL = '/api/games';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const TeacherGames = () => {
  const [activeTab, setActiveTab] = useState('quiz');
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [wheels, setWheels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('quiz');
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Quiz form
  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: '',
    duration: 10,
    difficulty: 'medium',
    questions: [{ question: '', answers: ['', '', '', ''], correct: 0 }],
  });

  // Wheel form
  const [wheelForm, setWheelForm] = useState({
    title: '',
    color: 'blue',
    items: ['', ''],
  });

  const fetchGames = useCallback(async () => {
    try {
      const [quizRes, wheelRes] = await Promise.all([
        fetch(`${API_URL}?type=quiz`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}?type=wheel`, { headers: getAuthHeaders() }),
      ]);
      const quizData = await quizRes.json();
      const wheelData = await wheelRes.json();
      if (quizData.success) setQuizzes(quizData.games);
      if (wheelData.success) setWheels(wheelData.games);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchGames(), fetchStats()]);
      setLoading(false);
    };
    load();
  }, [fetchGames, fetchStats]);

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa trò chơi này?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        await Promise.all([fetchGames(), fetchStats()]);
      }
    } catch (err) {
      console.error('Error deleting game:', err);
    }
  };

  const handleRecordPlay = async (id, score) => {
    try {
      await fetch(`${API_URL}/${id}/play`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ score }),
      });
      await Promise.all([fetchGames(), fetchStats()]);
    } catch (err) {
      console.error('Error recording play:', err);
    }
  };

  // Create handlers
  const openCreateModal = (type) => {
    setCreateType(type);
    setCreateError('');
    if (type === 'quiz') {
      setQuizForm({ title: '', subject: '', duration: 10, difficulty: 'medium', questions: [{ question: '', answers: ['', '', '', ''], correct: 0 }] });
    } else {
      setWheelForm({ title: '', color: 'blue', items: ['', ''] });
    }
    setShowCreateModal(true);
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError('');

    try {
      const body = createType === 'quiz'
        ? { type: 'quiz', ...quizForm }
        : { type: 'wheel', ...wheelForm, items: wheelForm.items.filter((i) => i.trim()) };

      // Validation
      if (createType === 'quiz') {
        const emptyQ = quizForm.questions.find((q) => !q.question.trim() || q.answers.some((a) => !a.trim()));
        if (emptyQ) {
          setCreateError('Vui lòng điền đầy đủ câu hỏi và đáp án');
          setSubmitting(false);
          return;
        }
      } else {
        const validItems = wheelForm.items.filter((i) => i.trim());
        if (validItems.length < 2) {
          setCreateError('Vòng quay cần ít nhất 2 phần tử');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.message || 'Có lỗi xảy ra');
        setSubmitting(false);
        return;
      }

      setShowCreateModal(false);
      await Promise.all([fetchGames(), fetchStats()]);
    } catch {
      setCreateError('Lỗi kết nối server');
    }
    setSubmitting(false);
  };

  // Quiz form helpers
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

  // Wheel form helpers
  const addWheelItem = () => {
    setWheelForm((prev) => ({ ...prev, items: [...prev.items, ''] }));
  };

  const removeWheelItem = (index) => {
    if (wheelForm.items.length <= 2) return;
    setWheelForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const formatLastPlayed = (date) => {
    if (!date) return 'Chưa chơi';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  // Quiz Section
  const QuizSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz - Trắc nghiệm nhanh</h2>
          <p className="text-gray-600">Tạo bộ câu hỏi trắc nghiệm để học sinh ôn tập</p>
        </div>
        <button
          onClick={() => openCreateModal('quiz')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Tạo Quiz mới</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <IoGameControllerOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có quiz nào. Hãy tạo quiz đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <IoGameControllerOutline className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.difficulty === 'easy' ? 'bg-green-400' :
                    quiz.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}>
                    {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'TB' : 'Khó'}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{quiz.title}</h3>
                <p className="text-sm text-blue-100">{quiz.subject}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{quiz.questions?.length || 0}</p>
                    <p className="text-xs text-gray-500">Câu hỏi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{quiz.duration}</p>
                    <p className="text-xs text-gray-500">Phút</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{quiz.plays}</p>
                    <p className="text-xs text-gray-500">Lượt chơi</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <span className="text-sm text-gray-600">Điểm TB:</span>
                  <span className="text-lg font-bold text-emerald-600">{quiz.avgScore}/10</span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Chơi lần cuối: {formatLastPlayed(quiz.lastPlayed)}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowQuizGame(quiz)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors col-span-1"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Chơi</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDeleteGame(quiz._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Wheel Section
  const WheelSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Vòng quay may mắn</h2>
          <p className="text-gray-600">Tạo vòng quay để random câu hỏi hoặc phần thưởng</p>
        </div>
        <button
          onClick={() => openCreateModal('wheel')}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Tạo vòng quay</span>
        </button>
      </div>

      {wheels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <IoSparklesOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có vòng quay nào. Hãy tạo vòng quay đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wheels.map((wheel) => (
            <div key={wheel._id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
              <div className={`bg-gradient-to-r ${
                wheel.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                wheel.color === 'green' ? 'from-green-500 to-emerald-500' :
                wheel.color === 'red' ? 'from-red-500 to-rose-500' :
                wheel.color === 'orange' ? 'from-orange-500 to-amber-500' :
                'from-purple-500 to-pink-500'
              } p-6 text-white`}>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-3">
                  <IoSparklesOutline className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{wheel.title}</h3>
                <p className="text-sm opacity-90">{wheel.items?.length || 0} phần tử</p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Các phần tử:</p>
                  <div className="flex flex-wrap gap-2">
                    {(wheel.items || []).slice(0, 4).map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                    {(wheel.items || []).length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{wheel.items.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <span className="text-sm text-gray-600">Lượt quay:</span>
                  <span className="text-lg font-bold text-purple-600">{wheel.plays}</span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Quay lần cuối: {formatLastPlayed(wheel.lastPlayed)}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowWheelGame(wheel)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Quay</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDeleteGame(wheel._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Quiz Game Modal
  const QuizGameModal = ({ quiz, onClose }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAnswered, setIsAnswered] = useState(false);

    const questions = quiz.questions || [];

    useEffect(() => {
      if (!showResult && timeLeft > 0 && !isAnswered) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      }
      if (timeLeft === 0 && !isAnswered) {
        handleNextQuestion();
      }
    }, [timeLeft, showResult, isAnswered]);

    const handleAnswer = (index) => {
      if (isAnswered) return;
      setSelectedAnswer(index);
      setIsAnswered(true);
      if (index === questions[currentQuestion].correct) {
        setScore(score + 1);
      }
      setTimeout(() => handleNextQuestion(), 1500);
    };

    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(30);
      } else {
        setShowResult(true);
        const finalScore = (score / questions.length) * 10;
        handleRecordPlay(quiz._id, finalScore);
      }
    };

    if (questions.length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <p className="text-gray-600 mb-4">Quiz này chưa có câu hỏi nào.</p>
            <button onClick={onClose} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700">Đóng</button>
          </div>
        </div>
      );
    }

    if (showResult) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoTrophyOutline className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
            <p className="text-gray-600 mb-6">Bạn đã trả lời đúng</p>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold text-emerald-600 mb-2">{score}/{questions.length}</p>
              <p className="text-gray-600">Điểm số: {((score / questions.length) * 10).toFixed(1)}/10</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">Đóng</button>
              <button
                onClick={() => { setCurrentQuestion(0); setScore(0); setShowResult(false); setTimeLeft(30); setSelectedAnswer(null); setIsAnswered(false); }}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold text-white transition-colors"
              >Chơi lại</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
              <p className="text-sm text-gray-500">Câu {currentQuestion + 1}/{questions.length}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-gray-800">{Math.round((currentQuestion / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <IoTimeOutline className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Thời gian còn lại:</span>
            </div>
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-800'}`}>{timeLeft}s</span>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{questions[currentQuestion].question}</h4>
            <div className="space-y-3">
              {questions[currentQuestion].answers.map((answer, index) => {
                const isCorrect = index === questions[currentQuestion].correct;
                const isSelected = index === selectedAnswer;
                let btnClass = 'w-full p-4 rounded-xl border-2 text-left font-medium transition-all ';
                if (isAnswered) {
                  if (isCorrect) btnClass += 'border-green-500 bg-green-50 text-green-700';
                  else if (isSelected) btnClass += 'border-red-500 bg-red-50 text-red-700';
                  else btnClass += 'border-gray-200 text-gray-500';
                } else {
                  btnClass += 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700';
                }
                return (
                  <button key={index} onClick={() => handleAnswer(index)} disabled={isAnswered} className={btnClass}>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{answer}</span>
                      {isAnswered && isCorrect && <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 ml-auto" />}
                      {isAnswered && isSelected && !isCorrect && <IoCloseCircleOutline className="w-6 h-6 text-red-600 ml-auto" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Điểm hiện tại:</span>
            <span className="text-2xl font-bold text-emerald-600">{score}/{currentQuestion + (isAnswered ? 1 : 0)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Wheel Game Modal
  const WheelGameModal = ({ wheel, onClose }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const spinWheel = () => {
      if (isSpinning) return;
      setIsSpinning(true);
      setShowResult(false);

      const spins = 5;
      const randomAngle = Math.floor(Math.random() * 360);
      const totalRotation = 360 * spins + randomAngle;
      setRotation(rotation + totalRotation);

      setTimeout(() => {
        const segmentAngle = 360 / wheel.items.length;
        const normalizedAngle = (360 - (randomAngle % 360)) % 360;
        const winningIndex = Math.floor(normalizedAngle / segmentAngle);
        setResult(wheel.items[winningIndex]);
        setShowResult(true);
        setIsSpinning(false);
        handleRecordPlay(wheel._id);
      }, 4000);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">{wheel.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="relative mb-6">
            <div className="w-full max-w-md mx-auto aspect-square relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500"></div>
              </div>
              <div
                className="w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform duration-[4000ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${wheel.items.map((_, i) => {
                    const start = (i * 360) / wheel.items.length;
                    const end = ((i + 1) * 360) / wheel.items.length;
                    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                  }).join(', ')})`,
                }}
              >
                {wheel.items.map((item, index) => {
                  const midAngle = (360 / wheel.items.length) * index + 180 / wheel.items.length;
                  return (
                    <div key={index} className="absolute top-1/2 left-1/2 origin-left" style={{ transform: `rotate(${midAngle}deg) translateX(40%)`, width: '50%' }}>
                      <div className="text-white font-bold text-sm md:text-base text-center whitespace-nowrap">{item}</div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                <IoSparklesOutline className="w-8 h-8 text-gray-700" />
              </div>
            </div>
          </div>

          {showResult && (
            <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-2">Kết quả:</p>
              <p className="text-3xl font-bold text-emerald-600">{result}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">Đóng</button>
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all"
            >
              <FiRefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay...' : 'Quay ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Trò chơi học tập</h1>
        <p className="text-gray-600">Tạo các trò chơi tương tác để học sinh ôn tập kiến thức</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <IoGameControllerOutline className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalGames ?? 0}</p>
              <p className="text-sm text-gray-600">Trò chơi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalPlays ?? 0}</p>
              <p className="text-sm text-gray-600">Lượt chơi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <IoStarOutline className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.avgScore ?? 0}</p>
              <p className="text-sm text-gray-600">Điểm TB</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <IoTrophyOutline className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
              <p className="text-sm text-gray-600">Quiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-2 border border-gray-100 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'quiz' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >Quiz</button>
        <button
          onClick={() => setActiveTab('wheel')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'wheel' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >Vòng quay</button>
      </div>

      {/* Content */}
      {activeTab === 'quiz' && <QuizSection />}
      {activeTab === 'wheel' && <WheelSection />}

      {/* Game Modals */}
      {showQuizGame && <QuizGameModal quiz={showQuizGame} onClose={() => setShowQuizGame(false)} />}
      {showWheelGame && <WheelGameModal wheel={showWheelGame} onClose={() => setShowWheelGame(false)} />}

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {createType === 'quiz' ? 'Tạo Quiz mới' : 'Tạo Vòng quay mới'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{createError}</div>
            )}

            <form onSubmit={handleCreateGame} className="space-y-5">
              {createType === 'quiz' ? (
                <>
                  {/* Quiz form */}
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

                  {/* Questions */}
                  <div className="border-t pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Câu hỏi ({quizForm.questions.length})</h3>
                      <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        <FiPlus className="w-4 h-4" /> Thêm câu hỏi
                      </button>
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
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Wheel form */}
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

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Các phần tử ({wheelForm.items.length})</label>
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
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                    createType === 'quiz'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {submitting ? 'Đang tạo...' : createType === 'quiz' ? 'Tạo Quiz' : 'Tạo Vòng quay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGames;
