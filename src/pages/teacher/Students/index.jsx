import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FiSearch,
  FiGrid,
  FiList,
  FiPlus,
  FiDownload,
  FiUpload,
  FiAward,
  FiTrendingUp,
  FiLoader,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiFile,
  FiCalendar,
  FiEdit3,
  FiSave,
} from 'react-icons/fi';
import {
  IoPersonOutline,
  IoSchoolOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

import StudentCard from './StudentCard';
import StudentTable from './StudentTable';
import AddStudentModal from './AddStudentModal';
import StudentDetailModal from './StudentDetailModal';

const API_URL = '/api/students';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const TeacherStudents = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [students, setStudents] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [classes, setClasses] = useState([{ id: 'all', name: 'Tất cả', count: 0 }]);
  const [loading, setLoading] = useState(true);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Semester settings
  const [semesterStartDate, setSemesterStartDate] = useState('');
  const [editingSemester, setEditingSemester] = useState(false);
  const [semesterInput, setSemesterInput] = useState('');
  const [semesterSaving, setSemesterSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'all') params.append('className', selectedClass);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_URL}?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  }, [selectedClass, selectedStatus, searchQuery]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.semesterStartDate) {
        const dateStr = new Date(data.semesterStartDate).toISOString().split('T')[0];
        setSemesterStartDate(dateStr);
        setSemesterInput(dateStr);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const handleSaveSemester = async () => {
    setSemesterSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ semesterStartDate: semesterInput || null }),
      });
      const data = await res.json();
      if (data.success) {
        const dateStr = data.semesterStartDate
          ? new Date(data.semesterStartDate).toISOString().split('T')[0]
          : '';
        setSemesterStartDate(dateStr);
        setSemesterInput(dateStr);
        setEditingSemester(false);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
    setSemesterSaving(false);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStatsData(data.stats);
        const classItems = [
          { id: 'all', name: 'Tất cả', count: data.stats.total },
          ...data.stats.classes.map((c) => ({ id: c.name, name: c.name, count: c.count })),
        ];
        setClasses(classItems);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchStats(), fetchSettings()]);
      setLoading(false);
    };
    load();
  }, [fetchStudents, fetchStats, fetchSettings]);

  const refreshData = async () => {
    await Promise.all([fetchStudents(), fetchStats()]);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshData();
        if (showDetailModal) setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // --- Export ---
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'all') params.append('className', selectedClass);

      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danh_sach_hoc_sinh${selectedClass !== 'all' ? '_' + selectedClass : ''}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Có lỗi khi xuất file. Vui lòng thử lại.');
    }
    setExportLoading(false);
  };

  // --- Import ---
  const parseCSV = (text) => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const headerMap = {
      'Họ tên': 'name',
      'Giới tính': 'gender',
      'Ngày sinh': 'dateOfBirth',
      'Lớp': 'className',
      'Email': 'email',
      'SĐT': 'phone',
      'Địa chỉ': 'address',
      'Phụ huynh': 'parentName',
      'SĐT phụ huynh': 'parentPhone',
      'Trạng thái': 'status',
      'Ghi chú': 'notes',
    };

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, idx) => {
        const key = headerMap[header] || header;
        row[key] = values[idx] || '';
      });

      if (row.name && row.email) {
        rows.push(row);
      }
    }

    return rows;
  };

  const parseExcel = (buffer) => {
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (raw.length < 2) return [];

    const headers = raw[0].map((h) => String(h).trim());
    const headerMap = {
      'Họ tên': 'name',
      'Giới tính': 'gender',
      'Ngày sinh': 'dateOfBirth',
      'Lớp': 'className',
      'Email': 'email',
      'SĐT': 'phone',
      'Địa chỉ': 'address',
      'Phụ huynh': 'parentName',
      'SĐT phụ huynh': 'parentPhone',
      'Ghi chú': 'notes',
    };

    const rows = [];
    for (let i = 1; i < raw.length; i++) {
      const values = raw[i];
      if (!values || values.length === 0) continue;

      const row = {};
      headers.forEach((header, idx) => {
        const key = headerMap[header] || header;
        row[key] = values[idx] != null ? String(values[idx]).trim() : '';
      });

      if (row.name && row.email) {
        rows.push(row);
      }
    }
    return rows;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);

    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (evt) => {
      if (isExcel) {
        const parsed = parseExcel(evt.target.result);
        setImportData(parsed);
      } else {
        const parsed = parseCSV(evt.target.result);
        setImportData(parsed);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const res = await fetch(`${API_URL}/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ students: importData }),
      });
      const data = await res.json();

      if (data.success) {
        setImportResult(data.results);
        await refreshData();
      } else {
        setImportResult({ success: 0, failed: importData.length, errors: [data.message] });
      }
    } catch {
      setImportResult({ success: 0, failed: importData.length, errors: ['Lỗi kết nối server'] });
    }
    setImportLoading(false);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Họ tên', 'Giới tính', 'Ngày sinh', 'Lớp', 'Email', 'SĐT', 'Địa chỉ', 'Phụ huynh', 'SĐT phụ huynh', 'Ghi chú'];
    const examples = [
      ['Nguyễn Văn A', 'Nam', '2010-05-15', 'Lớp 10A1', 'nguyenvana@email.com', '0912345678', 'Hà Nội', 'Nguyễn Văn B', '0987654321', 'Học sinh giỏi'],
      ['Trần Thị B', 'Nữ', '2010-08-20', 'Lớp 10A1; Lớp 10A2', 'tranthib@email.com', '0923456789', 'Tuyên Quang', 'Trần Văn C', '0976543210', 'Học 2 lớp'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);

    ws['!cols'] = [
      { wch: 25 },  // Họ tên
      { wch: 10 },  // Giới tính
      { wch: 14 },  // Ngày sinh
      { wch: 14 },  // Lớp
      { wch: 28 },  // Email
      { wch: 14 },  // SĐT
      { wch: 25 },  // Địa chỉ
      { wch: 22 },  // Phụ huynh
      { wch: 14 },  // SĐT phụ huynh
      { wch: 25 },  // Ghi chú
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu nhập học sinh');
    XLSX.writeFile(wb, 'mau_nhap_hoc_sinh.xlsx');
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportData([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stats = [
    {
      label: 'Tổng học sinh',
      value: statsData?.total ?? '-',
      icon: IoPersonOutline,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Học sinh xuất sắc',
      value: statsData?.excellent ?? '-',
      icon: FiAward,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Điểm TB chung',
      value: statsData?.avgScore ?? '-',
      icon: FiTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Tỷ lệ đi học',
      value: statsData ? `${statsData.avgAttendance}%` : '-',
      icon: IoCheckmarkCircleOutline,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý học sinh</h1>
          <p className="text-gray-600">Theo dõi và quản lý thông tin học sinh</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <FiUpload className="w-4 h-4" />
            <span>Nhập từ file</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {exportLoading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiDownload className="w-4 h-4" />
            )}
            <span>Tải về Excel</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
          >
            <FiPlus className="w-5 h-5" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
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
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Semester Start Date */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiCalendar className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Ngày đầu học kỳ (dùng tính tỷ lệ đi học)</p>
          {editingSemester ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="date"
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveSemester}
                disabled={semesterSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {semesterSaving ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiSave className="w-3.5 h-3.5" />}
                Lưu
              </button>
              <button
                onClick={() => { setEditingSemester(false); setSemesterInput(semesterStartDate); }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">
                {semesterStartDate
                  ? new Date(semesterStartDate).toLocaleDateString('vi-VN')
                  : 'Chưa đặt'}
              </span>
              <button
                onClick={() => setEditingSemester(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiEdit3 className="w-3 h-3" />
                {semesterStartDate ? 'Sửa' : 'Đặt ngày'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh theo tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Nghỉ học</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Class Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {classes.map((classItem) => {
            const isActive = selectedClass === classItem.id;
            return (
              <button
                key={classItem.id}
                onClick={() => setSelectedClass(classItem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <IoSchoolOutline className="w-4 h-4" />
                <span>{classItem.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-100' : 'bg-gray-200'
                  }`}
                >
                  {classItem.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Students Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((student) => (
            <StudentCard key={student._id} student={student} onClick={handleViewDetail} />
          ))}
        </div>
      ) : (
        <StudentTable
          students={students}
          onViewDetail={handleViewDetail}
          onDelete={handleDeleteStudent}
        />
      )}

      {/* Empty State */}
      {students.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoPersonOutline className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy học sinh</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc thêm học sinh mới</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('all');
              setSelectedStatus('all');
            }}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        classes={classes}
        onSuccess={refreshData}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        show={showDetailModal}
        student={selectedStudent}
        onClose={() => setShowDetailModal(false)}
        onDelete={handleDeleteStudent}
        onUpdate={refreshData}
        classes={classes}
        semesterStartDate={semesterStartDate}
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Nhập học sinh từ file</h2>
              <button
                onClick={closeImportModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Download template */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FiFile className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">File mẫu Excel</p>
                  <p className="text-xs text-blue-600 mb-2">
                    Tải file mẫu để xem định dạng đúng. Các cột bắt buộc: Họ tên, Giới tính, Ngày sinh, Lớp, Email. Nhiều lớp phân cách bằng dấu chấm phẩy (;).
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    Tải file mẫu
                  </button>
                </div>
              </div>
            </div>

            {/* File upload */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-center group"
              >
                <FiUpload className="w-10 h-10 text-gray-400 group-hover:text-emerald-500 mx-auto mb-3 transition-colors" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
                  {importFile ? importFile.name : 'Nhấn để chọn file CSV'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ file .xlsx, .xls, .csv</p>
              </button>
            </div>

            {/* Preview */}
            {importData.length > 0 && !importResult && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Xem trước ({importData.length} học sinh)
                </h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Họ tên</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Lớp</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Giới tính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">{row.name}</td>
                          <td className="px-3 py-2 text-gray-600">{row.className}</td>
                          <td className="px-3 py-2 text-gray-600">{row.email}</td>
                          <td className="px-3 py-2 text-gray-600">{row.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import result */}
            {importResult && (
              <div className="mb-6 space-y-3">
                {importResult.success > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-700">
                      Nhập thành công <span className="font-bold">{importResult.success}</span> học sinh
                    </p>
                  </div>
                )}
                {importResult.failed > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        Thất bại <span className="font-bold">{importResult.failed}</span> dòng
                      </p>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto">
                        {importResult.errors.map((err, idx) => (
                          <p key={idx} className="text-xs text-red-600 mt-1">- {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeImportModal}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
              >
                {importResult ? 'Đóng' : 'Hủy'}
              </button>
              {!importResult && (
                <button
                  onClick={handleImport}
                  disabled={importData.length === 0 || importLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {importLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Đang nhập...
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      Nhập {importData.length > 0 ? `${importData.length} học sinh` : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
