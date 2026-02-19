import { useState } from 'react';
import {
  FiPlay,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiLoader,
} from 'react-icons/fi';
import { IoSparklesOutline } from 'react-icons/io5';
import { formatLastPlayed, getAuthHeaders } from './utils';

const WheelSection = ({ wheels, onPlay, onDelete, onOpenCreate, onRefresh }) => {
  const [importingId, setImportingId] = useState(null);

  const handleImportStudents = async (wheelId) => {
    setImportingId(wheelId);
    try {
      const res = await fetch('/api/students/add-to-wheel', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ gameId: wheelId, mode: 'replace' }),
      });
      const data = await res.json();
      if (data.success) {
        if (onRefresh) onRefresh();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Lỗi kết nối server');
    }
    setImportingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Vòng quay may mắn</h2>
          <p className="text-gray-600">Tạo vòng quay để random câu hỏi hoặc phần thưởng</p>
        </div>
        <button
          onClick={onOpenCreate}
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

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => onPlay(wheel)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Quay</span>
                  </button>
                  <button
                    onClick={() => handleImportStudents(wheel._id)}
                    disabled={importingId === wheel._id}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    {importingId === wheel._id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiUsers className="w-4 h-4" />
                    )}
                    <span>Học sinh</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => onDelete(wheel._id)}
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
};

export default WheelSection;
