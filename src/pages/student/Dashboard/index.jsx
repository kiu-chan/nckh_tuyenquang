import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiActivity,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import { 
  IoBookOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoTrophyOutline,
  IoSchoolOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoFlameOutline,
  IoStarOutline,
  IoRibbonOutline,
  IoCalculatorOutline,
  IoFlaskOutline,
  IoLanguageOutline,
  IoPencilOutline,
  IoCreateOutline
} from 'react-icons/io5';

const StudentDashboard = () => {
  const stats = [
    { 
      label: 'Khóa học đang học', 
      value: '8', 
      icon: IoSchoolOutline, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+2 khóa mới'
    },
    { 
      label: 'Bài tập cần làm', 
      value: '12', 
      icon: FiClock, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '5 sắp hết hạn'
    },
    { 
      label: 'Bài tập đã hoàn thành', 
      value: '45', 
      icon: FiCheckCircle, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8 tuần này'
    },
    { 
      label: 'Điểm trung bình', 
      value: '8.5', 
      icon: FiAward, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+0.3 so với trước'
    },
  ];

  const courses = [
    { 
      id: 1, 
      name: 'Toán học lớp 10', 
      teacher: 'Thầy Nguyễn Văn A',
      progress: 75,
      nextLesson: 'Bài 8: Hàm số bậc nhất',
      icon: IoCalculatorOutline,
      color: 'blue'
    },
    { 
      id: 2, 
      name: 'Vật lý lớp 10', 
      teacher: 'Cô Trần Thị B',
      progress: 60,
      nextLesson: 'Bài 5: Chuyển động tròn đều',
      icon: IoFlaskOutline,
      color: 'purple'
    },
    { 
      id: 3, 
      name: 'Hóa học lớp 10', 
      teacher: 'Thầy Lê Văn C',
      progress: 80,
      nextLesson: 'Bài 6: Bảng tuần hoàn',
      icon: IoFlaskOutline,
      color: 'green'
    },
    { 
      id: 4, 
      name: 'Tiếng Anh lớp 10', 
      teacher: 'Cô Phạm Thị D',
      progress: 85,
      nextLesson: 'Unit 4: For a better community',
      icon: IoLanguageOutline,
      color: 'pink'
    },
  ];

  const assignments = [
    { 
      id: 1, 
      subject: 'Toán học',
      title: 'Bài tập về hàm số',
      deadline: 'Hôm nay, 23:59',
      status: 'urgent',
      icon: IoCalculatorOutline,
      color: 'red'
    },
    { 
      id: 2, 
      subject: 'Văn học',
      title: 'Phân tích bài thơ "Sóng"',
      deadline: 'Mai, 17:00',
      status: 'pending',
      icon: IoPencilOutline,
      color: 'orange'
    },
    { 
      id: 3, 
      subject: 'Vật lý',
      title: 'Bài thực hành thí nghiệm',
      deadline: '25/01, 15:00',
      status: 'normal',
      icon: IoFlaskOutline,
      color: 'blue'
    },
  ];

  const upcomingExams = [
    { 
      id: 1, 
      subject: 'Toán học',
      title: 'Kiểm tra 15 phút - Chương 3',
      date: '26/01/2025',
      time: '7:30 - 7:45',
      room: 'Phòng 301'
    },
    { 
      id: 2, 
      subject: 'Hóa học',
      title: 'Kiểm tra giữa kỳ',
      date: '28/01/2025',
      time: '9:00 - 10:00',
      room: 'Phòng 205'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      type: 'assignment',
      title: 'Đã nộp bài tập Toán học',
      time: '30 phút trước',
      icon: IoCheckmarkCircleOutline,
      color: 'text-green-500'
    },
    { 
      id: 2, 
      type: 'score',
      title: 'Nhận điểm bài kiểm tra Văn: 9.0',
      time: '2 giờ trước',
      icon: IoTrophyOutline,
      color: 'text-yellow-500'
    },
    { 
      id: 3, 
      type: 'course',
      title: 'Hoàn thành bài học Vật lý',
      time: '5 giờ trước',
      icon: IoBookOutline,
      color: 'text-blue-500'
    },
    { 
      id: 4, 
      type: 'game',
      title: 'Đạt 100 điểm trong Quiz Hóa học',
      time: '1 ngày trước',
      icon: IoGameControllerOutline,
      color: 'text-purple-500'
    },
  ];

  const achievements = [
    { 
      id: 1, 
      title: 'Học sinh giỏi', 
      icon: IoTrophyOutline, 
      color: 'yellow',
      bgColor: 'bg-yellow-500'
    },
    { 
      id: 2, 
      title: 'Hoàn thành 50 bài tập', 
      icon: IoCheckmarkCircleOutline, 
      color: 'green',
      bgColor: 'bg-green-500'
    },
    { 
      id: 3, 
      title: 'Streak 7 ngày', 
      icon: IoFlameOutline, 
      color: 'orange',
      bgColor: 'bg-orange-500'
    },
    { 
      id: 4, 
      title: 'Top 10 lớp', 
      icon: IoStarOutline, 
      color: 'blue',
      bgColor: 'bg-blue-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Chào mừng trở lại!</h1>
          <FiZap className="w-8 h-8 text-yellow-300" />
        </div>
        <p className="text-blue-100">Hôm nay bạn có 12 bài tập cần hoàn thành. Cố lên nhé!</p>
        
        {/* Quick Stats in Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div key={achievement.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors">
                <div className={`w-12 h-12 ${achievement.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-blue-100 font-medium">{achievement.title}</p>
              </div>
            );
          })}
        </div>
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
              <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses & Assignments (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Khóa học của tôi</h2>
              <Link to="/student/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <div
                    key={course.id}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 bg-${course.color}-50 rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${course.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{course.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{course.teacher}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Tiến độ</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r from-${course.color}-500 to-${course.color}-600 h-2 rounded-full transition-all`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <IoTimeOutline className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500">
                        Tiếp theo: {course.nextLesson}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Bài tập cần làm</h2>
              <Link to="/student/assignments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const Icon = assignment.icon;
                return (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      assignment.status === 'urgent'
                        ? 'bg-red-50 border-red-500'
                        : assignment.status === 'pending'
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          assignment.status === 'urgent'
                            ? 'bg-red-100'
                            : assignment.status === 'pending'
                            ? 'bg-orange-100'
                            : 'bg-blue-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            assignment.status === 'urgent'
                              ? 'text-red-600'
                              : assignment.status === 'pending'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{assignment.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{assignment.subject}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{assignment.deadline}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/student/assignments"
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Làm bài
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Schedule & Activities (1 column) */}
        <div className="space-y-6">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch kiểm tra</h2>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IoCalendarOutline className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{exam.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{exam.subject}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{exam.date}</span>
                        <span>•</span>
                        <span>{exam.time}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <IoSchoolOutline className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{exam.room}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/student/exams"
              className="block mt-4 text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem lịch đầy đủ
            </Link>
          </div>

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
          </div>

          {/* Study Streak */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <IoFlameOutline className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-1">7 ngày</h3>
            <p className="text-orange-100 text-sm">Streak học tập liên tục</p>
            <p className="text-orange-100 text-xs mt-2">Tiếp tục phấn đấu để duy trì!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;