import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiEye,
  FiEyeOff,
  FiLoader,
} from 'react-icons/fi';
import { IoSchoolOutline } from 'react-icons/io5';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';

const API_BASE = '/api/admin';

const getToken = () => localStorage.getItem('authToken');

const roleLabel = {
  teacher: 'Giáo viên',
  student: 'Học sinh',
};

const roleColor = {
  teacher: 'bg-emerald-100 text-emerald-700',
  student: 'bg-blue-100 text-blue-700',
};

const avatarColor = {
  teacher: 'from-emerald-500 to-teal-600',
  student: 'from-blue-500 to-indigo-600',
};

// ────────────────────────────────────────────────────────────
// Modal tạo / sửa tài khoản
// ────────────────────────────────────────────────────────────
const UserModal = ({ user, onClose, onSaved }) => {
  const isEdit = Boolean(user);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = { name: form.name, email: form.email, role: form.role };
      if (!isEdit || form.password) body.password = form.password;

      const res = await fetch(
        isEdit ? `${API_BASE}/users/${user.id}` : `${API_BASE}/users`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');

      onSaved(data.user, isEdit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu{' '}
              {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && (
                <span className="text-gray-400 font-normal">(để trống nếu không đổi)</span>
              )}
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required={!isEdit}
                placeholder={isEdit ? '••••••••' : 'Ít nhất 6 ký tự'}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['teacher', 'student'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: r }))}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    form.role === r
                      ? r === 'teacher'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r === 'teacher' ? (
                    <IoSchoolOutline size={18} />
                  ) : (
                    <FiUsers size={18} />
                  )}
                  <span className="font-medium">{roleLabel[r]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lỗi */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <FiLoader className="animate-spin" size={16} />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Modal xác nhận xóa
// ────────────────────────────────────────────────────────────
const DeleteModal = ({ user, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
      onDeleted(user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash2 className="text-red-600 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Xóa tài khoản</h2>
          <p className="text-gray-600 text-sm">
            Bạn có chắc muốn xóa tài khoản của{' '}
            <span className="font-semibold text-gray-800">{user.name}</span>? Hành động này không
            thể hoàn tác.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <FiLoader className="animate-spin" size={16} />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Trang chính
// ────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined=closed, null=create, object=edit
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('role', activeTab);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tải danh sách');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaved = (savedUser, isEdit) => {
    if (isEdit) {
      setUsers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)));
    } else {
      setUsers((prev) => [savedUser, ...prev]);
    }
    setModalUser(undefined);
  };

  const handleDeleted = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteUser(null);
  };

  const counts = {
    all: users.length,
    teacher: users.filter((u) => u.role === 'teacher').length,
    student: users.filter((u) => u.role === 'student').length,
  };

  const tabs = [
    { key: 'all', label: 'Tất cả', icon: MdOutlineAdminPanelSettings },
    { key: 'teacher', label: 'Giáo viên', icon: IoSchoolOutline },
    { key: 'student', label: 'Học sinh', icon: FiUsers },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản giáo viên và học sinh</p>
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <FiPlus size={20} />
          Tạo tài khoản
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-800">{counts.all}</p>
          <p className="text-sm text-gray-500 mt-1">Tổng người dùng</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-emerald-600">{counts.teacher}</p>
          <p className="text-sm text-gray-500 mt-1">Giáo viên</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-3xl font-bold text-blue-600">{counts.student}</p>
          <p className="text-sm text-gray-500 mt-1">Học sinh</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 px-4 pt-4 gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {key === 'all' ? counts.all : key === 'teacher' ? counts.teacher : counts.student}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
              <FiLoader className="animate-spin" size={24} />
              <span>Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 gap-3 text-red-500">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="text-sm text-indigo-600 underline hover:text-indigo-700"
              >
                Thử lại
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <FiUsers size={48} className="mb-3 opacity-30" />
              <p className="font-medium">Không có người dùng nào</p>
              {search && (
                <p className="text-sm mt-1">
                  Không tìm thấy kết quả cho &quot;{search}&quot;
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${
                              avatarColor[user.role] || 'from-gray-400 to-gray-600'
                            } rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          roleColor[user.role] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {roleLabel[user.role] || user.role}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(user.createdAt)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModalUser(user)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && users.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            Hiển thị {users.length} người dùng
          </div>
        )}
      </div>

      {/* Modals */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default AdminUsers;
