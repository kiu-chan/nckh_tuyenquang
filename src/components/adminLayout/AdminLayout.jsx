import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiBook,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiShield,
  FiActivity,
  FiDatabase,
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  IoSchoolOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline
} from 'react-icons/io5';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Tổng quan', exact: true },
    { path: '/admin/users', icon: FiUsers, label: 'Người dùng' },
    { path: '/admin/teachers', icon: IoSchoolOutline, label: 'Giáo viên' },
    { path: '/admin/students', icon: FiBook, label: 'Học sinh' },
    { path: '/admin/courses', icon: IoDocumentTextOutline, label: 'Khóa học' },
    { path: '/admin/content', icon: FiDatabase, label: 'Nội dung' },
    { path: '/admin/games', icon: IoGameControllerOutline, label: 'Trò chơi' },
    { path: '/admin/reports', icon: IoStatsChartOutline, label: 'Báo cáo' },
    { path: '/admin/security', icon: FiShield, label: 'Bảo mật' },
    { path: '/admin/settings', icon: FiSettings, label: 'Cài đặt' }
  ];

  const notifications = [
    { id: 1, type: 'warning', message: '5 người dùng mới chờ phê duyệt', time: '5 phút trước' },
    { id: 2, type: 'info', message: 'Báo cáo tuần đã sẵn sàng', time: '1 giờ trước' },
    { id: 3, type: 'success', message: 'Hệ thống đã được cập nhật', time: '2 giờ trước' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 text-white transition-transform duration-300 ease-in-out shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-indigo-500">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <FiShield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <span className="text-xl font-bold">Admin Panel</span>
                <p className="text-xs text-indigo-200">NoteBookLM</p>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-white hover:text-indigo-200"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-white text-indigo-600 shadow-lg scale-105'
                          : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-indigo-500">
            <div className="flex items-center gap-3 mb-3 p-3 bg-indigo-500 bg-opacity-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-xs text-indigo-200 truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-indigo-100 hover:bg-indigo-500 rounded-xl transition-all duration-200"
            >
              <FiLogOut size={20} />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Menu button & Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMenu size={24} className="text-gray-600" />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center flex-1 max-w-xl">
                <div className="relative w-full">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng, khóa học, báo cáo..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right: Notifications & User */}
            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Hệ thống hoạt động tốt</span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiBell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Thông báo</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              notif.type === 'warning' ? 'bg-yellow-500' :
                              notif.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-indigo-600 font-medium hover:text-indigo-700">
                        Xem tất cả
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;