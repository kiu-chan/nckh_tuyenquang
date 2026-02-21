import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBook,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  IoSchoolOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
} from 'react-icons/io5';
import { MdOutlineQuiz } from 'react-icons/md';

const getToken = () => localStorage.getItem('authToken');

const formatRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
};

const TYPE_ICON_COLOR = {
  exam: 'from-purple-500 to-indigo-600',
  document: 'from-orange-500 to-amber-600',
  game: 'from-emerald-500 to-teal-600',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tải dữ liệu');
      setStats(data.stats);
      setActivities(data.activities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const systemAlerts = stats ? [
    stats.pendingSubmissions > 0 && {
      id: 1,
      type: 'warning',
      title: 'Bài chờ chấm điểm',
      message: `${stats.pendingSubmissions} bài nộp chưa được chấm`,
      icon: FiAlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600',
    },
    {
      id: 2,
      type: 'info',
      title: 'Tổng tài nguyên',
      message: `${stats.totalExams} đề thi · ${stats.totalDocuments} tài liệu · ${stats.totalGames} trò chơi`,
      icon: FiActivity,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
    },
    {
      id: 3,
      type: 'success',
      title: 'Hệ thống hoạt động tốt',
      message: `${stats.totalUsers} người dùng đang hoạt động`,
      icon: FiCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
    },
  ].filter(Boolean) : [];

  const statCards = stats ? [
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: FiUsers, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Giáo viên', value: stats.totalTeachers, icon: IoSchoolOutline, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Học sinh', value: stats.totalStudents, icon: FiBook, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Tài liệu', value: stats.totalDocuments, icon: IoDocumentTextOutline, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Đề thi', value: stats.totalExams, icon: MdOutlineQuiz, bgColor: 'bg-pink-50', iconColor: 'text-pink-600' },
    { label: 'Trò chơi', value: stats.totalGames, icon: IoGameControllerOutline, bgColor: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <FiLoader className="animate-spin" size={32} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
        >
          <FiRefreshCw size={14} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-1">Chào mừng quay trở lại, Administrator!</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors self-start md:self-auto"
        >
          <FiRefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <FiTrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Columns: Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hoạt động gần đây */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
            <Link to="/admin/reports" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              Xem báo cáo →
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiActivity size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có hoạt động nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${TYPE_ICON_COLOR[activity.type] || 'from-indigo-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-gray-500">{activity.action}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-600 truncate">{activity.subject}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatRelativeTime(activity.time)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cảnh báo & Quick links */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Cảnh báo hệ thống</h2>
          <div className="space-y-4">
            {systemAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${alert.bgColor} ${alert.borderColor}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${alert.iconColor} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Truy cập nhanh</p>
            <div className="space-y-1">
              <Link to="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                <FiUsers size={15} /> Quản lý người dùng
              </Link>
              <Link to="/admin/exams" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                <IoStatsChartOutline size={15} /> Xem bài kiểm tra
              </Link>
              <Link to="/admin/reports" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors">
                <FiActivity size={15} /> Báo cáo thống kê
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
