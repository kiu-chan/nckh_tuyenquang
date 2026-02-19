import { useState, useRef } from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import { IoSparklesOutline, IoTrophyOutline } from 'react-icons/io5';

const WHEEL_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

const WheelGameModal = ({ wheel, onClose, onRecordPlay }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

  const wheelRef = useRef(null);
  const currentRotationRef = useRef(0);

  const items = wheel.items || [];
  const segmentAngle = 360 / items.length;

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setShowResult(false);

    // Pick a random winning index directly
    const winningIndex = Math.floor(Math.random() * items.length);

    // Calculate the angle needed so that the winning segment lands at the pointer (top/12 o'clock)
    // conic-gradient: segment i occupies [i*segmentAngle, (i+1)*segmentAngle], starting from 12 o'clock clockwise
    // Pointer is at top. After rotating wheel by R degrees clockwise, the original angle at the top is (360 - R%360) % 360
    // We want (360 - finalRotation%360) % 360 to land in the middle of segment winningIndex
    // targetOriginalAngle = winningIndex * segmentAngle + segmentAngle / 2
    // (360 - finalRotation%360) % 360 = targetOriginalAngle
    // finalRotation%360 = (360 - targetOriginalAngle) % 360
    const targetOriginalAngle = winningIndex * segmentAngle + segmentAngle / 2;
    const targetMod = (360 - targetOriginalAngle + 360) % 360;

    // Add full spins (5-8 random) for visual effect
    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    // Calculate how much to add from current position to reach targetMod
    const currentMod = currentRotationRef.current % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;

    const totalAdd = extraSpins + delta;
    const newRotation = currentRotationRef.current + totalAdd;
    currentRotationRef.current = newRotation;

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
    }

    setTimeout(() => {
      setResult(items[winningIndex]);
      setShowResult(true);
      setIsSpinning(false);
      setSpinCount((prev) => prev + 1);
      onRecordPlay(wheel._id);
    }, 4600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <IoSparklesOutline className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{wheel.title}</h3>
                <p className="text-sm text-white/70">Lượt quay: {spinCount}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <FiX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Wheel */}
          <div className="relative mb-8">
            <div className="w-72 h-72 sm:w-80 sm:h-80 mx-auto relative">
              {/* Pointer */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
                <svg width="32" height="40" viewBox="0 0 32 40">
                  <polygon points="16,40 0,0 32,0" fill="#DC2626" />
                  <polygon points="16,36 4,4 28,4" fill="#EF4444" />
                </svg>
              </div>

              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 p-2 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                {/* Decorative dots on ring */}
                <div className="absolute inset-0">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 360) / 24;
                    const rad = (angle * Math.PI) / 180;
                    const r = 49;
                    const x = 50 + r * Math.sin(rad);
                    const y = 50 - r * Math.cos(rad);
                    return (
                      <div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${
                          isSpinning
                            ? i % 2 === 0 ? 'bg-yellow-300' : 'bg-white/40'
                            : 'bg-yellow-400/80'
                        } transition-colors`}
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          animation: isSpinning ? `pulse 0.5s ease-in-out ${i * 0.05}s infinite alternate` : undefined,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Wheel surface */}
                <div
                  ref={wheelRef}
                  className="w-full h-full rounded-full overflow-hidden"
                  style={{
                    transform: `rotate(${currentRotationRef.current}deg)`,
                  }}
                >
                  {/* Segments via SVG for cleaner look */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {items.map((item, index) => {
                      const startAngle = index * segmentAngle - 90;
                      const endAngle = (index + 1) * segmentAngle - 90;
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      const r = 100;
                      const cx = 100;
                      const cy = 100;
                      const x1 = cx + r * Math.cos(startRad);
                      const y1 = cy + r * Math.sin(startRad);
                      const x2 = cx + r * Math.cos(endRad);
                      const y2 = cy + r * Math.sin(endRad);
                      const largeArc = segmentAngle > 180 ? 1 : 0;

                      const midAngleRad = ((startAngle + endAngle) / 2) * Math.PI / 180;
                      const textR = r * 0.65;
                      const textX = cx + textR * Math.cos(midAngleRad);
                      const textY = cy + textR * Math.sin(midAngleRad);
                      const textRotation = (startAngle + endAngle) / 2;

                      return (
                        <g key={index}>
                          <path
                            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={WHEEL_COLORS[index % WHEEL_COLORS.length]}
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="0.5"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize={items.length > 8 ? '7' : items.length > 5 ? '8' : '10'}
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          >
                            {item.length > 12 ? item.slice(0, 11) + '…' : item}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Center button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-10 flex items-center justify-center transition-all shadow-lg ${
                  isSpinning
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 hover:scale-110 cursor-pointer active:scale-95'
                }`}
              >
                <FiRefreshCw className={`w-6 h-6 text-gray-700 ${isSpinning ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Result */}
          {showResult && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-purple-100 rounded-2xl text-center animate-[fadeIn_0.5s_ease-out]">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoTrophyOutline className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Kết quả</p>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {result}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all shadow-lg shadow-purple-500/25"
            >
              <FiRefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Đang quay...' : 'Quay ngay!'}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WheelGameModal;
