import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowLeft, FiClock, FiRotateCcw, FiAward, FiEye, FiCheck, FiX } from 'react-icons/fi';

const MemoryGame = ({ game, onBack, onFinish }) => {
  const [phase, setPhase] = useState('preview'); // preview | question | result | finished
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewTime, setPreviewTime] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledCards, setShuffledCards] = useState([]);
  const timerRef = useRef(null);
  const previewTimerRef = useRef(null);

  const PREVIEW_SECONDS = 5;

  const initGame = useCallback(() => {
    const shuffled = [...game.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setPhase('preview');
    setCurrentIndex(0);
    setPreviewTime(PREVIEW_SECONDS);
    setScore(0);
    setTotalTime(0);
    setAnswers([]);
    setSelectedAnswer(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (previewTimerRef.current) clearInterval(previewTimerRef.current);
  }, [game.cards]);

  useEffect(() => { initGame(); return () => { clearInterval(timerRef.current); clearInterval(previewTimerRef.current); }; }, [initGame]);

  // Preview countdown
  useEffect(() => {
    if (phase === 'preview') {
      setPreviewTime(PREVIEW_SECONDS);
      previewTimerRef.current = setInterval(() => {
        setPreviewTime((t) => {
          if (t <= 1) {
            clearInterval(previewTimerRef.current);
            setPhase('question');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(previewTimerRef.current);
    }
  }, [phase, currentIndex]);

  // Total time counter
  useEffect(() => {
    if (phase === 'question') {
      timerRef.current = setInterval(() => setTotalTime((t) => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  // Generate options when entering question phase
  useEffect(() => {
    if (phase === 'question' && shuffledCards.length > 0) {
      const currentCard = shuffledCards[currentIndex];
      const correctAnswer = currentCard.back;

      // Get wrong answers from other cards
      const wrongAnswers = shuffledCards
        .filter((_, i) => i !== currentIndex)
        .map((c) => c.back)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
      setSelectedAnswer(null);
    }
  }, [phase, currentIndex, shuffledCards]);

  const handleAnswer = (answer) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const currentCard = shuffledCards[currentIndex];
    const isCorrect = answer === currentCard.back;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { card: currentCard, answer, isCorrect }]);
    setPhase('result');
    clearInterval(timerRef.current);
  };

  const nextCard = () => {
    if (currentIndex + 1 >= shuffledCards.length) {
      setPhase('finished');
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase('preview');
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Finished screen
  if (phase === 'finished') {
    const finalScore = Math.round((score / shuffledCards.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAward className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Hoàn thành!</h2>
          <p className="text-gray-500 mb-6 text-center">{game.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600">Thời gian</p>
              <p className="text-xl font-bold text-purple-700">{formatTime(totalTime)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600">Đúng</p>
              <p className="text-xl font-bold text-blue-700">{score}/{shuffledCards.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600">Điểm</p>
              <p className="text-xl font-bold text-green-700">{finalScore}</p>
            </div>
          </div>

          {/* Review answers */}
          <div className="text-left mb-6 max-h-48 overflow-y-auto">
            {answers.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                a.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  a.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {a.isCorrect ? <FiCheck className="w-3.5 h-3.5 text-white" /> : <FiX className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.card.front}</p>
                  <p className={`text-xs ${a.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {a.isCorrect ? a.answer : `${a.answer} → ${a.card.back}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onFinish({ time: totalTime, score: finalScore })}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Thoát
            </button>
            <button
              onClick={initGame}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium transition-colors"
            >
              <FiRotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <FiArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <h2 className="text-lg font-bold text-gray-800">{game.title}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {formatTime(totalTime)}
          </span>
          <span>{currentIndex + 1}/{shuffledCards.length}</span>
          <span className="text-green-600 font-medium">{score} đúng</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / shuffledCards.length) * 100}%` }}
        />
      </div>

      {/* Preview phase */}
      {phase === 'preview' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
            <FiEye className="w-5 h-5" />
            <span className="font-medium">Ghi nhớ nội dung thẻ!</span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 mb-6 border-2 border-purple-200">
            <p className="text-sm text-purple-500 mb-2">Mặt trước</p>
            <p className="text-xl font-bold text-gray-800 mb-4">{currentCard.front}</p>
            <div className="border-t border-purple-200 my-4" />
            <p className="text-sm text-purple-500 mb-2">Mặt sau</p>
            <p className="text-xl font-bold text-gray-800">{currentCard.back}</p>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">{previewTime}</span>
            </div>
            <span className="text-gray-500 text-sm">giây để ghi nhớ</span>
          </div>
        </div>
      )}

      {/* Question phase */}
      {phase === 'question' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Mặt trước của thẻ là:</p>
          <p className="text-2xl font-bold text-gray-800 mb-8">{currentCard.front}</p>

          <p className="text-sm text-gray-500 mb-4">Chọn mặt sau đúng:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-800 font-medium hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          {selectedAnswer === currentCard.back ? (
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-600">Chính xác!</h3>
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-600">Sai rồi!</h3>
              <p className="text-gray-500 mt-2">
                Đáp án đúng: <span className="font-medium text-gray-800">{currentCard.back}</span>
              </p>
            </div>
          )}

          <button
            onClick={nextCard}
            className="px-8 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium transition-colors"
          >
            {currentIndex + 1 >= shuffledCards.length ? 'Xem kết quả' : 'Thẻ tiếp theo'}
          </button>
        </div>
      )}

      {/* Restart */}
      <div className="text-center">
        <button
          onClick={initGame}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          <FiRotateCcw className="w-4 h-4" />
          Chơi lại từ đầu
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
