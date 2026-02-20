import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowLeft, FiClock, FiRotateCcw, FiAward } from 'react-icons/fi';

const FlipCardGame = ({ game, onBack, onFinish }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);
  const timerRef = useRef(null);

  const gridSize = game.gridSize || 4;
  const totalPairs = (gridSize * gridSize) / 2;

  const initGame = useCallback(() => {
    const gameCards = game.cards.slice(0, totalPairs);
    // Tạo cặp: mỗi card có 2 bản (front và back) để ghép cặp bằng front
    const pairs = [];
    gameCards.forEach((card, i) => {
      pairs.push({ id: i * 2, pairId: i, content: card.front, type: 'front' });
      pairs.push({ id: i * 2 + 1, pairId: i, content: card.back, type: 'back' });
    });

    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setIsStarted(false);
    setIsFinished(false);
    setLockBoard(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [game.cards, totalPairs]);

  useEffect(() => { initGame(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [initGame]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isStarted, isFinished]);

  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) {
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [matched, cards.length]);

  const handleCardClick = (index) => {
    if (lockBoard || flipped.includes(index) || matched.includes(index)) return;

    if (!isStarted) setIsStarted(true);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true);

      const [first, second] = newFlipped;
      const card1 = cards[first];
      const card2 = cards[second];

      if (card1.pairId === card2.pairId) {
        // Matched!
        setTimeout(() => {
          setMatched((prev) => [...prev, first, second]);
          setFlipped([]);
          setLockBoard(false);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Finished screen
  if (isFinished) {
    const score = Math.max(0, Math.round(100 - (moves - totalPairs) * 5 - time * 0.5));
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAward className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Hoàn thành!</h2>
          <p className="text-gray-500 mb-6 text-center">{game.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600">Thời gian</p>
              <p className="text-xl font-bold text-purple-700">{formatTime(time)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600">Lượt lật</p>
              <p className="text-xl font-bold text-blue-700">{moves}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600">Điểm</p>
              <p className="text-xl font-bold text-green-700">{Math.max(0, score)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { onFinish({ time, score: Math.max(0, score) }); }}
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

  return (
    <div className="space-y-4 flex-1 flex flex-col">
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
            {formatTime(time)}
          </span>
          <span>Lượt: {moves}</span>
          <span>Cặp: {matched.length / 2}/{totalPairs}</span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched.includes(index);
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="aspect-square cursor-pointer"
              style={{ perspective: '600px' }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Back (shown when not flipped) */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 transition-colors ${
                    isMatched
                      ? 'bg-green-100 border-green-300'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-400 hover:from-purple-600 hover:to-indigo-600'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {!isMatched && (
                    <span className="text-white text-3xl font-bold">?</span>
                  )}
                </div>
                {/* Front (shown when flipped) */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 p-2 ${
                    isMatched
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-purple-200'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className={`text-center text-sm font-medium break-words ${
                    isMatched ? 'text-green-700' : 'text-gray-800'
                  }`}>
                    {card.content}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

export default FlipCardGame;
