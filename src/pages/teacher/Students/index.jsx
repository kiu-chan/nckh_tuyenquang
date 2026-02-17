import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch,
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGrid,
  FiList,
  FiPlus,
  FiX,
  FiDownload,
  FiUpload,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiLoader,
  FiCheck,
  FiUserPlus,
} from 'react-icons/fi';
import {
  IoPersonOutline,
  IoSchoolOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';

const API_URL = '/api/students';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const initialFormData = {
  name: '',
  gender: 'Nam',
  dateOfBirth: '',
  className: '',
  email: '',
  phone: '',
  address: '',
  parentName: '',
  parentPhone: '',
  notes: '',
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
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'exists' | 'new'
  const [emailUser, setEmailUser] = useState(null);
  const emailTimerRef = useRef(null);
  const [isNewClass, setIsNewClass] = useState(false);

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
      await Promise.all([fetchStudents(), fetchStats()]);
      setLoading(false);
    };
    load();
  }, [fetchStudents, fetchStats]);

  const checkEmail = useCallback(async (email) => {
    if (!email || !email.includes('@')) {
      setEmailStatus(null);
      setEmailUser(null);
      return;
    }
    setEmailStatus('checking');
    try {
      const res = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        if (data.exists) {
          setEmailStatus('exists');
          setEmailUser(data.user);
          // Tự động điền tên nếu chưa nhập
          setFormData((prev) => prev.name ? prev : { ...prev, name: data.user.name });
        } else {
          setEmailStatus('new');
          setEmailUser(null);
        }
      }
    } catch {
      setEmailStatus(null);
    }
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Debounce check email khi nhập email
    if (name === 'email') {
      clearTimeout(emailTimerRef.current);
      emailTimerRef.current = setTimeout(() => checkEmail(value), 500);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra');
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setFormData(initialFormData);
      await Promise.all([fetchStudents(), fetchStats()]);
    } catch (err) {
      setError('Lỗi kết nối server');
    }
    setSubmitting(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await Promise.all([fetchStudents(), fetchStats()]);
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

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-emerald-600 bg-emerald-50';
    if (score >= 7) return 'text-blue-600 bg-blue-50';
    if (score >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return 'text-emerald-600';
    if (attendance >= 85) return 'text-blue-600';
    if (attendance >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
            <FiUpload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
            <FiDownload className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setError('');
              setEmailStatus(null);
              setEmailUser(null);
              setIsNewClass(false);
              setShowAddModal(true);
            }}
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
            <div
              key={student._id}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              onClick={() => handleViewDetail(student)}
            >
              <div className="relative h-24 bg-gradient-to-br from-emerald-400 to-teal-500">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {student.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  {student.status === 'active' ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                      <IoCheckmarkCircleOutline className="w-3 h-3" />
                      <span>Đang học</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                      <IoCloseCircleOutline className="w-3 h-3" />
                      <span>Nghỉ học</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-12 p-4">
                <h3 className="font-bold text-gray-800 text-center mb-1 truncate">{student.name}</h3>
                <p className="text-sm text-gray-500 text-center mb-4">{student.className}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(student.score)} rounded-lg py-1`}>
                      {student.score}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Điểm TB</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Đi học</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Hoàn thành bài tập</span>
                    <span className="font-medium">
                      {student.assignmentsCompleted}/{student.assignmentsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${student.assignmentsTotal > 0 ? (student.assignmentsCompleted / student.assignmentsTotal) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiMail className="w-3 h-3" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FiPhone className="w-3 h-3" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học sinh</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lớp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Điểm TB</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Đi học</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Bài tập</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {student.className}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg font-bold ${getScoreColor(student.score)}`}>
                        {student.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-center font-bold ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center text-sm text-gray-600">
                      {student.assignmentsCompleted}/{student.assignmentsTotal}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {student.status === 'active' ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                          <IoCheckmarkCircleOutline className="w-3 h-3" />
                          Đang học
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                          <IoCloseCircleOutline className="w-3 h-3" />
                          Nghỉ học
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(student)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <FiBookOpen className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudent(student._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Thêm học sinh mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lớp <span className="text-red-500">*</span>
                  </label>
                  {!isNewClass ? (
                    <select
                      name="className"
                      value={formData.className}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setIsNewClass(true);
                          setFormData((prev) => ({ ...prev, className: '' }));
                        } else {
                          handleFormChange(e);
                        }
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Chọn lớp --</option>
                      {classes
                        .filter((c) => c.id !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.count} HS)
                          </option>
                        ))}
                      <option value="__new__">+ Tạo lớp mới...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="className"
                        value={formData.className}
                        onChange={handleFormChange}
                        required
                        autoFocus
                        className="flex-1 px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="VD: Lớp 10A1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewClass(false);
                          setFormData((prev) => ({ ...prev, className: '' }));
                        }}
                        className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
                        title="Quay lại chọn lớp"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 ${
                      emailStatus === 'exists'
                        ? 'border-emerald-400 focus:ring-emerald-500'
                        : emailStatus === 'new'
                        ? 'border-blue-400 focus:ring-blue-500'
                        : 'border-gray-200 focus:ring-emerald-500'
                    }`}
                    placeholder="Nhập email học sinh..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && (
                      <FiLoader className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {emailStatus === 'exists' && (
                      <FiCheck className="w-5 h-5 text-emerald-500" />
                    )}
                    {emailStatus === 'new' && (
                      <FiUserPlus className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
                {/* Email status message */}
                {emailStatus === 'exists' && emailUser && (
                  <div className="mt-2 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FiCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="text-emerald-700">Tài khoản đã tồn tại: </span>
                      <span className="font-medium text-emerald-800">{emailUser.name}</span>
                      <span className="text-emerald-600"> ({emailUser.role === 'student' ? 'Học sinh' : emailUser.role})</span>
                    </div>
                  </div>
                )}
                {emailStatus === 'new' && (
                  <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FiUserPlus className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Email chưa có tài khoản. Hệ thống sẽ <span className="font-medium">tự động tạo tài khoản mới</span> khi thêm học sinh.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-4">Thông tin phụ huynh</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên phụ huynh</label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nhập họ tên phụ huynh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SĐT phụ huynh</label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0987654321"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  rows="3"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập ghi chú về học sinh..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Đang thêm...' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-32 bg-gradient-to-br from-emerald-400 to-teal-500">
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                    {selectedStudent.name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedStudent.name}</h2>
                  <p className="text-gray-600">
                    {selectedStudent.className} &bull; {selectedStudent.gender}
                  </p>
                </div>
                {selectedStudent.status === 'active' ? (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full">
                    <IoCheckmarkCircleOutline className="w-4 h-4" />
                    Đang học
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                    <IoCloseCircleOutline className="w-4 h-4" />
                    Nghỉ học
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{selectedStudent.score}</div>
                  <div className="text-sm text-gray-600">Điểm trung bình</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{selectedStudent.attendance}%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ đi học</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {selectedStudent.assignmentsCompleted}/{selectedStudent.assignmentsTotal}
                  </div>
                  <div className="text-sm text-gray-600">Bài tập hoàn thành</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <IoPersonOutline className="w-5 h-5" />
                    Thông tin cá nhân
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.email}</span>
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">SĐT:</span>
                        <span className="text-sm font-medium text-gray-800">{selectedStudent.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Ngày sinh:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.dateOfBirth}</span>
                    </div>
                    {selectedStudent.address && (
                      <div className="flex items-center gap-3">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Địa chỉ:</span>
                        <span className="text-sm font-medium text-gray-800">{selectedStudent.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedStudent.parentName || selectedStudent.parentPhone) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <IoPersonOutline className="w-5 h-5" />
                      Thông tin phụ huynh
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {selectedStudent.parentName && (
                        <div className="flex items-center gap-3">
                          <IoPersonOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Họ tên:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedStudent.parentName}</span>
                        </div>
                      )}
                      {selectedStudent.parentPhone && (
                        <div className="flex items-center gap-3">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">SĐT:</span>
                          <span className="text-sm font-medium text-gray-800">{selectedStudent.parentPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedStudent.notes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Ghi chú</h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
                      <p className="text-sm text-gray-700">{selectedStudent.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    handleDeleteStudent(selectedStudent._id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Xóa
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                  <FiMail className="w-4 h-4" />
                  Gửi email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
