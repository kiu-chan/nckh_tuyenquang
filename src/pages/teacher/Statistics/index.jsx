import React, { useState } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiDownload,
  FiFilter
} from 'react-icons/fi';
import {
  IoSchoolOutline,
  IoStatsChartOutline,
  IoTrophyOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';

const TeacherStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');

  const periods = [
    { id: 'week', name: 'Tuần này' },
    { id: 'month', name: 'Tháng này' },
    { id: 'semester', name: 'Học kỳ' },
    { id: 'year', name: 'Năm học' },
  ];

  const classes = [
    { id: 'all', name: 'Tất cả lớp' },
    { id: '10a1', name: 'Lớp 10A1' },
    { id: '10a2', name: 'Lớp 10A2' },
    { id: '10a3', name: 'Lớp 10A3' },
    { id: '11a1', name: 'Lớp 11A1' },
  ];

  const stats = [
    {
      label: 'Điểm TB chung',
      value: '8.2',
      change: '+0.3',
      changeType: 'increase',
      icon: FiTrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'So với tháng trước'
    },
    {
      label: 'Tỷ lệ đi học',
      value: '92%',
      change: '+2%',
      changeType: 'increase',
      icon: IoCheckmarkCircleOutline,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      description: 'So với tháng trước'
    },
    {
      label: 'Hoàn thành BT',
      value: '88%',
      change: '-3%',
      changeType: 'decrease',
      icon: FiCheckCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Tỷ lệ nộp bài đúng hạn'
    },
    {
      label: 'HS xuất sắc',
      value: '42',
      change: '+5',
      changeType: 'increase',
      icon: IoTrophyOutline,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Điểm TB >= 9.0'
    },
  ];

  const scoreDistribution = [
    { range: '9.0 - 10', count: 42, percentage: 27, color: 'bg-emerald-500' },
    { range: '8.0 - 8.9', count: 58, percentage: 37, color: 'bg-blue-500' },
    { range: '7.0 - 7.9', count: 35, percentage: 22, color: 'bg-yellow-500' },
    { range: '6.0 - 6.9', count: 15, percentage: 10, color: 'bg-orange-500' },
    { range: '< 6.0', count: 6, percentage: 4, color: 'bg-red-500' },
  ];

  const classComparison = [
    {
      class: '10A1',
      avgScore: 8.5,
      attendance: 95,
      assignments: 92,
      students: 42,
      color: 'bg-blue-500'
    },
    {
      class: '10A2',
      avgScore: 8.2,
      attendance: 90,
      assignments: 88,
      students: 38,
      color: 'bg-emerald-500'
    },
    {
      class: '10A3',
      avgScore: 7.8,
      attendance: 88,
      assignments: 85,
      students: 40,
      color: 'bg-purple-500'
    },
    {
      class: '11A1',
      avgScore: 8.9,
      attendance: 96,
      assignments: 94,
      students: 36,
      color: 'bg-orange-500'
    },
  ];

  const topStudents = [
    {
      id: 1,
      name: 'Đặng Thị Linh',
      class: '11A1',
      score: 9.5,
      rank: 1,
      improvement: '+0.3'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      class: '10A1',
      score: 9.2,
      rank: 2,
      improvement: '+0.2'
    },
    {
      id: 3,
      name: 'Phạm Quốc Dũng',
      class: '10A2',
      score: 8.9,
      rank: 3,
      improvement: '+0.1'
    },
    {
      id: 4,
      name: 'Nguyễn Văn An',
      class: '10A1',
      score: 8.5,
      rank: 4,
      improvement: '0.0'
    },
    {
      id: 5,
      name: 'Vũ Đức Kiên',
      class: '10A3',
      score: 8.1,
      rank: 5,
      improvement: '+0.4'
    },
  ];

  const weeklyTrend = [
    { week: 'T2', score: 7.8, attendance: 88 },
    { week: 'T3', score: 8.0, attendance: 90 },
    { week: 'T4', score: 8.2, attendance: 92 },
    { week: 'T5', score: 8.3, attendance: 91 },
    { week: 'T6', score: 8.5, attendance: 94 },
    { week: 'T7', score: 8.4, attendance: 85 },
    { week: 'CN', score: 0, attendance: 0 },
  ];

  const activityLog = [
    {
      id: 1,
      type: 'test',
      title: 'Kiểm tra 15 phút - Chương 2',
      class: '10A1',
      avgScore: 8.5,
      date: '2 giờ trước',
      icon: IoStatsChartOutline,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Bài tập về đạo hàm',
      class: '10A2',
      completed: '35/38',
      date: '5 giờ trước',
      icon: FiCheckCircle,
      color: 'text-emerald-500'
    },
    {
      id: 3,
      type: 'exam',
      title: 'Đề thi giữa kỳ I',
      class: 'Tất cả',
      avgScore: 8.2,
      date: '1 ngày trước',
      icon: IoTrophyOutline,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'attendance',
      title: 'Điểm danh tuần 12',
      class: '11A1',
      attendance: '96%',
      date: '2 ngày trước',
      icon: IoCheckmarkCircleOutline,
      color: 'text-orange-500'
    },
  ];

  const subjectPerformance = [
    { subject: 'Toán', score: 8.2, trend: 'up' },
    { subject: 'Văn', score: 7.8, trend: 'up' },
    { subject: 'Anh', score: 8.5, trend: 'down' },
    { subject: 'Lý', score: 7.5, trend: 'up' },
    { subject: 'Hóa', score: 8.0, trend: 'stable' },
    { subject: 'Sinh', score: 7.9, trend: 'up' },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thống kê & Báo cáo</h1>
          <p className="text-gray-600">Phân tích và theo dõi hiệu quả học tập</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
            <FiDownload className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
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
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <FiTrendingUp className="w-4 h-4" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Phân bố điểm số</h2>
              <p className="text-sm text-gray-500">Tổng 156 học sinh</p>
            </div>
            <FiPieChart className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {scoreDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-20">{item.range}</span>
                    <span className="text-sm text-gray-500">{item.count} HS</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Xu hướng theo tuần</h2>
              <p className="text-sm text-gray-500">Điểm số & Điểm danh</p>
            </div>
            <FiActivity className="w-6 h-6 text-gray-400" />
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                {/* Score Bar */}
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ height: `${day.score * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-blue-600 mt-1">{day.score > 0 ? day.score : '-'}</span>
                </div>
                {/* Attendance Bar */}
                <div className="w-full flex flex-col items-center">
                  <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '60px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ height: `${day.attendance}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 mt-1">{day.attendance > 0 ? day.attendance + '%' : '-'}</span>
                </div>
                <span className="text-xs font-medium text-gray-600 mt-1">{day.week}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Điểm số</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-xs text-gray-600">Điểm danh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Comparison & Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">So sánh giữa các lớp</h2>
              <p className="text-sm text-gray-500">Điểm TB, Điểm danh, Bài tập</p>
            </div>
            <FiBarChart2 className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-6">
            {classComparison.map((cls, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${cls.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {cls.class}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{cls.class}</p>
                      <p className="text-xs text-gray-500">{cls.students} học sinh</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{cls.avgScore}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Điểm TB</span>
                      <span className="text-xs font-medium text-gray-700">{cls.avgScore}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${cls.avgScore * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Điểm danh</span>
                      <span className="text-xs font-medium text-gray-700">{cls.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${cls.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Bài tập</span>
                      <span className="text-xs font-medium text-gray-700">{cls.assignments}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${cls.assignments}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Học sinh xuất sắc</h2>
              <p className="text-sm text-gray-500">Top 5</p>
            </div>
            <IoTrophyOutline className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {topStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getRankBadge(student.rank)}`}>
                  #{student.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{student.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{student.class}</p>
                    <span className="text-xs text-emerald-600 font-medium">{student.improvement}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">{student.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Thành tích theo môn</h2>
              <p className="text-sm text-gray-500">Điểm trung bình các môn học</p>
            </div>
            <IoSchoolOutline className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700">{subject.subject}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${subject.score * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 w-8 text-right">{subject.score}</span>
                  {subject.trend === 'up' && <FiTrendingUp className="w-4 h-4 text-emerald-600" />}
                  {subject.trend === 'down' && <FiTrendingDown className="w-4 h-4 text-red-600" />}
                  {subject.trend === 'stable' && <div className="w-4 h-0.5 bg-gray-400"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Hoạt động gần đây</h2>
              <p className="text-sm text-gray-500">Các thống kê mới nhất</p>
            </div>
            <FiClock className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {activityLog.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 mb-1">{activity.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{activity.class}</span>
                      {activity.avgScore && (
                        <span className="text-xs text-gray-600">ĐTB: {activity.avgScore}</span>
                      )}
                      {activity.completed && (
                        <span className="text-xs text-gray-600">Nộp: {activity.completed}</span>
                      )}
                      {activity.attendance && (
                        <span className="text-xs text-gray-600">Có mặt: {activity.attendance}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiActivity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Nhận xét & Gợi ý</h3>
            <ul className="space-y-2 text-sm text-emerald-50">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Lớp 11A1 có thành tích xuất sắc với điểm TB 8.9 và tỷ lệ đi học 96%. Cần duy trì chất lượng này.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Tỷ lệ hoàn thành bài tập giảm 3% so với tháng trước. Nên nhắc nhở học sinh về deadline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Có 6 học sinh (4%) có điểm TB dưới 6.0. Cần có biện pháp hỗ trợ kịp thời.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Điểm môn Lý thấp nhất (7.5). Đề xuất tổ chức buổi học phụ đạo hoặc ôn tập.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStatistics;
