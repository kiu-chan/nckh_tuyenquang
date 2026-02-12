import React, { useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit2,
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
  FiStar,
  FiAward,
  FiTrendingUp,
  FiBookOpen
} from 'react-icons/fi';
import {
  IoPersonOutline,
  IoSchoolOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';

const TeacherStudents = () => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const classes = [
    { id: 'all', name: 'Tất cả', count: 156, color: 'gray' },
    { id: '10a1', name: 'Lớp 10A1', count: 42, color: 'blue' },
    { id: '10a2', name: 'Lớp 10A2', count: 38, color: 'green' },
    { id: '10a3', name: 'Lớp 10A3', count: 40, color: 'purple' },
    { id: '11a1', name: 'Lớp 11A1', count: 36, color: 'orange' },
  ];

  const students = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      class: '10a1',
      email: 'nguyenvanan@gmail.com',
      phone: '0912345678',
      avatar: null,
      status: 'active',
      score: 8.5,
      attendance: 95,
      assignments: { completed: 24, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '15/03/2008',
      gender: 'Nam',
      parentName: 'Nguyễn Văn B',
      parentPhone: '0987654321',
      notes: 'Học sinh chăm chỉ, tích cực tham gia các hoạt động'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      class: '10a1',
      email: 'tranthibinh@gmail.com',
      phone: '0923456789',
      avatar: null,
      status: 'active',
      score: 9.2,
      attendance: 98,
      assignments: { completed: 26, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '22/05/2008',
      gender: 'Nữ',
      parentName: 'Trần Văn C',
      parentPhone: '0976543210',
      notes: 'Học sinh xuất sắc, luôn hoàn thành bài tập đúng hạn'
    },
    {
      id: 3,
      name: 'Lê Minh Châu',
      class: '10a2',
      email: 'leminhchau@gmail.com',
      phone: '0934567890',
      avatar: null,
      status: 'active',
      score: 7.8,
      attendance: 88,
      assignments: { completed: 22, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '10/08/2008',
      gender: 'Nữ',
      parentName: 'Lê Văn D',
      parentPhone: '0965432109',
      notes: 'Cần cải thiện về mặt điểm danh'
    },
    {
      id: 4,
      name: 'Phạm Quốc Dũng',
      class: '10a2',
      email: 'phamquocdung@gmail.com',
      phone: '0945678901',
      avatar: null,
      status: 'active',
      score: 8.9,
      attendance: 92,
      assignments: { completed: 25, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '03/12/2007',
      gender: 'Nam',
      parentName: 'Phạm Văn E',
      parentPhone: '0954321098',
      notes: 'Học sinh giỏi, có tinh thần trách nhiệm cao'
    },
    {
      id: 5,
      name: 'Hoàng Thu Hà',
      class: '10a3',
      email: 'hoangthuha@gmail.com',
      phone: '0956789012',
      avatar: null,
      status: 'inactive',
      score: 6.5,
      attendance: 75,
      assignments: { completed: 18, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '28/09/2008',
      gender: 'Nữ',
      parentName: 'Hoàng Văn F',
      parentPhone: '0943210987',
      notes: 'Nghỉ học nhiều, cần liên hệ phụ huynh'
    },
    {
      id: 6,
      name: 'Vũ Đức Kiên',
      class: '10a3',
      email: 'vuduckien@gmail.com',
      phone: '0967890123',
      avatar: null,
      status: 'active',
      score: 8.1,
      attendance: 90,
      assignments: { completed: 23, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '17/06/2008',
      gender: 'Nam',
      parentName: 'Vũ Văn G',
      parentPhone: '0932109876',
      notes: 'Học sinh khá, có khả năng phát triển tốt'
    },
    {
      id: 7,
      name: 'Đặng Thị Linh',
      class: '11a1',
      email: 'dangthilinh@gmail.com',
      phone: '0978901234',
      avatar: null,
      status: 'active',
      score: 9.5,
      attendance: 99,
      assignments: { completed: 26, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '05/01/2007',
      gender: 'Nữ',
      parentName: 'Đặng Văn H',
      parentPhone: '0921098765',
      notes: 'Học sinh xuất sắc nhất lớp, luôn đạt thành tích cao'
    },
    {
      id: 8,
      name: 'Bùi Văn Minh',
      class: '11a1',
      email: 'buivanminh@gmail.com',
      phone: '0989012345',
      avatar: null,
      status: 'active',
      score: 7.2,
      attendance: 85,
      assignments: { completed: 21, total: 26 },
      address: 'Hà Nội',
      dateOfBirth: '12/11/2007',
      gender: 'Nam',
      parentName: 'Bùi Văn I',
      parentPhone: '0910987654',
      notes: 'Học sinh trung bình, cần động viên thêm'
    },
  ];

  const stats = [
    {
      label: 'Tổng học sinh',
      value: '156',
      change: '+12',
      icon: IoPersonOutline,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Học sinh xuất sắc',
      value: '42',
      change: '+5',
      icon: FiAward,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Điểm TB chung',
      value: '8.2',
      change: '+0.3',
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Tỷ lệ đi học',
      value: '92%',
      change: '+2%',
      icon: IoCheckmarkCircleOutline,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesStatus && matchesSearch;
  });

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

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

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
                <span className="text-sm font-medium text-emerald-600">{stat.change}</span>
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
          {/* Search */}
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="inactive">Nghỉ học</option>
          </select>

          {/* View Mode */}
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100' : 'bg-gray-200'
                }`}>
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
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              onClick={() => handleViewDetail(student)}
            >
              {/* Header */}
              <div className="relative h-24 bg-gradient-to-br from-emerald-400 to-teal-500">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {student.name.charAt(0)}
                    </div>
                  </div>
                </div>
                {/* Status Badge */}
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

              {/* Info */}
              <div className="pt-12 p-4">
                <h3 className="font-bold text-gray-800 text-center mb-1 truncate">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  {classes.find(c => c.id === student.class)?.name}
                </p>

                {/* Stats */}
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

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Hoàn thành bài tập</span>
                    <span className="font-medium">
                      {student.assignments.completed}/{student.assignments.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${(student.assignments.completed / student.assignments.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiMail className="w-3 h-3" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiPhone className="w-3 h-3" />
                    <span>{student.phone}</span>
                  </div>
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
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
                      {classes.find(c => c.id === student.class)?.name}
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
                      {student.assignments.completed}/{student.assignments.total}
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
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Chỉnh sửa">
                        <FiEdit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Xóa">
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
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoPersonOutline className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy học sinh</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Nam</option>
                    <option>Nữ</option>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lớp <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {classes.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-4">Thông tin phụ huynh</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên phụ huynh
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nhập họ tên phụ huynh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SĐT phụ huynh
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0987654321"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows="3"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  Thêm học sinh
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
            {/* Header */}
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

            {/* Content */}
            <div className="pt-20 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedStudent.name}</h2>
                  <p className="text-gray-600">
                    {classes.find(c => c.id === selectedStudent.class)?.name} • {selectedStudent.gender}
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

              {/* Stats */}
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
                    {selectedStudent.assignments.completed}/{selectedStudent.assignments.total}
                  </div>
                  <div className="text-sm text-gray-600">Bài tập hoàn thành</div>
                </div>
              </div>

              {/* Info Sections */}
              <div className="space-y-6">
                {/* Personal Info */}
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
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">SĐT:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Ngày sinh:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.dateOfBirth}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Địa chỉ:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>

                {/* Parent Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <IoPersonOutline className="w-5 h-5" />
                    Thông tin phụ huynh
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <IoPersonOutline className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Họ tên:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.parentName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">SĐT:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedStudent.parentPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedStudent.notes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Ghi chú</h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
                      <p className="text-sm text-gray-700">{selectedStudent.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors">
                  <FiEdit2 className="w-4 h-4" />
                  Chỉnh sửa
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
