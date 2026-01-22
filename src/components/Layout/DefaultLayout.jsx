// src/components/Layout/DefaultLayout/index.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiMapPin, 
  FiBook, 
  FiMenu, 
  FiX, 
  FiSearch,
  FiChevronDown,
  FiHome,
  FiCompass,
  FiUser,
  FiLogIn,
  FiMail,
  FiPhone,
  FiMapPin as FiLocation
} from 'react-icons/fi';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube 
} from 'react-icons/fa';
import { 
  IoSchoolOutline,
  IoFlaskOutline,
  IoEarthOutline,
  IoBookOutline,
  IoCalculatorOutline,
  IoLanguageOutline,
  IoTimeOutline,
  IoLeafOutline
} from 'react-icons/io5';

// Danh sách các môn học
const subjects = [
  { name: 'Toán học', icon: IoCalculatorOutline, color: '#EF4444', bgColor: '#FEF2F2', path: '/subjects/math' },
  { name: 'Vật lý', icon: IoFlaskOutline, color: '#3B82F6', bgColor: '#EFF6FF', path: '/subjects/physics' },
  { name: 'Hóa học', icon: IoFlaskOutline, color: '#10B981', bgColor: '#ECFDF5', path: '/subjects/chemistry' },
  { name: 'Sinh học', icon: IoLeafOutline, color: '#22C55E', bgColor: '#F0FDF4', path: '/subjects/biology' },
  { name: 'Lịch sử', icon: IoTimeOutline, color: '#F59E0B', bgColor: '#FFFBEB', path: '/subjects/history' },
  { name: 'Địa lý', icon: IoEarthOutline, color: '#06B6D4', bgColor: '#ECFEFF', path: '/subjects/geography' },
  { name: 'Văn học', icon: IoBookOutline, color: '#8B5CF6', bgColor: '#F5F3FF', path: '/subjects/literature' },
  { name: 'Tiếng Anh', icon: IoLanguageOutline, color: '#EC4899', bgColor: '#FDF2F8', path: '/subjects/english' },
];

function DefaultLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSubjectsOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-md' 
            : 'bg-white/95'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FiMapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">EduMap</h1>
                <p className="text-[10px] text-gray-500 -mt-1">Bản đồ học tập</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" icon={<FiHome />}>Trang chủ</NavLink>
              
              {/* Dropdown Môn học */}
              <div className="relative">
                <button
                  onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSubjectsOpen 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiBook className="w-4 h-4" />
                  <span>Môn học</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${isSubjectsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSubjectsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-2">
                    {subjects.map((subject) => {
                      const Icon = subject.icon;
                      return (
                        <Link
                          key={subject.name}
                          to={subject.path}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: subject.bgColor }}
                          >
                            <Icon className="w-4 h-4" style={{ color: subject.color }} />
                          </div>
                          <span className="text-sm text-gray-700">{subject.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <NavLink to="/map" icon={<FiCompass />}>Bản đồ</NavLink>
              <NavLink to="/about" icon={<IoSchoolOutline />}>Giới thiệu</NavLink>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-40 lg:w-56 px-3 py-0.5 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm font-medium text-white transition-colors shadow-md shadow-blue-500/25"
              >
                <FiUser className="w-4 h-4" />
                <span>Đăng ký</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6 text-gray-600" /> : <FiMenu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 px-3 py-1 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* Mobile Links */}
              <div className="space-y-1">
                <MobileNavLink to="/" icon={<FiHome />}>Trang chủ</MobileNavLink>
                <MobileNavLink to="/map" icon={<FiCompass />}>Bản đồ</MobileNavLink>
                <MobileNavLink to="/about" icon={<IoSchoolOutline />}>Giới thiệu</MobileNavLink>
              </div>

              {/* Mobile Subjects */}
              <div className="pt-3 border-t border-gray-100">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">Môn học</p>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => {
                    const Icon = subject.icon;
                    return (
                      <Link
                        key={subject.name}
                        to={subject.path}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="w-4 h-4" style={{ color: subject.color }} />
                        <span className="text-sm text-gray-600">{subject.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Auth */}
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <Link to="/login" className="flex-1 py-2.5 text-center text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
                  Đăng nhập
                </Link>
                <Link to="/register" className="flex-1 py-2.5 text-center text-sm font-medium text-white bg-blue-500 rounded-lg">
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">EduMap</span>
              </Link>
              <p className="text-sm text-gray-500 mb-4">
                Khám phá tri thức qua bản đồ tương tác. Học tập trở nên thú vị hơn.
              </p>
              <div className="flex gap-2">
                {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-500 hover:text-white flex items-center justify-center text-gray-500 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Truy cập nhanh</h3>
              <ul className="space-y-2">
                {['Trang chủ', 'Bản đồ', 'Môn học', 'Giới thiệu'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-500 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subjects */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Môn học</h3>
              <ul className="space-y-2">
                {subjects.slice(0, 5).map((subject) => (
                  <li key={subject.name}>
                    <Link to={subject.path} className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                      {subject.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Liên hệ</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <FiMail className="w-4 h-4 text-blue-500" />
                  contact@edumap.vn
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <FiPhone className="w-4 h-4 text-blue-500" />
                  0123 456 789
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-500">
                  <FiLocation className="w-4 h-4 text-blue-500 mt-0.5" />
                  Hà Nội, Việt Nam
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2025 EduMap. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Điều khoản</a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Nav Link Components
function NavLink({ to, icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export default DefaultLayout;