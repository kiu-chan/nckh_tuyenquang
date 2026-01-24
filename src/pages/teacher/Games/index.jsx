import React, { useState, useEffect } from 'react';
import { 
  FiPlay,
  FiSettings,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiRefreshCw,
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy
} from 'react-icons/fi';
import { 
  IoGameControllerOutline,
  IoTrophyOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoStarOutline
} from 'react-icons/io5';

const TeacherGames = () => {
  const [activeTab, setActiveTab] = useState('quiz'); // quiz, wheel, stats
  const [showGameModal, setShowGameModal] = useState(false);
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);

  // Quiz Component
  const QuizSection = () => {
    const [quizzes, setQuizzes] = useState([
      {
        id: 1,
        title: 'Ôn tập Hàm số bậc nhất',
        subject: 'Toán học',
        questions: 15,
        duration: 10,
        plays: 45,
        avgScore: 8.2,
        lastPlayed: '2 giờ trước',
        difficulty: 'medium'
      },
      {
        id: 2,
        title: 'Trắc nghiệm Đạo hàm',
        subject: 'Toán học',
        questions: 20,
        duration: 15,
        plays: 32,
        avgScore: 7.5,
        lastPlayed: '1 ngày trước',
        difficulty: 'hard'
      },
      {
        id: 3,
        title: 'Ôn tập Động lực học',
        subject: 'Vật lý',
        questions: 10,
        duration: 8,
        plays: 28,
        avgScore: 8.8,
        lastPlayed: '3 ngày trước',
        difficulty: 'easy'
      },
    ]);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz - Trắc nghiệm nhanh</h2>
            <p className="text-gray-600">Tạo bộ câu hỏi trắc nghiệm để học sinh ôn tập</p>
          </div>
          <button
            onClick={() => setShowGameModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo Quiz mới</span>
          </button>
        </div>

        {/* Quiz List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
              {/* Header */}
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

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{quiz.questions}</p>
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
                  Chơi lần cuối: {quiz.lastPlayed}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowQuizGame(quiz)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Chơi</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Wheel Component
  const WheelSection = () => {
    const [wheels, setWheels] = useState([
      {
        id: 1,
        title: 'Vòng quay kiến thức Toán',
        items: ['Hàm số', 'Phương trình', 'Bất phương trình', 'Đạo hàm', 'Tích phân', 'Hình học'],
        color: 'blue',
        plays: 67,
        lastPlayed: '1 giờ trước'
      },
      {
        id: 2,
        title: 'Vòng quay Vật lý',
        items: ['Động học', 'Động lực học', 'Nhiệt học', 'Quang học', 'Điện học', 'Hạt nhân'],
        color: 'green',
        plays: 43,
        lastPlayed: '5 giờ trước'
      },
      {
        id: 3,
        title: 'Vòng quay may mắn',
        items: ['1 điểm', '2 điểm', '3 điểm', '5 điểm', '10 điểm', 'Jackpot'],
        color: 'purple',
        plays: 89,
        lastPlayed: '30 phút trước'
      },
    ]);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Vòng quay may mắn</h2>
            <p className="text-gray-600">Tạo vòng quay để random câu hỏi hoặc phần thưởng</p>
          </div>
          <button
            onClick={() => setShowGameModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo vòng quay</span>
          </button>
        </div>

        {/* Wheel List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wheels.map((wheel) => (
            <div key={wheel.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${
                wheel.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                wheel.color === 'green' ? 'from-green-500 to-emerald-500' :
                'from-purple-500 to-pink-500'
              } p-6 text-white`}>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-3">
                  <IoSparklesOutline className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{wheel.title}</h3>
                <p className="text-sm opacity-90">{wheel.items.length} phần tử</p>
              </div>

              {/* Items Preview */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Các phần tử:</p>
                  <div className="flex flex-wrap gap-2">
                    {wheel.items.slice(0, 4).map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                    {wheel.items.length > 4 && (
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
                  Quay lần cuối: {wheel.lastPlayed}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowWheelGame(wheel)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Quay</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Quiz Game Modal
  const QuizGameModal = ({ quiz, onClose }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isAnswered, setIsAnswered] = useState(false);

    const questions = [
      {
        question: 'Hàm số y = 2x + 3 có hệ số góc là bao nhiêu?',
        answers: ['1', '2', '3', '-2'],
        correct: 1
      },
      {
        question: 'Đồ thị hàm số y = ax + b cắt trục tung tại điểm có tung độ bằng?',
        answers: ['a', 'b', 'a + b', '0'],
        correct: 1
      },
      {
        question: 'Hàm số y = -3x + 5 là hàm số?',
        answers: ['Đồng biến', 'Nghịch biến', 'Không đổi', 'Tăng rồi giảm'],
        correct: 1
      },
    ];

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

      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    };

    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(30);
      } else {
        setShowResult(true);
      }
    };

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
              <p className="text-5xl font-bold text-emerald-600 mb-2">
                {score}/{questions.length}
              </p>
              <p className="text-gray-600">Điểm số: {((score / questions.length) * 10).toFixed(1)}/10</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResult(false);
                  setTimeLeft(30);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                }}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold text-white transition-colors"
              >
                Chơi lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
              <p className="text-sm text-gray-500">Câu {currentQuestion + 1}/{questions.length}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-gray-800">{Math.round((currentQuestion / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <IoTimeOutline className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Thời gian còn lại:</span>
            </div>
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {questions[currentQuestion].question}
            </h4>

            {/* Answers */}
            <div className="space-y-3">
              {questions[currentQuestion].answers.map((answer, index) => {
                const isCorrect = index === questions[currentQuestion].correct;
                const isSelected = index === selectedAnswer;
                
                let buttonClass = "w-full p-4 rounded-xl border-2 text-left font-medium transition-all ";
                
                if (isAnswered) {
                  if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-700";
                  } else {
                    buttonClass += "border-gray-200 text-gray-500";
                  }
                } else {
                  buttonClass += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{answer}</span>
                      {isAnswered && isCorrect && (
                        <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 ml-auto" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <IoCloseCircleOutline className="w-6 h-6 text-red-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score */}
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
      }, 4000);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">{wheel.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Wheel */}
          <div className="relative mb-6">
            <div className="w-full max-w-md mx-auto aspect-square relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500"></div>
              </div>

              {/* Wheel Container */}
              <div 
                className="w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform duration-[4000ms] ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${wheel.items.map((_, i) => {
                    const start = (i * 360) / wheel.items.length;
                    const end = ((i + 1) * 360) / wheel.items.length;
                    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                  }).join(', ')})`
                }}
              >
                {/* Items */}
                {wheel.items.map((item, index) => {
                  const angle = (360 / wheel.items.length) * index;
                  const midAngle = angle + (180 / wheel.items.length);
                  
                  return (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 origin-left"
                      style={{
                        transform: `rotate(${midAngle}deg) translateX(40%)`,
                        width: '50%',
                      }}
                    >
                      <div className="text-white font-bold text-sm md:text-base text-center whitespace-nowrap">
                        {item}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                <IoSparklesOutline className="w-8 h-8 text-gray-700" />
              </div>
            </div>
          </div>

          {/* Result */}
          {showResult && (
            <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-2">Kết quả:</p>
              <p className="text-3xl font-bold text-emerald-600">{result}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              Đóng
            </button>
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
              <p className="text-2xl font-bold text-gray-800">6</p>
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
              <p className="text-2xl font-bold text-gray-800">247</p>
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
              <p className="text-2xl font-bold text-gray-800">8.1</p>
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
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-600">Top player</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-2 border border-gray-100 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'quiz'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Quiz
        </button>
        <button
          onClick={() => setActiveTab('wheel')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'wheel'
              ? 'bg-purple-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Vòng quay
        </button>
      </div>

      {/* Content */}
      {activeTab === 'quiz' && <QuizSection />}
      {activeTab === 'wheel' && <WheelSection />}

      {/* Game Modals */}
      {showQuizGame && (
        <QuizGameModal quiz={showQuizGame} onClose={() => setShowQuizGame(false)} />
      )}
      {showWheelGame && (
        <WheelGameModal wheel={showWheelGame} onClose={() => setShowWheelGame(false)} />
      )}
    </div>
  );
};

export default TeacherGames;