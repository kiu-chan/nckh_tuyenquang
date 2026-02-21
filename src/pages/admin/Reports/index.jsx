import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiLoader,
  FiRefreshCw,
  FiFileText,
  FiBook,
} from 'react-icons/fi';
import {
  IoSchoolOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';
import { MdOutlineQuiz } from 'react-icons/md';

const API_BASE = '/api/admin';
const getToken = () => localStorage.getItem('authToken');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Helpers ──────────────────────────────────────────────────

const TYPE_LABEL = {
  'multiple-choice': 'Trắc nghiệm',
  essay: 'Tự luận',
  mixed: 'Hỗn hợp',
};

// ─── Sub-components ───────────────────────────────────────────

// Card thống kê tổng
const OverviewCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value.toLocaleString('vi-VN')}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// Thanh tiến trình ngang
const BarRow = ({ label, count, total, colorCls, badge }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium truncate mr-2">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{count}</span>
          )}
          {!badge && <span className="text-gray-500 text-xs">{count}</span>}
          <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorCls} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// Biểu đồ cột đơn giản (thuần Tailwind)
const BarChart = ({ data, valueKey, colorCls, labelKey = 'label', maxLabel = '' }) => {
  const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const h = Math.round((d[valueKey] / maxVal) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs text-gray-500 font-medium">{d[valueKey] || ''}</span>
            <div className="w-full flex items-end" style={{ height: '90px' }}>
              <div
                className={`w-full ${colorCls} rounded-t-md transition-all duration-500`}
                style={{ height: `${Math.max(h, d[valueKey] > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};

// Biểu đồ cột đôi (giáo viên + học sinh)
const DoubleBarChart = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.teachers, d.students]), 1);
  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full flex items-end gap-0.5" style={{ height: '120px' }}>
            {/* teachers bar */}
            <div className="flex-1 flex items-end">
              <div
                className="w-full bg-emerald-400 rounded-t-sm"
                style={{ height: `${Math.max(Math.round((d.teachers / maxVal) * 100), d.teachers > 0 ? 3 : 0)}%` }}
                title={`GV: ${d.teachers}`}
              />
            </div>
            {/* students bar */}
            <div className="flex-1 flex items-end">
              <div
                className="w-full bg-blue-400 rounded-t-sm"
                style={{ height: `${Math.max(Math.round((d.students / maxVal) * 100), d.students > 0 ? 3 : 0)}%` }}
                title={`HS: ${d.students}`}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/reports`, { headers: authHeader() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Không thể tải báo cáo');
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <FiLoader className="animate-spin" size={32} />
        <p>Đang tải báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
        >
          <FiRefreshCw size={14} /> Thử lại
        </button>
      </div>
    );
  }

  const {
    overview,
    examByStatus,
    examByType,
    topSubjects,
    topTeachers,
    userGrowth,
    examGrowth,
    submissionByStatus,
  } = data;

  const totalExamStatus = Object.values(examByStatus).reduce((a, b) => a + b, 0);
  const totalSubjects = topSubjects.reduce((a, b) => a + b.count, 0);
  const totalSubmissions = Object.values(submissionByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động toàn hệ thống</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw size={15} />
          Làm mới
        </button>
      </div>

      {/* ── Tổng quan ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard icon={FiUsers} label="Tổng người dùng" value={overview.totalUsers}
          color="text-indigo-600" bgColor="bg-indigo-50" />
        <OverviewCard icon={IoSchoolOutline} label="Giáo viên" value={overview.totalTeachers}
          color="text-emerald-600" bgColor="bg-emerald-50" />
        <OverviewCard icon={FiBook} label="Học sinh" value={overview.totalStudentAccounts}
          color="text-blue-600" bgColor="bg-blue-50" />
        <OverviewCard icon={MdOutlineQuiz} label="Tổng đề thi" value={overview.totalExams}
          color="text-purple-600" bgColor="bg-purple-50" />
        <OverviewCard icon={IoGameControllerOutline} label="Trò chơi" value={overview.totalGames}
          color="text-orange-600" bgColor="bg-orange-50" />
        <OverviewCard icon={IoDocumentTextOutline} label="Tài liệu" value={overview.totalDocuments}
          color="text-pink-600" bgColor="bg-pink-50" />
        <OverviewCard icon={FiFileText} label="Tóm tắt" value={overview.totalNotebooks}
          color="text-cyan-600" bgColor="bg-cyan-50" />
        <OverviewCard icon={IoStatsChartOutline} label="Bài đã nộp" value={overview.totalSubmissions}
          color="text-teal-600" bgColor="bg-teal-50" />
      </div>

      {/* ── Hàng 2: Biểu đồ tăng trưởng ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tài khoản mới theo tháng */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Tài khoản mới theo tháng</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Giáo viên
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Học sinh
              </span>
            </div>
          </div>
          <DoubleBarChart data={userGrowth} />
        </div>

        {/* Đề thi tạo theo tháng */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Đề thi tạo mới theo tháng</h2>
          <BarChart data={examGrowth} valueKey="count" colorCls="bg-indigo-400" />
        </div>
      </div>

      {/* ── Hàng 3: Phân tích đề thi + bài nộp ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trạng thái đề thi */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Trạng thái đề thi</h2>
          <div className="space-y-4">
            <BarRow
              label="Đang mở"
              count={examByStatus.published}
              total={totalExamStatus}
              colorCls="bg-blue-500"
              badge="bg-blue-100 text-blue-700"
            />
            <BarRow
              label="Nháp"
              count={examByStatus.draft}
              total={totalExamStatus}
              colorCls="bg-gray-400"
              badge="bg-gray-100 text-gray-600"
            />
            <BarRow
              label="Đã xong"
              count={examByStatus.completed}
              total={totalExamStatus}
              colorCls="bg-emerald-500"
              badge="bg-emerald-100 text-emerald-700"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Loại đề thi</h3>
            <div className="space-y-3">
              {Object.entries(examByType).map(([type, count]) => (
                <BarRow
                  key={type}
                  label={TYPE_LABEL[type] || type}
                  count={count}
                  total={totalExamStatus}
                  colorCls="bg-purple-400"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top môn học */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Môn học phổ biến</h2>
          {topSubjects.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-4">
              {topSubjects.map((s, i) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-300 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <BarRow
                      label={s.subject}
                      count={s.count}
                      total={totalSubjects}
                      colorCls={['bg-yellow-400', 'bg-gray-400', 'bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-purple-400'][i] || 'bg-blue-400'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bài nộp */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Kết quả bài nộp</h2>
          <div className="space-y-4">
            <BarRow
              label="Đã chấm điểm"
              count={submissionByStatus.graded}
              total={totalSubmissions}
              colorCls="bg-emerald-500"
              badge="bg-emerald-100 text-emerald-700"
            />
            <BarRow
              label="Chờ chấm"
              count={submissionByStatus.submitted}
              total={totalSubmissions}
              colorCls="bg-blue-500"
              badge="bg-blue-100 text-blue-700"
            />
            <BarRow
              label="Đang làm"
              count={submissionByStatus.in_progress}
              total={totalSubmissions}
              colorCls="bg-yellow-400"
              badge="bg-yellow-100 text-yellow-700"
            />
          </div>

          {/* Tóm tắt số */}
          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{totalSubmissions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tổng bài nộp</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {totalSubmissions > 0
                  ? Math.round((submissionByStatus.graded / totalSubmissions) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Tỷ lệ chấm xong</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hàng 4: Top giáo viên ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          Giáo viên hoạt động nhiều nhất
          <span className="text-sm text-gray-400 font-normal ml-2">(theo số đề thi tạo ra)</span>
        </h2>
        {topTeachers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topTeachers.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {/* Rank + Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold border-2 border-white ${
                    i === 0 ? 'bg-yellow-400 text-white' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-300 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>{i + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 truncate">{t.email}</p>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">
                    {t.examCount} đề thi
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Hàng 5: Tỷ lệ tài nguyên ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Tài nguyên hệ thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Đề thi', value: overview.totalExams, icon: MdOutlineQuiz, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Trò chơi', value: overview.totalGames, icon: IoGameControllerOutline, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Tài liệu', value: overview.totalDocuments, icon: IoDocumentTextOutline, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Tóm tắt AI', value: overview.totalNotebooks, icon: FiFileText, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => {
            const total = overview.totalExams + overview.totalGames + overview.totalDocuments + overview.totalNotebooks;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={label} className="text-center">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500 mb-2">{label}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% tổng tài nguyên</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
