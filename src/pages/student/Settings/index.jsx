import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  FiUser, FiMail, FiLock, FiEdit2, FiEye, FiEyeOff, FiCheck, FiAlertCircle,
  FiSettings, FiX, FiShield, FiCalendar
} from 'react-icons/fi';

const API = '/api';
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
};

const StudentSettings = () => {
  const { currentUser, updateProfile } = useAuth();

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null); // 'profile' | 'password' | null

  // Profile edit state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const isGoogleUser = !!currentUser?.googleId;

  const openEditProfile = () => {
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setProfileMsg(null);
    setShowEditProfile(true);
  };

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPasswordMsg(null);
    setShowChangePassword(true);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setProfileMsg({ type: 'error', text: 'Tên không được để trống' }); return; }
    if (!email.trim()) { setProfileMsg({ type: 'error', text: 'Email không được để trống' }); return; }
    setShowConfirm('profile');
  };

  const confirmProfileSave = async () => {
    setShowConfirm(null);
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        updateProfile(data.user);
        setProfileMsg({ type: 'success', text: data.message });
        setTimeout(() => setShowEditProfile(false), 1200);
      } else {
        setProfileMsg({ type: 'error', text: data.message });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Lỗi kết nối server' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) { setPasswordMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu mới' }); return; }
    if (newPassword.length < 6) { setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' }); return; }
    setShowConfirm('password');
  };

  const confirmPasswordSave = async () => {
    setShowConfirm(null);
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      const res = await fetch(`${API}/auth/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: data.message });
        setTimeout(() => setShowChangePassword(false), 1200);
      } else {
        setPasswordMsg({ type: 'error', text: data.message });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Lỗi kết nối server' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FiSettings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cài đặt</h1>
            <p className="text-blue-100">Quản lý thông tin cá nhân và bảo mật</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Avatar + Name banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                currentUser?.name?.charAt(0) || 'H'
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{currentUser?.name}</h2>
              <p className="text-sm text-gray-500">{currentUser?.role === 'student' ? 'Học sinh' : currentUser?.role}</p>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Họ và tên</p>
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name || '---'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiMail className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.email || '---'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Vai trò</p>
              <p className="text-sm font-medium text-gray-800">{currentUser?.role === 'student' ? 'Học sinh' : currentUser?.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiLock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Mật khẩu</p>
              <p className="text-sm font-medium text-gray-800">
                {isGoogleUser && !currentUser?.password ? 'Đăng nhập bằng Google' : '••••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={openEditProfile}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
            Sửa thông tin
          </button>
          <button
            onClick={openChangePassword}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium transition-colors"
          >
            <FiLock className="w-4 h-4" />
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Sửa thông tin cá nhân</h3>
              <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  profileMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {profileMsg.type === 'success' ? <FiCheck className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {profileMsg.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors"
                >
                  {profileSaving ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {isGoogleUser ? 'Tạo mật khẩu' : 'Đổi mật khẩu'}
              </h3>
              <button onClick={() => setShowChangePassword(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  passwordMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {passwordMsg.type === 'success' ? <FiCheck className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {passwordMsg.text}
                </div>
              )}

              {!isGoogleUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-medium transition-colors"
                >
                  {passwordSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              {showConfirm === 'profile'
                ? <FiEdit2 className="w-6 h-6 text-blue-600" />
                : <FiLock className="w-6 h-6 text-orange-600" />
              }
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              {showConfirm === 'profile' ? 'Xác nhận cập nhật' : 'Xác nhận đổi mật khẩu'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {showConfirm === 'profile'
                ? 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân?'
                : 'Bạn có chắc chắn muốn đổi mật khẩu?'
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={showConfirm === 'profile' ? confirmProfileSave : confirmPasswordSave}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${
                  showConfirm === 'profile'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSettings;
