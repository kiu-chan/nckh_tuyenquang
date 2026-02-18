import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiSearch,
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
  IoTimeOutline,
  IoPeopleOutline
} from 'react-icons/io5';
import AIExamCreator from '../../../components/AIExamCreator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const TeacherExams = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const [exams, setExams] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, published: 0, completed: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Creation states
  const [creationMethod, setCreationMethod] = useState('ai');
  const [examConfig, setExamConfig] = useState({
    title: '',
    subject: '',
    subjectId: '',
    type: 'multiple-choice',
    difficulty: 'medium',
    duration: 90,
    totalQuestions: 30
  });

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

  const fetchExams = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterSubject !== 'all') {
        const subjectName = subjects.find(s => s.id === filterSubject)?.name;
        if (subjectName) params.append('subject', subjectName);
      }
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API}/exams?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setExams(data.exams);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterSubject, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/exams/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStatsData(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateExam = async () => {
    if (!examConfig.title || !examConfig.subject) {
      setError('Vui lòng nhập tên đề thi và chọn môn học');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: examConfig.title,
          subject: examConfig.subject,
          subjectId: examConfig.subjectId,
          type: examConfig.type,
          difficulty: examConfig.difficulty,
          duration: examConfig.duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowCreateModal(false);
      resetExamConfig();
      fetchExams();
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;
    try {
      const res = await fetch(`${API}/exams/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchExams();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const handleDuplicateExam = async (id) => {
    try {
      const res = await fetch(`${API}/exams/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        fetchExams();
        fetchStats();
      }
    } catch (err) {
      console.error('Error duplicating exam:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/exams/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchExams();
        fetchStats();
      }
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleQuestionsGenerated = async (data) => {
    try {
      const res = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: examConfig.title || `Đề thi ${examConfig.subject} - AI`,
          subject: examConfig.subject,
          subjectId: examConfig.subjectId,
          type: examConfig.type,
          difficulty: examConfig.difficulty,
          duration: examConfig.duration,
          questions: data.questions || [],
          topics: data.topics || [],
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setShowCreateModal(false);
      resetExamConfig();
      fetchExams();
      fetchStats();
    } catch (err) {
      alert('Lỗi khi lưu đề thi: ' + err.message);
    }
  };

  const resetExamConfig = () => {
    setExamConfig({
      title: '',
      subject: '',
      subjectId: '',
      type: 'multiple-choice',
      difficulty: 'medium',
      duration: 90,
      totalQuestions: 30,
    });
    setCreationMethod('ai');
    setError('');
  };

  const handleExamConfigChange = (field, value) => {
    setExamConfig(prev => ({ ...prev, [field]: value }));
  };

  const stats = [
    { label: 'Tổng đề thi', value: statsData.total, icon: IoDocumentTextOutline, color: 'blue' },
    { label: 'Đang diễn ra', value: statsData.published, icon: IoTimeOutline, color: 'green' },
    { label: 'Đã hoàn thành', value: statsData.completed, icon: IoCheckmarkCircleOutline, color: 'purple' },
    { label: 'Nháp', value: statsData.draft, icon: IoCreateOutline, color: 'orange' },
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

  const getProgressPercentage = (submitted, total) => {
    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                <p className="text-sm text-gray-600">{stat.label}</p>
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
            { id: 'all', label: 'Tất cả', count: statsData.total },
            { id: 'draft', label: 'Nháp', count: statsData.draft },
            { id: 'published', label: 'Đang mở', count: statsData.published },
            { id: 'completed', label: 'Đã hoàn thành', count: statsData.completed },
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
        {exams.map((exam) => {
          const statusBadge = getStatusBadge(exam.status);
          const difficultyBadge = getDifficultyBadge(exam.difficulty);
          const TypeIcon = getTypeIcon(exam.type);
          const progressPercentage = getProgressPercentage(exam.submitted, exam.students);

          return (
            <div key={exam._id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
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
                {exam.topics && exam.topics.length > 0 && (
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

                  {exam.className && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <FiUsers className="w-4 h-4" />
                        <span className="text-xs font-medium">Lớp</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-900">
                        {exam.className}
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

                {/* Progress Bar */}
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
                      <button
                        onClick={() => handleStatusChange(exam._id, 'published')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Phát hành</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        onClick={() => handleDuplicateExam(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FiCopy className="w-4 h-4" />
                        <span>Sao chép</span>
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
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
                        <>
                          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                            <FiUsers className="w-4 h-4" />
                            <span>Theo dõi ({exam.submitted})</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(exam._id, 'completed')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Kết thúc</span>
                          </button>
                        </>
                      )}
                      {exam.status === 'completed' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Xem kết quả</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateExam(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
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
      {exams.length === 0 && (
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
                onClick={() => {
                  setShowCreateModal(false);
                  resetExamConfig();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiXCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="space-y-6">
              {/* Choose Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn phương thức tạo đề
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCreationMethod('manual')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      creationMethod === 'manual'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                      <IoCreateOutline className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tạo thủ công</h3>
                    <p className="text-sm text-gray-500">Tự soạn từng câu hỏi theo ý muốn</p>
                  </button>
                  <button
                    onClick={() => setCreationMethod('ai')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      creationMethod === 'ai'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                      <IoSparklesOutline className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tạo bằng AI</h3>
                    <p className="text-sm text-gray-500">AI tự động tạo câu hỏi từ tài liệu</p>
                  </button>
                </div>
              </div>

              {creationMethod === 'manual' ? (
                <>
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đề thi
                    </label>
                    <input
                      type="text"
                      value={examConfig.title}
                      onChange={(e) => handleExamConfigChange('title', e.target.value)}
                      placeholder="VD: Kiểm tra giữa kỳ I - Toán 10"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học
                      </label>
                      <select
                        value={examConfig.subject}
                        onChange={(e) => {
                          const subject = e.target.value;
                          const subjectId = subjects.find(s => s.name === subject)?.id || '';
                          setExamConfig(prev => ({ ...prev, subject, subjectId }));
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Chọn môn học</option>
                        {subjects.filter(s => s.id !== 'all').map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại đề
                      </label>
                      <select
                        value={examConfig.type}
                        onChange={(e) => handleExamConfigChange('type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="multiple-choice">Trắc nghiệm</option>
                        <option value="essay">Tự luận</option>
                        <option value="mixed">Trắc nghiệm + Tự luận</option>
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
                        value={examConfig.duration}
                        onChange={(e) => handleExamConfigChange('duration', parseInt(e.target.value))}
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
                        value={examConfig.totalQuestions}
                        onChange={(e) => handleExamConfigChange('totalQuestions', parseInt(e.target.value))}
                        placeholder="30"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Độ khó
                      </label>
                      <select
                        value={examConfig.difficulty}
                        onChange={(e) => handleExamConfigChange('difficulty', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetExamConfig();
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleCreateExam}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Đang tạo...' : 'Tạo đề thi'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* AI Creation - Basic Config First */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Môn học
                        </label>
                        <select
                          value={examConfig.subject}
                          onChange={(e) => {
                            const subject = e.target.value;
                            const subjectId = subjects.find(s => s.name === subject)?.id || '';
                            setExamConfig(prev => ({ ...prev, subject, subjectId }));
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Chọn môn học</option>
                          {subjects.filter(s => s.id !== 'all').map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại đề
                        </label>
                        <select
                          value={examConfig.type}
                          onChange={(e) => handleExamConfigChange('type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="multiple-choice">Trắc nghiệm</option>
                          <option value="essay">Tự luận</option>
                          <option value="mixed">Trắc nghiệm + Tự luận</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Độ khó
                      </label>
                      <select
                        value={examConfig.difficulty}
                        onChange={(e) => handleExamConfigChange('difficulty', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-4"></div>

                  {/* AI Exam Creator Component */}
                  <AIExamCreator
                    examType={examConfig.type}
                    subject={examConfig.subject}
                    difficulty={examConfig.difficulty}
                    onQuestionsGenerated={handleQuestionsGenerated}
                    onClose={() => {
                      setShowCreateModal(false);
                      resetExamConfig();
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExams;
