import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiX,
  FiLoader,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiUsers,
  FiFileText,
} from 'react-icons/fi';
import {
  IoDocumentTextOutline,
  IoSchoolOutline,
} from 'react-icons/io5';
import { MdOutlineQuiz } from 'react-icons/md';

const API_BASE = '/api/admin';
const getToken = () => localStorage.getItem('authToken');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Helpers ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft: { label: 'Nháp', cls: 'bg-gray-100 text-gray-600' },
  published: { label: 'Đang mở', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Đã xong', cls: 'bg-emerald-100 text-emerald-700' },
};

const DIFF_CONFIG = {
  easy: { label: 'Dễ', cls: 'bg-green-100 text-green-700' },
  medium: { label: 'Trung bình', cls: 'bg-yellow-100 text-yellow-700' },
  hard: { label: 'Khó', cls: 'bg-red-100 text-red-700' },
};

const TYPE_LABEL = {
  'multiple-choice': 'Trắc nghiệm',
  essay: 'Tự luận',
  mixed: 'Hỗn hợp',
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// ─── Detail Modal ──────────────────────────────────────────────

const DetailModal = ({ exam, onClose }) => {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/exams/${exam._id}`, { headers: authHeader() });
        const data = await res.json();
        if (data.success) setFull(data.exam);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [exam._id]);

  const e = full || exam;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 pr-4 truncate">{e.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Môn học', value: e.subject },
              { label: 'Giáo viên', value: e.teacher?.name || '—' },
              { label: 'Email GV', value: e.teacher?.email || '—' },
              { label: 'Loại đề', value: TYPE_LABEL[e.type] || e.type },
              {
                label: 'Độ khó', value: (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${DIFF_CONFIG[e.difficulty]?.cls || 'bg-gray-100 text-gray-600'}`}>
                    {DIFF_CONFIG[e.difficulty]?.label || e.difficulty}
                  </span>
                )
              },
              {
                label: 'Trạng thái', value: (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[e.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_CONFIG[e.status]?.label || e.status}
                  </span>
                )
              },
              { label: 'Thời gian', value: `${e.duration} phút` },
              { label: 'Tổng điểm', value: e.totalPoints },
              { label: 'Số câu hỏi', value: e.questions?.length || 0 },
              { label: 'Học sinh', value: e.students || 0 },
              { label: 'Đã nộp', value: e.submitted || 0 },
              { label: 'Ngày tạo', value: formatDate(e.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <div className="text-sm font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Questions preview */}
          {full && full.questions?.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
              >
                <span>Danh sách câu hỏi ({full.questions.length})</span>
                {showQuestions ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
              {showQuestions && (
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {full.questions.map((q, i) => (
                    <div key={i} className="px-4 py-3">
                      <p className="text-sm text-gray-800 font-medium">
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        {q.question}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {q.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                        <span className="text-xs text-gray-400">• {q.points || 1} điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <FiLoader className="animate-spin text-gray-400" size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────

const StatCard = ({ label, value, color, sub }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100">
    <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, published: 0, completed: 0 });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [detailExam, setDetailExam] = useState(null);

  // Fetch teachers list for filter dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/users?role=teacher`, { headers: authHeader() });
        const data = await res.json();
        if (data.success) setTeachers(data.users);
      } catch (_) {}
    };
    load();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/exams/stats`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (_) {}
  }, []);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (search) params.append('search', search);
      if (teacherFilter !== 'all') params.append('teacherId', teacherFilter);

      const res = await fetch(`${API_BASE}/exams?${params}`, { headers: authHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách');
      setExams(data.exams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, teacherFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchExams(); }, [fetchExams]);

  const tabs = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'published', label: 'Đang mở', count: stats.published },
    { key: 'draft', label: 'Nháp', count: stats.draft },
    { key: 'completed', label: 'Đã xong', count: stats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Quản lý bài kiểm tra</h1>
        <p className="text-gray-600 mt-1">Xem toàn bộ đề thi trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng đề thi" value={stats.total} color="text-gray-800" />
        <StatCard label="Đang mở" value={stats.published} color="text-blue-600" />
        <StatCard label="Nháp" value={stats.draft} color="text-gray-500" />
        <StatCard label="Đã xong" value={stats.completed} color="text-emerald-600" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 px-4 pt-4 gap-1 flex-wrap">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, môn học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Teacher filter */}
          <div className="relative">
            <IoSchoolOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả giáo viên</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <FiLoader className="animate-spin" size={24} />
              <span>Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 gap-3 text-red-500">
              <p>{error}</p>
              <button onClick={fetchExams} className="text-sm text-indigo-600 underline">Thử lại</button>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <IoDocumentTextOutline size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Không có đề thi nào</p>
              {(search || teacherFilter !== 'all') && (
                <p className="text-sm mt-1">Thử thay đổi bộ lọc</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Đề thi', 'Giáo viên', 'Loại & Độ khó', 'Câu hỏi', 'Học sinh', 'Trạng thái', 'Ngày tạo', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap last:text-right"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                    {/* Title + Subject */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MdOutlineQuiz className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{exam.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{exam.subject}</p>
                        </div>
                      </div>
                    </td>

                    {/* Teacher */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {exam.teacher?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{exam.teacher?.name || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type & Difficulty */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">{TYPE_LABEL[exam.type] || exam.type}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${DIFF_CONFIG[exam.difficulty]?.cls || 'bg-gray-100 text-gray-600'}`}>
                          {DIFF_CONFIG[exam.difficulty]?.label || exam.difficulty}
                        </span>
                      </div>
                    </td>

                    {/* Questions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <FiFileText size={14} className="text-gray-400" />
                        <span className="text-sm font-medium">{exam.questions?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 mt-0.5">
                        <FiClock size={12} />
                        <span className="text-xs">{exam.duration} phút</span>
                      </div>
                    </td>

                    {/* Students */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <FiUsers size={14} className="text-gray-400" />
                        <span className="text-sm font-medium">{exam.students || 0}</span>
                      </div>
                      {exam.students > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {exam.submitted || 0} đã nộp
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[exam.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_CONFIG[exam.status]?.label || exam.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(exam.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDetailExam(exam)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && exams.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            Hiển thị {exams.length} đề thi
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailExam && (
        <DetailModal exam={detailExam} onClose={() => setDetailExam(null)} />
      )}
    </div>
  );
};

export default AdminExams;
