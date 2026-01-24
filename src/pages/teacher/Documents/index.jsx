import React, { useState } from 'react';
import { 
  FiUpload,
  FiFile,
  FiFolder,
  FiSearch,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiShare2,
  FiEye,
  FiPlus,
  FiFilter,
  FiGrid,
  FiList,
  FiClock,
  FiStar,
  FiX
} from 'react-icons/fi';
import { 
  IoDocumentTextOutline,
  IoFolderOutline,
  IoCloudUploadOutline,
  IoCalendarOutline,
  IoPersonOutline
} from 'react-icons/io5';

const TeacherDocuments = () => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: FiFolder, count: 24, color: 'gray' },
    { id: 'lesson-plans', name: 'Giảng án', icon: IoDocumentTextOutline, count: 8, color: 'blue' },
    { id: 'presentations', name: 'Bài giảng', icon: IoDocumentTextOutline, count: 6, color: 'green' },
    { id: 'worksheets', name: 'Bài tập', icon: IoDocumentTextOutline, count: 5, color: 'purple' },
    { id: 'exams', name: 'Đề thi', icon: IoDocumentTextOutline, count: 3, color: 'orange' },
    { id: 'references', name: 'Tài liệu tham khảo', icon: IoDocumentTextOutline, count: 2, color: 'pink' },
  ];

  const documents = [
    {
      id: 1,
      name: 'Giảng án Toán 10 - Học kỳ 1',
      type: 'docx',
      category: 'lesson-plans',
      size: '2.4 MB',
      date: '20/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: true,
      sharedWith: 5
    },
    {
      id: 2,
      name: 'Bài giảng - Hàm số bậc nhất',
      type: 'pptx',
      category: 'presentations',
      size: '5.8 MB',
      date: '19/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: false,
      sharedWith: 12
    },
    {
      id: 3,
      name: 'Đề thi giữa kỳ I - Toán 10',
      type: 'pdf',
      category: 'exams',
      size: '1.2 MB',
      date: '18/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: true,
      sharedWith: 3
    },
    {
      id: 4,
      name: 'Bài tập về đạo hàm',
      type: 'docx',
      category: 'worksheets',
      size: '856 KB',
      date: '17/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: false,
      sharedWith: 8
    },
    {
      id: 5,
      name: 'Tài liệu bồi dưỡng HSG',
      type: 'pdf',
      category: 'references',
      size: '12.5 MB',
      date: '15/01/2025',
      author: 'Cô Trần Thị B',
      thumbnail: null,
      isFavorite: false,
      sharedWith: 0
    },
    {
      id: 6,
      name: 'Giảng án Chương 3 - Đạo hàm',
      type: 'docx',
      category: 'lesson-plans',
      size: '3.1 MB',
      date: '14/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: true,
      sharedWith: 4
    },
    {
      id: 7,
      name: 'Bài giảng Bất phương trình',
      type: 'pptx',
      category: 'presentations',
      size: '4.2 MB',
      date: '12/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: false,
      sharedWith: 15
    },
    {
      id: 8,
      name: 'Đề kiểm tra 15 phút',
      type: 'pdf',
      category: 'exams',
      size: '654 KB',
      date: '10/01/2025',
      author: 'Thầy Nguyễn Văn A',
      thumbnail: null,
      isFavorite: false,
      sharedWith: 2
    },
  ];

  const stats = [
    { label: 'Tổng tài liệu', value: '24', icon: IoDocumentTextOutline, color: 'blue' },
    { label: 'Dung lượng', value: '156 MB', icon: IoCloudUploadOutline, color: 'green' },
    { label: 'Chia sẻ', value: '49', icon: FiShare2, color: 'purple' },
    { label: 'Yêu thích', value: '8', icon: FiStar, color: 'yellow' },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'docx':
      case 'doc':
        return { icon: FiFile, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'pdf':
        return { icon: FiFile, color: 'text-red-500', bg: 'bg-red-50' };
      case 'pptx':
      case 'ppt':
        return { icon: FiFile, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'xlsx':
      case 'xls':
        return { icon: FiFile, color: 'text-green-500', bg: 'bg-green-50' };
      default:
        return { icon: FiFile, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (docId) => {
    // Handle favorite toggle
    console.log('Toggle favorite:', docId);
  };

  const handleContextMenu = (e, docId) => {
    e.preventDefault();
    setShowContextMenu(docId);
  };

  const handleFileSelect = (docId) => {
    setSelectedFiles(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tài liệu của tôi</h1>
          <p className="text-gray-600">Quản lý và chia sẻ tài liệu giảng dạy</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
        >
          <FiPlus className="w-5 h-5" />
          <span>Tải lên</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
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
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

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

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100' : 'bg-gray-200'
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => {
            const fileIcon = getFileIcon(doc.type);
            const Icon = fileIcon.icon;
            const isSelected = selectedFiles.includes(doc.id);

            return (
              <div
                key={doc.id}
                onContextMenu={(e) => handleContextMenu(e, doc.id)}
                className={`bg-white rounded-xl border-2 transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-emerald-500 shadow-lg'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Thumbnail */}
                <div className={`relative h-32 ${fileIcon.bg} rounded-t-xl flex items-center justify-center`}>
                  <Icon className={`w-12 h-12 ${fileIcon.color}`} />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-t-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <FiEye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <FiDownload className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                        <FiShare2 className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFileSelect(doc.id)}
                      className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiStar className={`w-4 h-4 ${doc.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate mb-2" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{doc.size}</span>
                    <span className="uppercase font-medium">{doc.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiClock className="w-3 h-3" />
                    <span>{doc.date}</span>
                  </div>
                  {doc.sharedWith > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                      <FiShare2 className="w-3 h-3" />
                      <span>Đã chia sẻ với {doc.sharedWith} người</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên tài liệu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kích thước</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Chia sẻ</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => {
                const fileIcon = getFileIcon(doc.type);
                const Icon = fileIcon.icon;
                const isSelected = selectedFiles.includes(doc.id);

                return (
                  <tr key={doc.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-emerald-50' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFileSelect(doc.id)}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${fileIcon.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${fileIcon.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.author}</p>
                        </div>
                        {doc.isFavorite && (
                          <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded uppercase">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.date}</td>
                    <td className="px-6 py-4">
                      {doc.sharedWith > 0 ? (
                        <span className="text-sm text-emerald-600">{doc.sharedWith} người</span>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa chia sẻ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiEye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiDownload className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiShare2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiMoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoFolderOutline className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy tài liệu</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tải tài liệu lên</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-500 transition-colors mb-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IoCloudUploadOutline className="w-10 h-10 text-emerald-600" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Kéo thả file vào đây</p>
              <p className="text-sm text-gray-500 mb-4">hoặc</p>
              <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors">
                Chọn file từ máy
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Hỗ trợ: DOC, DOCX, PDF, PPT, PPTX, XLS, XLSX (Tối đa 50MB)
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Chọn danh mục</option>
                <option>Giảng án</option>
                <option>Bài giảng</option>
                <option>Bài tập</option>
                <option>Đề thi</option>
                <option>Tài liệu tham khảo</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all">
                Tải lên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDocuments;