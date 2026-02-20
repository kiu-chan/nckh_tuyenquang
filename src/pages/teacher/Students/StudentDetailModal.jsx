import { useState, useEffect } from 'react';
import {
  FiX,
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
  FiSave,
  FiLoader,
  FiPlus,
} from 'react-icons/fi';
import {
  IoPersonOutline,
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

const StudentDetailModal = ({ show, student, onClose, onDelete, onUpdate, classes = [] }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isNewClass, setIsNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        gender: student.gender || 'Nam',
        dateOfBirth: student.dateOfBirth || '',
        className: Array.isArray(student.className) ? [...student.className] : [student.className].filter(Boolean),
        phone: student.phone || '',
        address: student.address || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        notes: student.notes || '',
        status: student.status || 'active',
      });
      setEditing(false);
      setError('');
    }
  }, [student]);

  if (!show || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (formData.className.length === 0) {
      setError('Vui lòng chọn ít nhất 1 lớp');
      return;
    }
    if (!formData.name.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/${student._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Có lỗi xảy ra');
        setSaving(false);
        return;
      }

      setEditing(false);
      if (onUpdate) onUpdate();
    } catch {
      setError('Lỗi kết nối server');
    }
    setSaving(false);
  };

  const handleClose = () => {
    setEditing(false);
    setError('');
    setIsNewClass(false);
    setNewClassName('');
    onClose();
  };

  const availableClasses = classes.filter((c) => c.id !== 'all');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-32 bg-gradient-to-br from-emerald-400 to-teal-500">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <FiEdit3 className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                {(editing ? formData.name : student.name)?.charAt(0) || '?'}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {editing ? (
            /* ============ EDIT MODE ============ */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Đang học</option>
                    <option value="inactive">Nghỉ học</option>
                  </select>
                </div>
              </div>

              {/* Class multi-select */}
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
                  {availableClasses.length > 0 && (
                    <div className="max-h-36 overflow-y-auto p-3 space-y-1.5">
                      {availableClasses.map((c) => (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập ghi chú về học sinh..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setIsNewClass(false);
                    setNewClassName('');
                    // Reset form to original student data
                    setFormData({
                      name: student.name || '',
                      gender: student.gender || 'Nam',
                      dateOfBirth: student.dateOfBirth || '',
                      className: Array.isArray(student.className) ? [...student.className] : [student.className].filter(Boolean),
                      phone: student.phone || '',
                      address: student.address || '',
                      parentName: student.parentName || '',
                      parentPhone: student.parentPhone || '',
                      notes: student.notes || '',
                      status: student.status || 'active',
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ============ VIEW MODE ============ */
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{student.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(student.className) ? student.className : [student.className]).map((cn) => (
                        <span key={cn} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-sm font-medium rounded">
                          {cn}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400">&bull;</span>
                    <span className="text-gray-600">{student.gender}</span>
                  </div>
                </div>
                {student.status === 'active' ? (
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
                  <div className="text-3xl font-bold text-blue-600 mb-1">{student.score}</div>
                  <div className="text-sm text-gray-600">Điểm trung bình</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{student.attendance}%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ đi học</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {student.assignmentsCompleted}/{student.assignmentsTotal}
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
                      <span className="text-sm font-medium text-gray-800">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-3">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">SĐT:</span>
                        <span className="text-sm font-medium text-gray-800">{student.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Ngày sinh:</span>
                      <span className="text-sm font-medium text-gray-800">{student.dateOfBirth}</span>
                    </div>
                    {student.address && (
                      <div className="flex items-center gap-3">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Địa chỉ:</span>
                        <span className="text-sm font-medium text-gray-800">{student.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(student.parentName || student.parentPhone) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <IoPersonOutline className="w-5 h-5" />
                      Thông tin phụ huynh
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {student.parentName && (
                        <div className="flex items-center gap-3">
                          <IoPersonOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Họ tên:</span>
                          <span className="text-sm font-medium text-gray-800">{student.parentName}</span>
                        </div>
                      )}
                      {student.parentPhone && (
                        <div className="flex items-center gap-3">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">SĐT:</span>
                          <span className="text-sm font-medium text-gray-800">{student.parentPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {student.notes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Ghi chú</h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
                      <p className="text-sm text-gray-700">{student.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => onDelete(student._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Xóa
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
