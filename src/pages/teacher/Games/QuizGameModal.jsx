import { useState, useEffect, useCallback, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import {
  IoTrophyOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';

const QuizGameModal = ({ quiz, onClose, onRecordPlay }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions = quiz.questions || [];

  // Use refs to avoid stale closures in setTimeout/useEffect
  const currentQuestionRef = useRef(currentQuestion);
  const scoreRef = useRef(score);
  const isAnsweredRef = useRef(isAnswered);

  currentQuestionRef.current = currentQuestion;
  scoreRef.current = score;
  isAnsweredRef.current = isAnswered;

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionRef.current < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setShowResult(true);
      const finalScore = (scoreRef.current / questions.length) * 10;
      onRecordPlay(quiz._id, finalScore);
    }
  }, [questions.length, quiz._id, onRecordPlay]);

  useEffect(() => {
    if (showResult || isAnswered || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - move to next question
          setTimeout(() => handleNextQuestion(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showResult, isAnswered, handleNextQuestion]);

  const handleAnswer = useCallback((index) => {
    if (isAnsweredRef.current) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === questions[currentQuestionRef.current].correct) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => handleNextQuestion(), 1500);
  }, [questions, handleNextQuestion]);

  const handleReplay = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, []);

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
              onClick={handleReplay}
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

export default QuizGameModal;
