import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiLoader } from 'react-icons/fi';
import {
  IoGameControllerOutline,
  IoTrophyOutline,
  IoStarOutline,
} from 'react-icons/io5';
import { API_URL, getAuthHeaders } from './utils';
import QuizSection from './QuizSection';
import WheelSection from './WheelSection';
import QuizGameModal from './QuizGameModal';
import WheelGameModal from './WheelGameModal';
import CreateGameModal from './CreateGameModal';

const TeacherGames = () => {
  const [activeTab, setActiveTab] = useState('quiz');
  const [showQuizGame, setShowQuizGame] = useState(false);
  const [showWheelGame, setShowWheelGame] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [wheels, setWheels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('quiz');
  const [editGame, setEditGame] = useState(null);

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

  const handleRecordPlay = useCallback(async (id, score) => {
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
  }, [fetchGames, fetchStats]);

  const openCreateModal = (type) => {
    setCreateType(type);
    setEditGame(null);
    setShowCreateModal(true);
  };

  const openEditModal = (game) => {
    setCreateType(game.type);
    setEditGame(game);
    setShowCreateModal(true);
  };

  const handleCreated = async () => {
    setShowCreateModal(false);
    setEditGame(null);
    await Promise.all([fetchGames(), fetchStats()]);
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
      {activeTab === 'quiz' && (
        <QuizSection
          quizzes={quizzes}
          onPlay={setShowQuizGame}
          onDelete={handleDeleteGame}
          onOpenCreate={() => openCreateModal('quiz')}
          onEdit={openEditModal}
        />
      )}
      {activeTab === 'wheel' && (
        <WheelSection
          wheels={wheels}
          onPlay={setShowWheelGame}
          onDelete={handleDeleteGame}
          onOpenCreate={() => openCreateModal('wheel')}
          onRefresh={() => Promise.all([fetchGames(), fetchStats()])}
          onEdit={openEditModal}
        />
      )}

      {/* Game Modals */}
      {showQuizGame && (
        <QuizGameModal
          quiz={showQuizGame}
          onClose={() => setShowQuizGame(false)}
          onRecordPlay={handleRecordPlay}
        />
      )}
      {showWheelGame && (
        <WheelGameModal
          wheel={showWheelGame}
          onClose={() => setShowWheelGame(false)}
          onRecordPlay={handleRecordPlay}
        />
      )}

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          key={editGame?._id || 'create'}
          type={createType}
          onClose={() => { setShowCreateModal(false); setEditGame(null); }}
          onCreated={handleCreated}
          editGame={editGame}
        />
      )}
    </div>
  );
};

export default TeacherGames;
