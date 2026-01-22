// src/pages/Home/index.jsx
import { Link } from 'react-router-dom';
import { 
  FiMapPin, 
  FiArrowRight, 
  FiPlay,
  FiUsers,
  FiBookOpen,
  FiAward,
  FiStar
} from 'react-icons/fi';
import { 
  IoCalculatorOutline,
  IoFlaskOutline,
  IoEarthOutline,
  IoBookOutline,
  IoTimeOutline,
  IoLeafOutline,
  IoLanguageOutline,
  IoRocketOutline,
  IoSparklesOutline,
  IoTrendingUpOutline
} from 'react-icons/io5';

// Danh sách môn học
const subjects = [
  { name: 'Toán học', icon: IoCalculatorOutline, color: '#EF4444', bgColor: '#FEF2F2', students: '2.5k', path: '/subjects/math' },
  { name: 'Vật lý', icon: IoFlaskOutline, color: '#3B82F6', bgColor: '#EFF6FF', students: '1.8k', path: '/subjects/physics' },
  { name: 'Hóa học', icon: IoFlaskOutline, color: '#10B981', bgColor: '#ECFDF5', students: '1.5k', path: '/subjects/chemistry' },
  { name: 'Sinh học', icon: IoLeafOutline, color: '#22C55E', bgColor: '#F0FDF4', students: '1.2k', path: '/subjects/biology' },
  { name: 'Lịch sử', icon: IoTimeOutline, color: '#F59E0B', bgColor: '#FFFBEB', students: '980', path: '/subjects/history' },
  { name: 'Địa lý', icon: IoEarthOutline, color: '#06B6D4', bgColor: '#ECFEFF', students: '1.1k', path: '/subjects/geography' },
  { name: 'Văn học', icon: IoBookOutline, color: '#8B5CF6', bgColor: '#F5F3FF', students: '1.3k', path: '/subjects/literature' },
  { name: 'Tiếng Anh', icon: IoLanguageOutline, color: '#EC4899', bgColor: '#FDF2F8', students: '2.1k', path: '/subjects/english' },
];

// Tính năng nổi bật
const features = [
  {
    icon: FiMapPin,
    title: 'Bản đồ trực quan',
    description: 'Xem các điểm nổi bật của từng môn học trên bản đồ tương tác',
    color: '#3B82F6'
  },
  {
    icon: IoSparklesOutline,
    title: 'Học tập thú vị',
    description: 'Phương pháp học mới mẻ, sinh động và dễ nhớ',
    color: '#F59E0B'
  },
  {
    icon: IoTrendingUpOutline,
    title: 'Theo dõi tiến độ',
    description: 'Ghi nhận và theo dõi quá trình học tập của bạn',
    color: '#10B981'
  },
  {
    icon: FiUsers,
    title: 'Cộng đồng học tập',
    description: 'Kết nối với bạn bè và chia sẻ kiến thức',
    color: '#8B5CF6'
  }
];

// Thống kê
const stats = [
  { value: '10K+', label: 'Học sinh', icon: FiUsers },
  { value: '500+', label: 'Điểm nổi bật', icon: FiMapPin },
  { value: '8', label: 'Môn học', icon: FiBookOpen },
  { value: '4.9', label: 'Đánh giá', icon: FiStar }
];

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-6">
                <IoRocketOutline className="w-4 h-4" />
                <span>Khám phá cách học mới</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Khám phá tri thức qua{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  Bản đồ học tập
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                EduMap giúp học sinh hiểu rõ hơn về từng môn học thông qua các điểm nổi bật 
                được hiển thị trực quan trên bản đồ tương tác.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  <FiMapPin className="w-5 h-5" />
                  Khám phá ngay
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-full border border-gray-200 transition-all">
                  <FiPlay className="w-5 h-5 text-blue-500" />
                  Xem hướng dẫn
                </button>
              </div>

              {/* Stats Mini */}
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-gray-200">
                {stats.slice(0, 3).map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Map Illustration */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-blue-500/10 p-6 border border-gray-100">
                {/* Map Preview */}
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden relative">
                  {/* Fake Map Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Map Pins */}
                  <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDelay: '0s' }}>
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <IoCalculatorOutline className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/3 right-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <IoFlaskOutline className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1/3 left-1/3 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <IoLeafOutline className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <IoBookOutline className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white"
                        style={{ backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][i] }}
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                      +99
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">500+ điểm nổi bật</span>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiAward className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hoàn thành</p>
                    <p className="text-sm font-semibold text-gray-800">+25 điểm</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đã khám phá</p>
                    <p className="text-sm font-semibold text-gray-800">128 địa điểm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Chọn môn học yêu thích
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các điểm nổi bật thú vị của từng môn học trên bản đồ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {subjects.map((subject) => {
              const Icon = subject.icon;
              return (
                <Link
                  key={subject.name}
                  to={subject.path}
                  className="group p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-gray-200/50 hover:border-transparent transition-all duration-300"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: subject.bgColor }}
                  >
                    <Icon className="w-7 h-7" style={{ color: subject.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.students} học sinh</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Tại sao chọn EduMap?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Phương pháp học tập trực quan giúp bạn ghi nhớ kiến thức hiệu quả hơn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-blue-100">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Sẵn sàng khám phá?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn học sinh đang sử dụng EduMap để học tập hiệu quả hơn mỗi ngày.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-500/25"
            >
              Bắt đầu miễn phí
              <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-all"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        
        .animate-float {
          animation: float 3s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Home;