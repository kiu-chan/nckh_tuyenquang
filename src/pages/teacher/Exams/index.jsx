import React, { useState } from 'react';
import { 
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiEye,
  FiDownload,
  FiShare2,
  FiClock,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiMoreVertical,
  FiCalendar,
  FiFileText
} from 'react-icons/fi';
import { 
  IoDocumentTextOutline,
  IoCreateOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoPeopleOutline
} from 'react-icons/io5';

const TeacherExams = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, draft, published, completed
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const subjects = [
    { id: 'all', name: 'Tất cả môn' },
    { id: 'math', name: 'Toán học' },
    { id: 'physics', name: 'Vật lý' },
    { id: 'chemistry', name: 'Hóa học' },
    { id: 'biology', name: 'Sinh học' },
  ];

  const examTypes = [
    { id: 'multiple-choice', name: 'Trắc nghiệm', icon: IoCheckmarkCircleOutline },
    { id: 'essay', name: 'Tự luận', icon: IoDocumentTextOutline },
    { id: 'mixed', name: 'Trắc nghiệm + Tự luận', icon: IoCreateOutline },
  ];

  const exams = [
    {
      id: 1,
      title: 'Kiểm tra giữa kỳ I - Toán 10',
      subject: 'Toán học',
      subjectId: 'math',
      type: 'mixed',
      duration: 90,
      totalQuestions: 30,
      totalPoints: 10,
      status: 'published',
      createdDate: '15/01/2025',
      scheduledDate: '25/01/2025',
      scheduledTime: '07:30',
      class: 'Lớp 10A1, 10A2',
      students: 68,
      submitted: 45,
      graded: 30,
      difficulty: 'medium',
      topics: ['Hàm số', 'Phương trình', 'Bất phương trình']
    },
    {
      id: 2,
      title: 'Kiểm tra 15 phút - Đạo hàm',
      subject: 'Toán học',
      subjectId: 'math',
      type: 'multiple-choice',
      duration: 15,
      totalQuestions: 10,
      totalPoints: 10,
      status: 'completed',
      createdDate: '10/01/2025',
      scheduledDate: '18/01/2025',
      scheduledTime: '07:00',
      class: 'Lớp 11A1',
      students: 34,
      submitted: 34,
      graded: 34,
      difficulty: 'easy',
      topics: ['Đạo hàm cơ bản', 'Quy tắc đạo hàm']
    },
    {
      id: 3,
      title: 'Đề thi thử THPT Quốc gia 2025',
      subject: 'Toán học',
      subjectId: 'math',
      type: 'mixed',
      duration: 180,
      totalQuestions: 50,
      totalPoints: 10,
      status: 'draft',
      createdDate: '20/01/2025',
      scheduledDate: null,
      scheduledTime: null,
      class: null,
      students: 0,
      submitted: 0,
      graded: 0,
      difficulty: 'hard',
      topics: ['Tổng hợp tất cả chương']
    },
    {
      id: 4,
      title: 'Kiểm tra học kỳ I - Vật lý 10',
      subject: 'Vật lý',
      subjectId: 'physics',
      type: 'mixed',
      duration: 60,
      totalQuestions: 25,
      totalPoints: 10,
      status: 'published',
      createdDate: '12/01/2025',
      scheduledDate: '28/01/2025',
      scheduledTime: '09:00',
      class: 'Lớp 10A1, 10A3',
      students: 56,
      submitted: 12,
      graded: 0,
      difficulty: 'medium',
      topics: ['Động học', 'Động lực học']
    },
    {
      id: 5,
      title: 'Bài tập tự luận - Hóa hữu cơ',
      subject: 'Hóa học',
      subjectId: 'chemistry',
      type: 'essay',
      duration: 45,
      totalQuestions: 5,
      totalPoints: 10,
      status: 'draft',
      createdDate: '18/01/2025',
      scheduledDate: null,
      scheduledTime: null,
      class: null,
      students: 0,
      submitted: 0,
      graded: 0,
      difficulty: 'hard',
      topics: ['Hidrocacbon', 'Dẫn xuất']
    },
  ];

  const stats = [
    { 
      label: 'Tổng đề thi', 
      value: exams.length.toString(), 
      icon: IoDocumentTextOutline, 
      color: 'blue',
      change: '+3 tuần này'
    },
    { 
      label: 'Đang diễn ra', 
      value: exams.filter(e => e.status === 'published').length.toString(), 
      icon: IoTimeOutline, 
      color: 'green',
      change: '2 đề sắp tới'
    },
    { 
      label: 'Đã hoàn thành', 
      value: exams.filter(e => e.status === 'completed').length.toString(), 
      icon: IoCheckmarkCircleOutline, 
      color: 'purple',
      change: '100% đã chấm'
    },
    { 
      label: 'Nháp', 
      value: exams.filter(e => e.status === 'draft').length.toString(), 
      icon: IoCreateOutline, 
      color: 'orange',
      change: 'Cần hoàn thiện'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return { text: 'Đang mở', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'completed':
        return { text: 'Đã hoàn thành', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'draft':
        return { text: 'Nháp', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      default:
        return { text: 'Khác', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { text: 'Dễ', color: 'bg-green-50 text-green-700' };
      case 'medium':
        return { text: 'Trung bình', color: 'bg-yellow-50 text-yellow-700' };
      case 'hard':
        return { text: 'Khó', color: 'bg-red-50 text-red-700' };
      default:
        return { text: '', color: '' };
    }
  };

  const getTypeIcon = (typeId) => {
    const type = examTypes.find(t => t.id === typeId);
    return type ? type.icon : IoDocumentTextOutline;
  };

  const filteredExams = exams.filter(exam => {
    const matchesTab = activeTab === 'all' || exam.status === activeTab;
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || exam.subjectId === filterSubject;
    return matchesTab && matchesSearch && matchesSubject;
  });

  const getProgressPercentage = (submitted, total) => {
    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý đề thi</h1>
          <p className="text-gray-600">Tạo, quản lý và theo dõi kết quả đề thi</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
        >
          <FiPlus className="w-5 h-5" />
          <span>Tạo đề thi mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          {[
            { id: 'all', label: 'Tất cả', count: exams.length },
            { id: 'draft', label: 'Nháp', count: exams.filter(e => e.status === 'draft').length },
            { id: 'published', label: 'Đang mở', count: exams.filter(e => e.status === 'published').length },
            { id: 'completed', label: 'Đã hoàn thành', count: exams.filter(e => e.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-emerald-100' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam) => {
          const statusBadge = getStatusBadge(exam.status);
          const difficultyBadge = getDifficultyBadge(exam.difficulty);
          const TypeIcon = getTypeIcon(exam.type);
          const progressPercentage = getProgressPercentage(exam.submitted, exam.students);

          return (
            <div key={exam.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyBadge.color}`}>
                        {difficultyBadge.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiFileText className="w-4 h-4" />
                        {exam.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <TypeIcon className="w-4 h-4" />
                        {examTypes.find(t => t.id === exam.type)?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {exam.duration} phút
                      </span>
                      <span className="flex items-center gap-1">
                        <FiFileText className="w-4 h-4" />
                        {exam.totalQuestions} câu
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Topics */}
                {exam.topics && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exam.topics.map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {exam.scheduledDate && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Lịch thi</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">
                        {exam.scheduledDate}
                      </p>
                      <p className="text-xs text-blue-600">{exam.scheduledTime}</p>
                    </div>
                  )}
                  
                  {exam.class && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <FiUsers className="w-4 h-4" />
                        <span className="text-xs font-medium">Lớp</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-900">
                        {exam.class}
                      </p>
                    </div>
                  )}

                  {exam.students > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <IoPeopleOutline className="w-4 h-4" />
                        <span className="text-xs font-medium">Học sinh</span>
                      </div>
                      <p className="text-sm font-semibold text-green-900">
                        {exam.students} người
                      </p>
                    </div>
                  )}

                  {exam.status !== 'draft' && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700 mb-1">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Đã nộp</span>
                      </div>
                      <p className="text-sm font-semibold text-orange-900">
                        {exam.submitted}/{exam.students}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar (for published/completed) */}
                {exam.status !== 'draft' && exam.students > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ nộp bài</span>
                      <span className="font-semibold text-gray-800">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>Đã chấm: {exam.graded}/{exam.submitted}</span>
                      <span>Còn lại: {exam.students - exam.submitted}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  {exam.status === 'draft' ? (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <IoSparklesOutline className="w-4 h-4" />
                        <span>Tạo tự động bằng AI</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <FiEye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </button>
                      {exam.status === 'published' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                          <FiUsers className="w-4 h-4" />
                          <span>Theo dõi ({exam.submitted})</span>
                        </button>
                      )}
                      {exam.status === 'completed' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Xem kết quả</span>
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <FiCopy className="w-4 h-4" />
                        <span>Sao chép</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <FiDownload className="w-4 h-4" />
                        <span>Tải xuống</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <FiShare2 className="w-4 h-4" />
                        <span>Chia sẻ</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredExams.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoDocumentTextOutline className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy đề thi</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tạo đề thi mới</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Tạo đề thi mới
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tạo đề thi mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiXCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Choose Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn phương thức tạo đề
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <IoCreateOutline className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tạo thủ công</h3>
                    <p className="text-sm text-gray-500">Tự soạn từng câu hỏi theo ý muốn</p>
                  </button>
                  <button className="p-6 border-2 border-emerald-500 bg-emerald-50 rounded-xl transition-all text-left">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <IoSparklesOutline className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tạo bằng AI</h3>
                    <p className="text-sm text-gray-500">AI tự động tạo câu hỏi từ tài liệu</p>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đề thi
                </label>
                <input
                  type="text"
                  placeholder="VD: Kiểm tra giữa kỳ I - Toán 10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Môn học
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Chọn môn học</option>
                    <option>Toán học</option>
                    <option>Vật lý</option>
                    <option>Hóa học</option>
                    <option>Sinh học</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại đề
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Trắc nghiệm</option>
                    <option>Tự luận</option>
                    <option>Trắc nghiệm + Tự luận</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    placeholder="90"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số câu hỏi
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Dễ</option>
                    <option>Trung bình</option>
                    <option>Khó</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExams;