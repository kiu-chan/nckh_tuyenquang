import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiLoader
} from 'react-icons/fi';
import {
  IoBookOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoCreateOutline,
  IoClipboardOutline
} from 'react-icons/io5';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const quickActions = [
  {
    title: 'Tóm tắt tài liệu',
    description: 'AI tóm tắt nội dung theo dạng danh sách, bảng',
    icon: IoDocumentTextOutline,
    color: 'from-blue-500 to-cyan-500',
    path: '/teacher/notebook'
  },
  {
    title: 'Tạo câu hỏi',
    description: 'Tạo câu hỏi theo mức độ nhận biết, thông hiểu',
    icon: IoClipboardOutline,
    color: 'from-emerald-500 to-teal-500',
    path: '/teacher/exams'
  },
  {
    title: 'Tạo đề thi',
    description: 'Tự động tạo đề thi với đáp án và ma trận',
    icon: IoCreateOutline,
    color: 'from-purple-500 to-pink-500',
    path: '/teacher/exams'
  },
  {
    title: 'Thiết kế trò chơi',
    description: 'Tạo quiz, trò chơi học tập thú vị',
    icon: IoGameControllerOutline,
    color: 'from-orange-500 to-red-500',
    path: '/teacher/games'
  },
  {
    title: 'Quản lý học sinh',
    description: 'Theo dõi và quản lý thông tin học sinh',
    icon: FiUsers,
    color: 'from-indigo-500 to-purple-500',
    path: '/teacher/students'
  },
  {
    title: 'Quản lý tài liệu',
    description: 'Tải lên và quản lý tài liệu giảng dạy',
    icon: IoBookOutline,
    color: 'from-pink-500 to-rose-500',
    path: '/teacher/documents'
  },
];

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashStats, setDashStats] = useState({
    students: 0,
    documents: 0,
    exams: 0,
    games: 0,
    notebooks: 0,
    pendingGrading: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || '');
      }
    } catch {}
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes, upcomingRes] = await Promise.all([
        fetch(`${API}/dashboard`, { headers: getAuthHeaders() }),
        fetch(`${API}/dashboard/recent-activities`, { headers: getAuthHeaders() }),
        fetch(`${API}/dashboard/upcoming`, { headers: getAuthHeaders() }),
      ]);

      const [statsData, activitiesData, upcomingData] = await Promise.all([
        statsRes.json(),
        activitiesRes.json(),
        upcomingRes.json(),
      ]);

      if (statsData.success) setDashStats(statsData.stats);
      if (activitiesData.success) setRecentActivities(activitiesData.activities);
      if (upcomingData.success) setUpcomingTasks(upcomingData.tasks);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    {
      label: 'Tổng học sinh',
      value: dashStats.students,
      icon: FiUsers,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Tài liệu',
      value: dashStats.documents,
      icon: IoDocumentTextOutline,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Đề thi',
      value: dashStats.exams,
      icon: IoCreateOutline,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Trò chơi',
      value: dashStats.games,
      icon: IoGameControllerOutline,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam': return { icon: IoCreateOutline, color: 'text-purple-500' };
      case 'document': return { icon: IoDocumentTextOutline, color: 'text-blue-500' };
      case 'game': return { icon: IoGameControllerOutline, color: 'text-orange-500' };
      case 'notebook': return { icon: IoBookOutline, color: 'text-emerald-500' };
      default: return { icon: FiFileText, color: 'text-gray-500' };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatDeadline = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const time = timeStr || '';
    if (date.getTime() === today.getTime()) return `Hôm nay${time ? ', ' + time : ''}`;
    if (date.getTime() === tomorrow.getTime()) return `Ngày mai${time ? ', ' + time : ''}`;

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `${days[date.getDay()]}${time ? ', ' + time : ''}`;
    return `${date.toLocaleDateString('vi-VN')}${time ? ', ' + time : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="ml-3 text-gray-600">Đang tải dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Xin chào{userName ? `, ${userName}` : ', Thầy/Cô'}! 👋
        </h1>
        <p className="text-emerald-100">Chúc bạn một ngày làm việc hiệu quả với NoteBookLM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activities & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ActivityIcon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(activity.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có hoạt động nào</p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch thi sắp tới</h2>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const isToday = new Date(task.deadline).toDateString() === new Date().toDateString();
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      isToday
                        ? 'bg-red-50 border-red-500'
                        : task.status === 'published'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-500">{formatDeadline(task.deadline, task.time)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        task.status === 'published'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Không có lịch thi sắp tới</p>
          )}
          <Link
            to="/teacher/exams"
            className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1"
          >
            Xem tất cả đề thi
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
