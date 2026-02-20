import { useState, useEffect } from 'react';
import {
  FiPlus, FiPlay, FiEdit2, FiTrash2, FiClock, FiAward, FiLayers, FiGrid, FiList
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';
import FlipCardGame from './FlipCardGame';
import MemoryGame from './MemoryGame';
import SequenceGame from './SequenceGame';
import CreateGameModal from './CreateGameModal';

const API = '/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
};

const StudentGames = () => {
  const [activeTab, setActiveTab] = useState('flip');
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalPlays: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API}/student-portal/games`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Lỗi tải trò chơi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/student-portal/games/${id}`, {
        method: 'DELETE', headers: getAuthHeaders(),
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchGames();
      }
    } catch (err) {
      console.error('Lỗi xóa:', err);
    }
  };

  const handlePlayResult = async (gameId, result) => {
    try {
      await fetch(`${API}/student-portal/games/${gameId}/play`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify(result),
      });
      fetchGames();
    } catch (err) {
      console.error('Lỗi lưu kết quả:', err);
    }
  };

  const filteredGames = games.filter((g) => g.type === activeTab);

  // Render playing game
  if (playingGame) {
    const gameProps = {
      game: playingGame,
      onBack: () => setPlayingGame(null),
      onFinish: (result) => {
        handlePlayResult(playingGame._id, result);
        setPlayingGame(null);
      },
    };
    if (playingGame.type === 'flip') return <FlipCardGame {...gameProps} />;
    if (playingGame.type === 'sequence') return <SequenceGame {...gameProps} />;
    return <MemoryGame {...gameProps} />;
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IoGameControllerOutline className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trò chơi</h1>
              <p className="text-purple-100">Học mà chơi, chơi mà học</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingGame(null); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Tạo bộ thẻ mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/15 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <FiLayers className="w-4 h-4" />
              Tổng bộ thẻ
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <FiPlay className="w-4 h-4" />
              Tổng lượt chơi
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalPlays}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-gray-200">
        {[
          { id: 'flip', label: 'Lật thẻ', icon: FiGrid },
          { id: 'memory', label: 'Thẻ nhớ', icon: FiLayers },
          { id: 'sequence', label: 'Thứ tự', icon: FiList },
        ].map((tab) => {
          const Icon = tab.icon;
          const count = games.filter((g) => g.type === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Games list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
          <IoGameControllerOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Chưa có bộ thẻ {activeTab === 'flip' ? 'lật thẻ' : activeTab === 'memory' ? 'thẻ nhớ' : 'thứ tự'} nào
          </h3>
          <p className="text-gray-500 mb-6">Tạo bộ thẻ đầu tiên để bắt đầu học!</p>
          <button
            onClick={() => { setEditingGame(null); setShowCreateModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Tạo bộ thẻ mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game._id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{game.title}</h3>
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full font-medium">
                  {game.cards?.length || 0} {game.type === 'sequence' ? 'bước' : 'thẻ'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FiPlay className="w-3.5 h-3.5" />
                  {game.plays} lượt
                </span>
                {game.bestTime && (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" />
                    {game.bestTime}s
                  </span>
                )}
                {game.bestScore !== null && game.bestScore !== undefined && (
                  <span className="flex items-center gap-1">
                    <FiAward className="w-3.5 h-3.5" />
                    {game.bestScore} điểm
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayingGame(game)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  <FiPlay className="w-4 h-4" />
                  Chơi
                </button>
                <button
                  onClick={() => { setEditingGame(game); setShowCreateModal(true); }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(game._id)}
                  className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Bạn có chắc chắn muốn xóa bộ thẻ này không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateGameModal
          game={editingGame}
          defaultType={activeTab}
          onClose={() => { setShowCreateModal(false); setEditingGame(null); }}
          onSaved={() => { setShowCreateModal(false); setEditingGame(null); fetchGames(); }}
        />
      )}
    </div>
  );
};

export default StudentGames;
