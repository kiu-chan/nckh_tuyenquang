import { useState, useEffect, useRef, useCallback } from 'react';
import { FiArrowLeft, FiClock, FiRotateCcw, FiAward, FiEye, FiCheck, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const SequenceGame = ({ game, onBack, onFinish }) => {
  const [phase, setPhase] = useState('preview'); // preview | play | finished
  const [correctOrder, setCorrectOrder] = useState([]);
  const [playerOrder, setPlayerOrder] = useState([]);
  const [previewTime, setPreviewTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const previewTimerRef = useRef(null);

  const PREVIEW_SECONDS = Math.max(5, game.cards.length * 2);

  const initGame = useCallback(() => {
    // Thứ tự đúng = thứ tự cards gốc (front là bước, index là vị trí)
    const order = game.cards.map((card, i) => ({ id: i, content: card.front, description: card.back }));
    setCorrectOrder(order);
    // Shuffle cho người chơi
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    setPlayerOrder(shuffled);
    setPhase('preview');
    setPreviewTime(PREVIEW_SECONDS);
    setTotalTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (previewTimerRef.current) clearInterval(previewTimerRef.current);
  }, [game.cards, PREVIEW_SECONDS]);

  useEffect(() => {
    initGame();
    return () => { clearInterval(timerRef.current); clearInterval(previewTimerRef.current); };
  }, [initGame]);

  // Preview countdown
  useEffect(() => {
    if (phase === 'preview') {
      setPreviewTime(PREVIEW_SECONDS);
      previewTimerRef.current = setInterval(() => {
        setPreviewTime((t) => {
          if (t <= 1) {
            clearInterval(previewTimerRef.current);
            setPhase('play');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(previewTimerRef.current);
    }
  }, [phase, PREVIEW_SECONDS]);

  // Play timer
  useEffect(() => {
    if (phase === 'play') {
      timerRef.current = setInterval(() => setTotalTime((t) => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= playerOrder.length) return;
    const updated = [...playerOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPlayerOrder(updated);
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setPhase('finished');
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate score
  const getResults = () => {
    let correct = 0;
    const details = playerOrder.map((item, i) => {
      const isCorrect = item.id === correctOrder[i].id;
      if (isCorrect) correct++;
      return { ...item, isCorrect, correctPosition: correctOrder.findIndex((c) => c.id === item.id) + 1 };
    });
    const score = Math.round((correct / correctOrder.length) * 100);
    return { correct, total: correctOrder.length, score, details };
  };

  // Finished screen
  if (phase === 'finished') {
    const { correct, total, score, details } = getResults();
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAward className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Hoàn thành!</h2>
          <p className="text-gray-500 mb-6 text-center">{game.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600">Thời gian</p>
              <p className="text-xl font-bold text-purple-700">{formatTime(totalTime)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600">Đúng vị trí</p>
              <p className="text-xl font-bold text-blue-700">{correct}/{total}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600">Điểm</p>
              <p className="text-xl font-bold text-green-700">{score}</p>
            </div>
          </div>

          {/* Review */}
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {details.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                item.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.content}</p>
                  {!item.isCorrect && (
                    <p className="text-xs text-red-500">Vị trí đúng: {item.correctPosition}</p>
                  )}
                </div>
                {item.isCorrect
                  ? <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  : <FiX className="w-5 h-5 text-red-600 flex-shrink-0" />
                }
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onFinish({ time: totalTime, score })}
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
            {formatTime(phase === 'preview' ? 0 : totalTime)}
          </span>
          <span>{correctOrder.length} bước</span>
        </div>
      </div>

      {/* Preview phase */}
      {phase === 'preview' && (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
            <FiEye className="w-5 h-5" />
            <span className="font-medium">Ghi nhớ thứ tự các bước!</span>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-3 max-w-2xl mx-auto">
              {correctOrder.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{item.content}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">{previewTime}</span>
            </div>
            <span className="text-gray-500 text-sm">giây để ghi nhớ</span>
          </div>
        </div>
      )}

      {/* Play phase */}
      {phase === 'play' && (
        <div className="flex-1 flex flex-col">
          <p className="text-center text-gray-500 mb-4">
            Sắp xếp lại các bước theo đúng thứ tự bằng nút mũi tên
          </p>

          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-2 max-w-2xl mx-auto">
              {playerOrder.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{item.content}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveItem(i, i - 1)}
                      disabled={i === 0}
                      className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-500 hover:text-purple-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <FiArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveItem(i, i + 1)}
                      disabled={i === playerOrder.length - 1}
                      className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-500 hover:text-purple-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <FiArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={initGame}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              <FiRotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-medium transition-colors"
            >
              <FiCheck className="w-4 h-4" />
              Nộp bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceGame;
