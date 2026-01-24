import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiArrowRight
} from 'react-icons/fi';
import { 
  IoBookOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoCreateOutline,
  IoClipboardOutline,
  IoSparklesOutline
} from 'react-icons/io5';

const TeacherDashboard = () => {
  const stats = [
    { 
      label: 'Tổng học sinh', 
      value: '156', 
      change: '+12%', 
      icon: FiUsers, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Tài liệu', 
      value: '48', 
      change: '+5', 
      icon: IoDocumentTextOutline, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'Đề thi', 
      value: '24', 
      change: '+3', 
      icon: IoCreateOutline, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Bài tập chờ chấm', 
      value: '38', 
      change: 'Mới', 
      icon: FiClock, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

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
      path: '/teacher/questions'
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
      title: 'Viết nhận xét', 
      description: 'AI gợi ý nhận xét theo tiêu chí, mức độ',
      icon: IoSparklesOutline, 
      color: 'from-indigo-500 to-purple-500',
      path: '/teacher/students'
    },
    { 
      title: 'Soạn giảng án', 
      description: 'Tạo kế hoạch bài giảng chi tiết',
      icon: IoBookOutline, 
      color: 'from-pink-500 to-rose-500',
      path: '/teacher/notebook'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      type: 'document', 
      title: 'Đã tạo tài liệu "Bài 5: Hàm số"',
      time: '10 phút trước',
      icon: IoDocumentTextOutline,
      color: 'text-blue-500'
    },
    { 
      id: 2, 
      type: 'exam', 
      title: 'Đã tạo đề thi "Kiểm tra 15 phút - Chương 2"',
      time: '1 giờ trước',
      icon: IoCreateOutline,
      color: 'text-purple-500'
    },
    { 
      id: 3, 
      type: 'student', 
      title: 'Nguyễn Văn A đã nộp bài tập',
      time: '2 giờ trước',
      icon: FiUsers,
      color: 'text-emerald-500'
    },
    { 
      id: 4, 
      type: 'game', 
      title: 'Đã tạo trò chơi "Quiz Toán học"',
      time: '3 giờ trước',
      icon: IoGameControllerOutline,
      color: 'text-orange-500'
    },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Chấm bài kiểm tra lớp 10A', deadline: 'Hôm nay, 17:00', priority: 'high' },
    { id: 2, title: 'Chuẩn bị giảng án tuần sau', deadline: 'Thứ 6, 15:00', priority: 'medium' },
    { id: 3, title: 'Họp phụ huynh lớp 10B', deadline: 'Thứ 7, 9:00', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Xin chào, Thầy/Cô! 👋</h1>
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
                <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
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
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Xem tất cả
          </button>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Công việc sắp tới</h2>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-l-4 ${
                  task.priority === 'high'
                    ? 'bg-red-50 border-red-500'
                    : task.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">{task.deadline}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Xem tất cả công việc
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;