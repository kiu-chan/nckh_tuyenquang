import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiAward,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  IoSparkles,
  IoSchoolOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' phút trước';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + ' giờ trước';
  return Math.floor(hours / 24) + ' ngày trước';
};

const getDifficultyLabel = (d) => ({ easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }[d] || '');
const getDifficultyColor = (d) => ({
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}[d] || 'bg-gray-100 text-gray-700');

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(API + '/student-portal/dashboard', { headers: getAuthHeaders() });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Lỗi tải dữ liệu');
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Đang tải...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-red-500">
        <FiAlertCircle size={32} />
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  const { student, stats, upcomingExams, recentSubmissions } = data;

  const statCards = [
    { label: 'Đề thi được giao', value: stats.totalExams, icon: FiFileText, bg: 'bg-blue-50', tc: 'text-blue-600' },
    { label: 'Chưa làm', value: stats.pendingExams, icon: FiClock, bg: 'bg-orange-50', tc: 'text-orange-600' },
    { label: 'Đã hoàn thành', value: stats.completedExams, icon: FiCheckCircle, bg: 'bg-green-50', tc: 'text-green-600' },
    { label: 'Điểm trung bình', value: stats.avgScore !== null ? stats.avgScore + '/10' : '—', icon: FiAward, bg: 'bg-purple-50', tc: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <IoSparkles className="w-6 h-6 text-yellow-300" />
          <h1 className="text-2xl font-bold">Xin chào, {student.name}!</h1>
        </div>
        {data.newAccount ? (
          <p className="mt-2 text-blue-100 text-sm">
            Tài khoản của bạn đã sẵn sàng. Hãy chờ giáo viên thêm bạn vào lớp học để bắt đầu.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {(Array.isArray(student.className) ? student.className : [student.className]).map((cn) => (
                <span key={cn} className="px-2.5 py-0.5 bg-white/20 text-white text-sm font-medium rounded-lg">
                  {cn}
                </span>
              ))}
              {student.teacher && (
                <span className="text-blue-100 text-sm">
                  &middot; GV: <span className="font-semibold text-white">{student.teacher}</span>
                </span>
              )}
            </div>
            {stats.pendingExams > 0 && (
              <p className="mt-3 text-blue-100 text-sm">
                Bạn còn <span className="text-white font-bold">{stats.pendingExams} đề thi</span> chưa làm.
              </p>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center mb-3'}>
                <Icon className={'w-5 h-5 ' + s.tc} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Đề thi chưa làm</h2>
            <Link to="/student/classroom" className="text-xs text-blue-600 font-medium">Xem tất cả</Link>
          </div>
          {upcomingExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <IoCheckmarkCircleOutline size={32} className="mb-2 text-green-400" />
              <p className="text-sm">Bạn đã hoàn thành tất cả!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam._id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IoSchoolOutline className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{exam.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">{exam.subject}</span>
                      {exam.difficulty && (
                        <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + getDifficultyColor(exam.difficulty)}>
                          {getDifficultyLabel(exam.difficulty)}
                        </span>
                      )}
                      {exam.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <IoTimeOutline size={11} />{exam.duration} phút
                        </span>
                      )}
                    </div>
                    {exam.deadline && (
                      <p className="text-xs text-red-500 mt-1">
                        <IoCalendarOutline size={11} className="inline mr-1" />
                        Hạn: {formatDate(exam.deadline)}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/student/classroom"
                    className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"
                  >
                    Làm bài
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Bài đã nộp gần đây</h2>
          {recentSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <FiFileText size={28} className="mb-2" />
              <p className="text-sm">Chưa có bài nộp nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((s) => {
                const pct = s.totalPoints > 0 ? Math.round((s.score / s.totalPoints) * 10 * 10) / 10 : null;
                const isGraded = s.status === 'graded';
                return (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {isGraded
                        ? <FiCheckCircle className="w-5 h-5 text-green-500" />
                        : <FiClock className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.examTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s.subject && <span>{s.subject} · </span>}
                        {timeAgo(s.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isGraded && pct !== null ? (
                        <span className={'text-sm font-bold ' + (pct >= 8 ? 'text-green-600' : pct >= 5 ? 'text-yellow-600' : 'text-red-500')}>
                          {pct}/10
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          Chờ chấm
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/student/classroom" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100">
            <IoSchoolOutline className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Lớp học</p>
            <p className="text-xs text-gray-500">Xem đề thi, nộp bài</p>
          </div>
        </Link>
        <Link to="/student/chat" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100">
            <IoSparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Hỏi AI</p>
            <p className="text-xs text-gray-500">Trợ lý học tập</p>
          </div>
        </Link>
        <Link to="/student/classroom" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all group col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100">
            <FiFileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Làm bài thi</p>
            <p className="text-xs text-gray-500">Bài thi đang chờ</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
