import { useState, useRef, useCallback } from 'react';
import {
  FiX,
  FiPlus,
  FiLoader,
  FiCheck,
  FiUserPlus,
  FiLock,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

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
  className: [],
  email: '',
  password: '',
  phone: '',
  address: '',
  parentName: '',
  parentPhone: '',
  notes: '',
};

const AddStudentModal = ({ show, onClose, classes, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailUser, setEmailUser] = useState(null);
  const [isNewClass, setIsNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailTimerRef = useRef(null);

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

    if (name === 'email') {
      clearTimeout(emailTimerRef.current);
      emailTimerRef.current = setTimeout(() => checkEmail(value), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (formData.className.length === 0) {
      setError('Vui lòng chọn ít nhất 1 lớp');
      setSubmitting(false);
      return;
    }

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

      handleClose();
      onSuccess();
    } catch {
      setError('Lỗi kết nối server');
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError('');
    setEmailStatus(null);
    setEmailUser(null);
    setIsNewClass(false);
    setNewClassName('');
    setShowPassword(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thêm học sinh mới</h2>
          <button
            onClick={handleClose}
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                {formData.className.length > 0 && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">
                    ({formData.className.length} lớp đã chọn)
                  </span>
                )}
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {classes.filter((c) => c.id !== 'all').length > 0 && (
                  <div className="max-h-36 overflow-y-auto p-3 space-y-1.5">
                    {classes
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.className.includes(c.name)}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                className: e.target.checked
                                  ? [...prev.className, c.name]
                                  : prev.className.filter((cn) => cn !== c.name),
                              }));
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{c.name}</span>
                          <span className="text-xs text-gray-400">({c.count} HS)</span>
                        </label>
                      ))}
                  </div>
                )}
                {!isNewClass ? (
                  <button
                    type="button"
                    onClick={() => setIsNewClass(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-200 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Tạo lớp mới...
                  </button>
                ) : (
                  <div className="flex gap-2 p-3 border-t border-gray-200 bg-gray-50">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tên lớp mới, VD: Lớp 10A1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newClassName.trim() && !formData.className.includes(newClassName.trim())) {
                            setFormData((prev) => ({
                              ...prev,
                              className: [...prev.className, newClassName.trim()],
                            }));
                          }
                          setNewClassName('');
                          setIsNewClass(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newClassName.trim() && !formData.className.includes(newClassName.trim())) {
                          setFormData((prev) => ({
                            ...prev,
                            className: [...prev.className, newClassName.trim()],
                          }));
                        }
                        setNewClassName('');
                        setIsNewClass(false);
                      }}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewClass(false);
                        setNewClassName('');
                      }}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-600 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {/* Hiển thị các lớp đã chọn dạng tag */}
              {formData.className.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.className.map((cn) => (
                    <span
                      key={cn}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg"
                    >
                      {cn}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            className: prev.className.filter((c) => c !== cn),
                          }))
                        }
                        className="hover:text-red-500 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
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

          {emailStatus === 'new' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Học sinh sẽ dùng email và mật khẩu này để đăng nhập hệ thống
              </p>
            </div>
          )}

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
              onClick={handleClose}
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
  );
};

export default AddStudentModal;
