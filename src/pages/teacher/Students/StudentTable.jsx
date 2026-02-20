import {
  FiTrash2,
  FiBookOpen,
} from 'react-icons/fi';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import { getScoreColor, getAttendanceColor } from './StudentCard';

const StudentTable = ({ students, onViewDetail, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học sinh</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lớp</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Điểm TB</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Đi học</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Bài tập</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => (
            <tr key={student._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(student.className) ? student.className : [student.className]).map((cn) => (
                    <span key={cn} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {cn}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-lg font-bold ${getScoreColor(student.score)}`}>
                    {student.score}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-center font-bold ${getAttendanceColor(student.attendance)}`}>
                  {student.attendance}%
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-center text-sm text-gray-600">
                  {student.assignmentsCompleted}/{student.assignmentsTotal}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  {student.status === 'active' ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                      <IoCheckmarkCircleOutline className="w-3 h-3" />
                      Đang học
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                      <IoCloseCircleOutline className="w-3 h-3" />
                      Nghỉ học
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewDetail(student)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <FiBookOpen className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(student._id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
