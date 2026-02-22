import {
  FiMail,
  FiPhone,
  FiMessageSquare,
} from 'react-icons/fi';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';

const getScoreColor = (score) => {
  if (score >= 9) return 'text-emerald-600 bg-emerald-50';
  if (score >= 7) return 'text-blue-600 bg-blue-50';
  if (score >= 5) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

const getAttendanceColor = (attendance) => {
  if (attendance >= 95) return 'text-emerald-600';
  if (attendance >= 85) return 'text-blue-600';
  if (attendance >= 75) return 'text-orange-600';
  return 'text-red-600';
};

const StudentCard = ({ student, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      onClick={() => onClick(student)}
    >
      <div className="relative h-24 bg-gradient-to-br from-emerald-400 to-teal-500">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {student.name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          {student.status === 'active' ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
              <IoCheckmarkCircleOutline className="w-3 h-3" />
              <span>Đang học</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              <IoCloseCircleOutline className="w-3 h-3" />
              <span>Nghỉ học</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 p-4">
        <h3 className="font-bold text-gray-800 text-center mb-1 truncate">{student.name}</h3>
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {(Array.isArray(student.className) ? student.className : [student.className]).map((cn) => (
            <span key={cn} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              {cn}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(student.score)} rounded-lg py-1`}>
              {student.score}
            </div>
            <p className="text-xs text-gray-500 mt-1">Điểm TB</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAttendanceColor(student.attendance)}`}>
              {student.attendance}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Đi học</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Hoàn thành bài tập</span>
            <span className="font-medium">
              {student.assignmentsCompleted}/{student.assignmentsTotal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
              style={{
                width: `${student.assignmentsTotal > 0 ? (student.assignmentsCompleted / student.assignmentsTotal) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiMail className="w-3 h-3" />
            <span className="truncate">{student.email}</span>
          </div>
          {student.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FiPhone className="w-3 h-3" />
              <span>{student.phone}</span>
            </div>
          )}
          {student.notes && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-1">
              <FiMessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{student.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { getScoreColor, getAttendanceColor };
export default StudentCard;
