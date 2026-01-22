// src/pages/Map/index.jsx
import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiMapPin,
  FiNavigation,
  FiLayers,
  FiZoomIn,
  FiZoomOut,
  FiList,
  FiGrid,
  FiChevronDown,
  FiExternalLink,
  FiBookmark,
  FiShare2
} from 'react-icons/fi';
import { 
  IoCalculatorOutline,
  IoFlaskOutline,
  IoEarthOutline,
  IoBookOutline,
  IoTimeOutline,
  IoLeafOutline,
  IoLanguageOutline,
  IoLocationOutline,
  IoClose
} from 'react-icons/io5';

// Google Maps container style
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Vị trí mặc định (Hà Nội)
const defaultCenter = {
  lat: 21.0285,
  lng: 105.8542
};

// Map options
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Danh sách môn học với cấu hình
const subjects = [
  { id: 'math', name: 'Toán học', icon: IoCalculatorOutline, color: '#EF4444', bgColor: '#FEF2F2' },
  { id: 'physics', name: 'Vật lý', icon: IoFlaskOutline, color: '#3B82F6', bgColor: '#EFF6FF' },
  { id: 'chemistry', name: 'Hóa học', icon: IoFlaskOutline, color: '#10B981', bgColor: '#ECFDF5' },
  { id: 'biology', name: 'Sinh học', icon: IoLeafOutline, color: '#22C55E', bgColor: '#F0FDF4' },
  { id: 'history', name: 'Lịch sử', icon: IoTimeOutline, color: '#F59E0B', bgColor: '#FFFBEB' },
  { id: 'geography', name: 'Địa lý', icon: IoEarthOutline, color: '#06B6D4', bgColor: '#ECFEFF' },
  { id: 'literature', name: 'Văn học', icon: IoBookOutline, color: '#8B5CF6', bgColor: '#F5F3FF' },
  { id: 'english', name: 'Tiếng Anh', icon: IoLanguageOutline, color: '#EC4899', bgColor: '#FDF2F8' },
];

// Dữ liệu mẫu các điểm nổi bật
const sampleLocations = [
  // Toán học
  {
    id: 1,
    subject: 'math',
    name: 'Viện Toán học Việt Nam',
    description: 'Nơi nghiên cứu toán học hàng đầu Việt Nam, nơi làm việc của GS. Ngô Bảo Châu',
    position: { lat: 21.0380, lng: 105.7825 },
    address: '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    highlights: ['Giải Fields', 'Nghiên cứu đại số', 'Hình học số học'],
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'
  },
  {
    id: 2,
    subject: 'math',
    name: 'Đại học Bách Khoa Hà Nội',
    description: 'Trường đại học kỹ thuật hàng đầu với khoa Toán ứng dụng nổi tiếng',
    position: { lat: 21.0045, lng: 105.8440 },
    address: '1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    highlights: ['Toán ứng dụng', 'Khoa học máy tính', 'Kỹ thuật'],
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400'
  },
  // Vật lý
  {
    id: 3,
    subject: 'physics',
    name: 'Viện Vật lý Việt Nam',
    description: 'Trung tâm nghiên cứu vật lý với nhiều phòng thí nghiệm hiện đại',
    position: { lat: 21.0390, lng: 105.7810 },
    address: '10 Đào Tấn, Ba Đình, Hà Nội',
    highlights: ['Vật lý hạt nhân', 'Vật lý lý thuyết', 'Quang học'],
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400'
  },
  {
    id: 4,
    subject: 'physics',
    name: 'Đài thiên văn Hòa Lạc',
    description: 'Đài quan sát thiên văn với kính thiên văn hiện đại',
    position: { lat: 21.0150, lng: 105.5230 },
    address: 'Khu CNC Hòa Lạc, Thạch Thất, Hà Nội',
    highlights: ['Quan sát sao', 'Thiên văn học', 'Vũ trụ học'],
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400'
  },
  // Hóa học
  {
    id: 5,
    subject: 'chemistry',
    name: 'Viện Hóa học Việt Nam',
    description: 'Nghiên cứu hóa học cơ bản và ứng dụng',
    position: { lat: 21.0395, lng: 105.7815 },
    address: '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    highlights: ['Hóa hữu cơ', 'Hóa vô cơ', 'Hóa sinh'],
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400'
  },
  // Sinh học
  {
    id: 6,
    subject: 'biology',
    name: 'Vườn Quốc gia Cúc Phương',
    description: 'Khu bảo tồn thiên nhiên với đa dạng sinh học phong phú',
    position: { lat: 20.3500, lng: 105.6000 },
    address: 'Nho Quan, Ninh Bình',
    highlights: ['Đa dạng sinh học', 'Động vật hoang dã', 'Thực vật nhiệt đới'],
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400'
  },
  {
    id: 7,
    subject: 'biology',
    name: 'Bảo tàng Thiên nhiên Việt Nam',
    description: 'Bảo tàng trưng bày mẫu vật sinh học và địa chất',
    position: { lat: 21.0375, lng: 105.7820 },
    address: '18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    highlights: ['Mẫu vật động vật', 'Hóa thạch', 'Hệ sinh thái'],
    image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=400'
  },
  // Lịch sử
  {
    id: 8,
    subject: 'history',
    name: 'Hoàng thành Thăng Long',
    description: 'Di sản thế giới UNESCO, trung tâm quyền lực trong lịch sử Việt Nam',
    position: { lat: 21.0350, lng: 105.8400 },
    address: '19C Hoàng Diệu, Ba Đình, Hà Nội',
    highlights: ['Triều đại Lý', 'Triều đại Trần', 'Khảo cổ học'],
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400'
  },
  {
    id: 9,
    subject: 'history',
    name: 'Văn Miếu - Quốc Tử Giám',
    description: 'Trường đại học đầu tiên của Việt Nam, biểu tượng của truyền thống hiếu học',
    position: { lat: 21.0285, lng: 105.8355 },
    address: '58 Quốc Tử Giám, Đống Đa, Hà Nội',
    highlights: ['Nho giáo', 'Khoa cử', 'Tiến sĩ'],
    image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=400'
  },
  {
    id: 10,
    subject: 'history',
    name: 'Bảo tàng Lịch sử Quốc gia',
    description: 'Lưu giữ và trưng bày hiện vật lịch sử Việt Nam qua các thời kỳ',
    position: { lat: 21.0240, lng: 105.8590 },
    address: '1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    highlights: ['Thời kỳ đồ đồng', 'Văn hóa Đông Sơn', 'Cổ vật'],
    image: 'https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=400'
  },
  // Địa lý
  {
    id: 11,
    subject: 'geography',
    name: 'Vịnh Hạ Long',
    description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi',
    position: { lat: 20.9101, lng: 107.1839 },
    address: 'Quảng Ninh',
    highlights: ['Karst biển', 'Địa chất học', 'Sinh thái biển'],
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400'
  },
  {
    id: 12,
    subject: 'geography',
    name: 'Cao nguyên Đồng Văn',
    description: 'Công viên địa chất toàn cầu UNESCO với địa hình karst độc đáo',
    position: { lat: 23.2500, lng: 105.3500 },
    address: 'Hà Giang',
    highlights: ['Địa chất karst', 'Cao nguyên đá', 'Văn hóa dân tộc'],
    image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=400'
  },
  // Văn học
  {
    id: 13,
    subject: 'literature',
    name: 'Làng Nguyễn Du - Tiên Điền',
    description: 'Quê hương của đại thi hào Nguyễn Du, tác giả Truyện Kiều',
    position: { lat: 18.7500, lng: 105.7500 },
    address: 'Nghi Xuân, Hà Tĩnh',
    highlights: ['Truyện Kiều', 'Thơ chữ Hán', 'Di tích văn hóa'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
  },
  {
    id: 14,
    subject: 'literature',
    name: 'Nhà lưu niệm Hồ Chí Minh',
    description: 'Nơi lưu giữ di sản văn học và tư tưởng Hồ Chí Minh',
    position: { lat: 21.0368, lng: 105.8344 },
    address: 'Số 1 Bách Thảo, Ba Đình, Hà Nội',
    highlights: ['Nhật ký trong tù', 'Văn chính luận', 'Di sản văn hóa'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  // Tiếng Anh
  {
    id: 15,
    subject: 'english',
    name: 'British Council Việt Nam',
    description: 'Trung tâm văn hóa và giáo dục Anh Quốc tại Việt Nam',
    position: { lat: 21.0270, lng: 105.8510 },
    address: '20 Thụy Khuê, Tây Hồ, Hà Nội',
    highlights: ['IELTS', 'Văn hóa Anh', 'Học bổng'],
    image: 'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=400'
  },
  {
    id: 16,
    subject: 'english',
    name: 'Đại học Ngoại ngữ - ĐHQGHN',
    description: 'Trường đại học hàng đầu về đào tạo ngoại ngữ tại Việt Nam',
    position: { lat: 21.0380, lng: 105.7820 },
    address: 'Phạm Văn Đồng, Cầu Giấy, Hà Nội',
    highlights: ['Ngôn ngữ học', 'Biên phiên dịch', 'Sư phạm Anh'],
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400'
  }
];

function MapPage() {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [zoom, setZoom] = useState(10);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  // Lọc locations theo filters và search
  const filteredLocations = sampleLocations.filter(location => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(location.subject);
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Toggle filter
  const toggleFilter = (subjectId) => {
    setActiveFilters(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  // Map callbacks
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (map && zoom < 20) {
      map.setZoom(zoom + 1);
      setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map && zoom > 3) {
      map.setZoom(zoom - 1);
      setZoom(zoom - 1);
    }
  };

  // Center to location
  const centerToLocation = (location) => {
    if (map) {
      map.panTo(location.position);
      map.setZoom(14);
      setSelectedLocation(location);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (map) {
            map.panTo(pos);
            map.setZoom(14);
          }
        },
        () => {
          alert('Không thể lấy vị trí hiện tại của bạn');
        }
      );
    }
  };

  // Get subject config
  const getSubjectConfig = (subjectId) => {
    return subjects.find(s => s.id === subjectId) || subjects[0];
  };

  // Create custom marker icon
  const createMarkerIcon = (subjectId) => {
    const subject = getSubjectConfig(subjectId);
    return {
      path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
      fillColor: subject.color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: { x: 12, y: 24 },
    };
  };

  if (loadError) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không thể tải bản đồ</h2>
          <p className="text-gray-500">Vui lòng kiểm tra kết nối mạng và thử lại</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex relative">
      {/* Sidebar */}
      <div 
        className={`absolute lg:relative z-20 h-full bg-white shadow-xl transition-all duration-300 ${
          showSidebar ? 'w-full sm:w-96 left-0' : 'w-0 -left-96 lg:w-0'
        } overflow-hidden`}
      >
        <div className="w-full sm:w-96 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Điểm nổi bật</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Lọc theo môn học</span>
              {activeFilters.length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                const isActive = activeFilters.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleFilter(subject.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive 
                        ? 'text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={isActive ? { backgroundColor: subject.color } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">
                Tìm thấy {filteredLocations.length} địa điểm
              </p>
              <div className="space-y-3">
                {filteredLocations.map((location) => {
                  const subject = getSubjectConfig(location.subject);
                  const Icon = subject.icon;
                  return (
                    <button
                      key={location.id}
                      onClick={() => centerToLocation(location)}
                      className={`w-full p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                        selectedLocation?.id === location.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: subject.bgColor }}
                        >
                          <Icon className="w-6 h-6" style={{ color: subject.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 truncate">{location.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{location.address}</p>
                          <span 
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: subject.bgColor, color: subject.color }}
                          >
                            {subject.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
          onClick={() => setSelectedLocation(null)}
        >
          {/* Markers */}
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              icon={createMarkerIcon(location.subject)}
              onClick={() => setSelectedLocation(location)}
            />
          ))}

          {/* Info Window */}
          {selectedLocation && (
            <InfoWindow
              position={selectedLocation.position}
              onCloseClick={() => setSelectedLocation(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div className="w-72 p-1">
                {selectedLocation.image && (
                  <img 
                    src={selectedLocation.image} 
                    alt={selectedLocation.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-800 mb-1">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{selectedLocation.description}</p>
                <div className="flex items-start gap-1 text-xs text-gray-400 mb-3">
                  <IoLocationOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{selectedLocation.address}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedLocation.highlights.map((highlight, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                    <FiBookmark className="w-4 h-4" />
                    Lưu
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiShare2 className="w-4 h-4" />
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {/* Toggle Sidebar Button */}
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            >
              <FiList className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {/* Zoom Controls */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <FiZoomIn className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 hover:bg-gray-50 transition-colors"
            >
              <FiZoomOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Current Location */}
          <button
            onClick={getCurrentLocation}
            className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
          >
            <FiNavigation className="w-5 h-5 text-gray-600" />
          </button>

          {/* Layers */}
          <button
            className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
          >
            <FiLayers className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg p-3 max-w-max mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div key={subject.id} className="flex items-center gap-1.5">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-xs text-gray-600">{subject.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;