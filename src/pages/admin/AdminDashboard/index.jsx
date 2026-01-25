import React, { useState } from 'react';
import { 
  FiUsers, 
  FiBook,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  IoSchoolOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline
} from 'react-icons/io5';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');

  // 6 stats chính
  const stats = [
    {
      label: 'Tổng người dùng',
      value: '2,547',
      change: '+12.5%',
      trend: 'up',
      icon: FiUsers,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      changeColor: 'text-blue-600'
    },
    {
      label: 'Giáo viên',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: IoSchoolOutline,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      changeColor: 'text-green-600'
    },
    {
      label: 'Học sinh',
      value: '2,391',
      change: '+15.3%',
      trend: 'up',
      icon: FiBook,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      changeColor: 'text-purple-600'
    },
    {
      label: 'Tài liệu',
      value: '1,248',
      change: '+23.1%',
      trend: 'up',
      icon: IoDocumentTextOutline,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      changeColor: 'text-orange-600'
    },
    {
      label: 'Đề thi',
      value: '387',
      change: '+18.7%',
      trend: 'up',
      icon: IoStatsChartOutline,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      changeColor: 'text-pink-600'
    },
    {
      label: 'Hoạt động/ngày',
      value: '4,826',
      change: '+7.8%',
      trend: 'up',
      icon: FiActivity,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      changeColor: 'text-cyan-600'
    }
  ];

  // Hoạt động gần đây
  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'tạo đề thi mới', subject: 'Toán học', time: '5 phút trước' },
    { id: 2, user: 'Trần Thị B', action: 'tải lên tài liệu', subject: 'Vật lý', time: '12 phút trước' },
    { id: 3, user: 'Lê Văn C', action: 'hoàn thành quiz', subject: 'Hóa học', time: '23 phút trước' },
    { id: 4, user: 'Phạm Thị D', action: 'chia sẻ tài liệu', subject: 'Sinh học', time: '1 giờ trước' },
    { id: 5, user: 'Hoàng Văn E', action: 'tạo trò chơi', subject: 'Địa lý', time: '2 giờ trước' }
  ];

  // Cảnh báo hệ thống
  const systemAlerts = [
    { 
      id: 1, 
      type: 'warning', 
      title: 'Dung lượng gần đầy', 
      message: 'Dung lượng đã sử dụng 85%',
      icon: FiAlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600'
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'Cập nhật hệ thống', 
      message: 'Phiên bản 2.1.0 đã sẵn sàng',
      icon: FiActivity,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600'
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'Backup thành công', 
      message: 'Dữ liệu đã được sao lưu',
      icon: FiCheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-1">Chào mừng quay trở lại, Administrator!</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
          <option value="90days">90 ngày qua</option>
        </select>
      </div>

      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-semibold ${stat.changeColor}`}>
                  {stat.trend === 'up' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2 Columns: Activities & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hoạt động gần đây - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{activity.subject}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cảnh báo hệ thống - 1 column */}
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
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;