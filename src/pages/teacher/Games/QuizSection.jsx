import {
  FiPlay,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { formatLastPlayed } from './utils';

const QuizSection = ({ quizzes, onPlay, onDelete, onOpenCreate, onEdit }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz - Trắc nghiệm nhanh</h2>
        <p className="text-gray-600">Tạo bộ câu hỏi trắc nghiệm để học sinh ôn tập</p>
      </div>
      <button
        onClick={onOpenCreate}
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
                  onClick={() => onPlay(quiz)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors col-span-1"
                >
                  <FiPlay className="w-4 h-4" />
                  <span>Chơi</span>
                </button>
                <button
                  onClick={() => onEdit(quiz)}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(quiz._id)}
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

export default QuizSection;
