import React, { useState, useEffect, useCallback } from 'react';
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiLoader
} from 'react-icons/fi';
import {
  IoSchoolOutline,
  IoStatsChartOutline,
  IoTrophyOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoGameControllerOutline
} from 'react-icons/io5';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const TeacherStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState({ avgScore: 0, attendanceRate: 0, assignmentRate: 0, excellentCount: 0 });
  const [totalStudents, setTotalStudents] = useState(0);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [classComparison, setClassComparison] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const periods = [
    { id: 'week', name: 'Tuần này' },
    { id: 'month', name: 'Tháng này' },
    { id: 'semester', name: 'Học kỳ' },
    { id: 'year', name: 'Năm học' },
  ];

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/statistics/classes`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = selectedClass !== 'all' ? `?className=${encodeURIComponent(selectedClass)}` : '';

      const [overviewRes, distributionRes, comparisonRes, topRes, subjectRes, activityRes] = await Promise.all([
        fetch(`${API}/statistics/overview${query}`, { headers: getAuthHeaders() }),
        fetch(`${API}/statistics/score-distribution${query}`, { headers: getAuthHeaders() }),
        fetch(`${API}/statistics/class-comparison`, { headers: getAuthHeaders() }),
        fetch(`${API}/statistics/top-students${query}`, { headers: getAuthHeaders() }),
        fetch(`${API}/statistics/subject-performance${query}`, { headers: getAuthHeaders() }),
        fetch(`${API}/statistics/recent-activity`, { headers: getAuthHeaders() }),
      ]);

      const [overviewData, distributionData, comparisonData, topData, subjectData, activityData] = await Promise.all([
        overviewRes.json(),
        distributionRes.json(),
        comparisonRes.json(),
        topRes.json(),
        subjectRes.json(),
        activityRes.json(),
      ]);

      if (overviewData.success) {
        setOverview(overviewData.stats);
        setTotalStudents(overviewData.totalStudents);
      }
      if (distributionData.success) setScoreDistribution(distributionData.distribution);
      if (comparisonData.success) setClassComparison(comparisonData.comparison);
      if (topData.success) setTopStudents(topData.topStudents);
      if (subjectData.success) setSubjectPerformance(subjectData.performance);
      if (activityData.success) setRecentActivity(activityData.activities);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    {
      label: 'Điểm TB chung',
      value: overview.avgScore.toString(),
      icon: FiTrendingUp,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: `${totalStudents} học sinh`
    },
    {
      label: 'Tỷ lệ đi học',
      value: `${overview.attendanceRate}%`,
      icon: IoCheckmarkCircleOutline,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      description: 'Trung bình các lớp'
    },
    {
      label: 'Hoàn thành BT',
      value: `${overview.assignmentRate}%`,
      icon: FiCheckCircle,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Tỷ lệ nộp bài đúng hạn'
    },
    {
      label: 'HS xuất sắc',
      value: overview.excellentCount.toString(),
      icon: IoTrophyOutline,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Điểm TB >= 9.0'
    },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam': return { icon: IoStatsChartOutline, color: 'text-blue-500' };
      case 'game': return { icon: IoGameControllerOutline, color: 'text-purple-500' };
      default: return { icon: FiCheckCircle, color: 'text-emerald-500' };
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="ml-3 text-gray-600">Đang tải thống kê...</span>
      </div>
    );
  }

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
            <option value="all">Tất cả lớp</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
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
              <p className="text-sm text-gray-500">Tổng {totalStudents} học sinh</p>
            </div>
            <FiPieChart className="w-6 h-6 text-gray-400" />
          </div>
          {scoreDistribution.length > 0 ? (
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
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">Thành tích theo môn</h2>
              <p className="text-sm text-gray-500">Điểm trung bình các môn học</p>
            </div>
            <IoSchoolOutline className="w-6 h-6 text-gray-400" />
          </div>
          {subjectPerformance.length > 0 ? (
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
                  <span className="text-sm font-bold text-gray-800 w-8 text-right">{subject.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có dữ liệu đề thi</p>
          )}
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
          {classComparison.length > 0 ? (
            <div className="space-y-6">
              {classComparison.map((cls, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${cls.color} rounded-xl flex items-center justify-center text-white font-bold text-xs`}>
                        {cls.class.length > 4 ? cls.class.substring(0, 4) : cls.class}
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
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có dữ liệu học sinh</p>
          )}
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
          {topStudents.length > 0 ? (
            <div className="space-y-4">
              {topStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getRankBadge(student.rank)}`}>
                    #{student.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{student.score}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Hoạt động gần đây</h2>
            <p className="text-sm text-gray-500">Các hoạt động mới nhất</p>
          </div>
          <FiClock className="w-6 h-6 text-gray-400" />
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ActivityIcon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 mb-1">{activity.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{activity.class}</span>
                      {activity.avgScore && (
                        <span className="text-xs text-gray-600">Điểm: {activity.avgScore}</span>
                      )}
                      {activity.plays !== undefined && (
                        <span className="text-xs text-gray-600">Lượt chơi: {activity.plays}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Chưa có hoạt động nào</p>
        )}
      </div>

      {/* Insights */}
      {totalStudents > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiActivity className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Nhận xét & Gợi ý</h3>
              <ul className="space-y-2 text-sm text-emerald-50">
                {overview.avgScore >= 8.0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Điểm trung bình chung đạt {overview.avgScore} - mức khá tốt. Cần duy trì và phát huy.</span>
                  </li>
                )}
                {overview.avgScore < 7.0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Điểm trung bình chung chỉ đạt {overview.avgScore}. Cần có biện pháp nâng cao chất lượng.</span>
                  </li>
                )}
                {overview.attendanceRate < 90 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Tỷ lệ đi học {overview.attendanceRate}% còn thấp. Cần nhắc nhở và theo dõi sát hơn.</span>
                  </li>
                )}
                {overview.attendanceRate >= 95 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Tỷ lệ đi học đạt {overview.attendanceRate}% - rất tốt!</span>
                  </li>
                )}
                {overview.assignmentRate < 80 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Tỷ lệ hoàn thành bài tập chỉ {overview.assignmentRate}%. Nên nhắc nhở học sinh về deadline.</span>
                  </li>
                )}
                {overview.excellentCount > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Có {overview.excellentCount} học sinh xuất sắc (điểm TB {'>'}= 9.0). Tiếp tục phát huy!</span>
                  </li>
                )}
                {scoreDistribution.length > 0 && scoreDistribution[scoreDistribution.length - 1]?.count > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>
                      Có {scoreDistribution[scoreDistribution.length - 1].count} học sinh ({scoreDistribution[scoreDistribution.length - 1].percentage}%) có điểm TB dưới 6.0. Cần có biện pháp hỗ trợ kịp thời.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStatistics;
