import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path:  '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/users', icon: FaUsers, label: 'Người dùng' },
    { path: '/admin/addresses', icon: FaMapMarkerAlt, label: 'Địa chỉ' },
    { path: '/admin/validations', icon: FaCheckCircle, label: 'Xác minh' },
    { path:  '/admin/statistics', icon: FaChartBar, label: 'Thống kê' },
    { path: '/admin/settings', icon: FaCog, label: 'Cài đặt' }
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 to-emerald-700 text-white transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-green-500">
            <Link to="/admin" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Localizy Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold">Localizy</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-white hover:text-green-200"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item. path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-green-600 shadow-lg'
                          : 'text-green-50 hover:bg-green-500 hover:text-white'
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

          {/* Logout Button */}
          <div className="p-4 border-t border-green-500">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-green-50 hover:bg-green-500 rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt size={20} />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md: hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={toggleSidebar}
              className="md: hidden text-gray-600 hover:text-green-600"
            >
              <FaBars size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">Admin</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                A
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