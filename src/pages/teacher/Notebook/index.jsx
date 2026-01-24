import React, { useState } from 'react';
import { 
  FiUpload,
  FiFile,
  FiX,
  FiDownload,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  IoDocumentTextOutline,
  IoSparklesOutline,
  IoListOutline,
  IoGridOutline,
  IoBookOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

const TeacherNotebook = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, result
  const [summaryType, setSummaryType] = useState('list'); // list, table, bullets, framework
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const summaryTypes = [
    {
      id: 'list',
      name: 'Danh sách',
      icon: IoListOutline,
      description: 'Tóm tắt theo dạng danh sách có số thứ tự',
      color: 'blue'
    },
    {
      id: 'table',
      name: 'Bảng',
      icon: IoGridOutline,
      description: 'Trình bày thông tin dưới dạng bảng',
      color: 'green'
    },
    {
      id: 'bullets',
      name: 'Gạch đầu dòng',
      icon: IoDocumentTextOutline,
      description: 'Tóm tắt theo dạng bullet points',
      color: 'purple'
    },
    {
      id: 'framework',
      name: 'Khung sườn',
      icon: IoBookOutline,
      description: 'Tạo khung sườn bài giảng có cấu trúc',
      color: 'orange'
    },
  ];

  const recentFiles = [
    {
      id: 1,
      name: 'Bài 5 - Hàm số bậc nhất.docx',
      type: 'docx',
      date: '20/01/2025',
      size: '2.4 MB',
      summaryType: 'Danh sách'
    },
    {
      id: 2,
      name: 'Chương 3 - Đạo hàm.pdf',
      type: 'pdf',
      date: '18/01/2025',
      size: '5.1 MB',
      summaryType: 'Bảng'
    },
    {
      id: 3,
      name: 'Giảng án - Bất phương trình.txt',
      type: 'txt',
      date: '15/01/2025',
      size: '156 KB',
      summaryType: 'Khung sườn'
    },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setActiveTab('upload');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setActiveTab('upload');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setGeneratedContent('');
    setActiveTab('upload');
  };

  const handleGenerate = async () => {
    if (!selectedFile || !summaryType) return;

    setIsProcessing(true);
    setActiveTab('result');

    // Simulate AI processing
    setTimeout(() => {
      let content = '';
      
      switch (summaryType) {
        case 'list':
          content = generateListSummary();
          break;
        case 'table':
          content = generateTableSummary();
          break;
        case 'bullets':
          content = generateBulletsSummary();
          break;
        case 'framework':
          content = generateFrameworkSummary();
          break;
        default:
          content = 'Không thể tạo nội dung';
      }
      
      setGeneratedContent(content);
      setIsProcessing(false);
    }, 3000);
  };

  const generateListSummary = () => {
    return `TÓM TẮT NỘI DUNG - BÀI 5: HÀM SỐ BẬC NHẤT

1. Khái niệm hàm số bậc nhất
   - Định nghĩa: Hàm số bậc nhất là hàm số có dạng y = ax + b (a ≠ 0)
   - Tập xác định: D = ℝ (tất cả các số thực)
   - Ví dụ: y = 2x + 3, y = -x + 5

2. Tính chất của hàm số bậc nhất
   - Đồng biến khi a > 0 (đường thẳng đi lên từ trái sang phải)
   - Nghịch biến khi a < 0 (đường thẳng đi xuống từ trái sang phải)
   - Hệ số góc a quyết định độ dốc của đường thẳng

3. Đồ thị hàm số bậc nhất
   - Đồ thị là một đường thẳng
   - Cắt trục tung tại điểm (0, b)
   - Cắt trục hoành tại điểm (-b/a, 0)

4. Vị trí tương đối của hai đường thẳng
   - Song song: a₁ = a₂ và b₁ ≠ b₂
   - Trùng nhau: a₁ = a₂ và b₁ = b₂
   - Cắt nhau: a₁ ≠ a₂

5. Ứng dụng thực tế
   - Tính toán chi phí: C = ax + b
   - Chuyển động thẳng đều: s = vt + s₀
   - Các bài toán kinh tế`;
  };

  const generateTableSummary = () => {
    return `TÓM TẮT DẠNG BẢNG - HÀM SỐ BẬC NHẤT

┌─────────────────────────┬──────────────────────────────────────────┐
│ NỘI DUNG                │ CHI TIẾT                                 │
├─────────────────────────┼──────────────────────────────────────────┤
│ Định nghĩa              │ y = ax + b (a ≠ 0)                      │
│                         │ a: hệ số góc                             │
│                         │ b: tung độ gốc                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tập xác định            │ D = ℝ                                    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tính chất               │ • a > 0: Hàm đồng biến                  │
│                         │ • a < 0: Hàm nghịch biến                │
├─────────────────────────┼──────────────────────────────────────────┤
│ Đồ thị                  │ • Là đường thẳng                        │
│                         │ • Cắt Oy tại (0, b)                     │
│                         │ • Cắt Ox tại (-b/a, 0)                  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Vị trí tương đối        │ • Song song: a₁ = a₂, b₁ ≠ b₂          │
│                         │ • Trùng nhau: a₁ = a₂, b₁ = b₂         │
│                         │ • Cắt nhau: a₁ ≠ a₂                     │
└─────────────────────────┴──────────────────────────────────────────┘`;
  };

  const generateBulletsSummary = () => {
    return `TÓM TẮT DẠNG GẠCH ĐẦU DÒNG

HÀM SỐ BẬC NHẤT

- Khái niệm cơ bản
  ◦ Dạng tổng quát: y = ax + b với a ≠ 0
  ◦ Tập xác định là tập số thực ℝ
  ◦ a gọi là hệ số góc, b gọi là tung độ gốc

- Tính chất quan trọng
  ◦ Hàm đồng biến trên ℝ khi a > 0
  ◦ Hàm nghịch biến trên ℝ khi a < 0
  ◦ Hệ số a càng lớn, đồ thị càng dốc

- Đặc điểm đồ thị
  ◦ Đồ thị là đường thẳng không song song với các trục tọa độ
  ◦ Đi qua điểm (0, b) trên trục tung
  ◦ Đi qua điểm (-b/a, 0) trên trục hoành

- Các dạng bài tập
  ◦ Xác định hàm số biết điểm đi qua
  ◦ Tìm giao điểm của hai đường thẳng
  ◦ Xét vị trí tương đối
  ◦ Bài toán thực tế có ứng dụng

- Lưu ý khi giải bài tập
  ◦ Kiểm tra điều kiện a ≠ 0
  ◦ Vẽ đồ thị chính xác
  ◦ Kết hợp với hệ phương trình`;
  };

  const generateFrameworkSummary = () => {
    return `KHUNG SƯỜN BÀI GIẢNG - HÀM SỐ BẬC NHẤT

I. MỤC TIÊU BÀI HỌC
   1. Kiến thức
      - Hiểu được khái niệm hàm số bậc nhất
      - Nắm được tính chất và đồ thị hàm số bậc nhất
   
   2. Kỹ năng
      - Vẽ được đồ thị hàm số bậc nhất
      - Xét được tính đồng biến, nghịch biến
      - Giải được các bài toán liên quan
   
   3. Thái độ
      - Tích cực tham gia học tập
      - Biết áp dụng vào thực tế

II. CHUẨN BỊ
   1. Giáo viên
      - Giáo án, SGK, STK
      - Phiếu học tập, thước kẻ
      - Máy chiếu, bảng phụ
   
   2. Học sinh
      - SGK, vở, dụng cụ học tập
      - Ôn tập kiến thức cũ về hàm số

III. TIẾN TRÌNH DẠY HỌC
   
   A. Hoạt động khởi động (5 phút)
      - Kiểm tra bài cũ: Khái niệm hàm số
      - Đặt vấn đề: Đặc điểm của hàm số y = 2x + 3?
   
   B. Hoạt động hình thành kiến thức (25 phút)
      
      1. Định nghĩa hàm số bậc nhất (10 phút)
         - Cho HS quan sát các ví dụ
         - Rút ra định nghĩa tổng quát
         - Xác định tập xác định
      
      2. Tính chất (8 phút)
         - Nghiên cứu tính đồng biến, nghịch biến
         - Liên hệ với hệ số a
         - Làm ví dụ minh họa
      
      3. Đồ thị (7 phút)
         - Cách vẽ đồ thị
         - Đặc điểm đồ thị
         - Ý nghĩa các hệ số
   
   C. Hoạt động luyện tập (10 phút)
      - Bài tập 1: Xét tính biến thiên
      - Bài tập 2: Vẽ đồ thị
      - Bài tập 3: Tìm giao điểm
   
   D. Hoạt động vận dụng (3 phút)
      - Bài toán thực tế về chi phí
      - Liên hệ với chuyển động thẳng đều
   
   E. Hoạt động tổng kết (2 phút)
      - Nhắc lại kiến thức trọng tâm
      - Dặn dò bài tập về nhà

IV. HƯỚNG DẪN VỀ NHÀ
   - Học thuộc định nghĩa và tính chất
   - Làm bài tập SGK trang 45-46
   - Chuẩn bị bài: Vị trí tương đối của hai đường thẳng`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tom-tat-${summaryType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Notebook - Tóm tắt tài liệu</h1>
        <p className="text-gray-600">
          Sử dụng AI để tóm tắt tài liệu theo nhiều dạng: danh sách, bảng, gạch đầu dòng, khung sườn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Tải tài liệu lên</h2>
            
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".txt,.doc,.docx,.pdf"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiUpload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Kéo thả file vào đây</p>
                  <p className="text-sm text-gray-500 mb-4">hoặc</p>
                  <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 inline-block">
                    Chọn file từ máy
                  </span>
                  <p className="text-xs text-gray-400 mt-4">
                    Hỗ trợ: TXT, DOC, DOCX, PDF (Tối đa 10MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Type Selection */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Chọn dạng tóm tắt</h2>
            <div className="space-y-3">
              {summaryTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = summaryType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSummaryType(type.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? 'text-emerald-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${
                            isSelected ? 'text-emerald-700' : 'text-gray-700'
                          }`}>
                            {type.name}
                          </p>
                          {isSelected && (
                            <IoCheckmarkCircleOutline className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || !summaryType || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            {isProcessing ? (
              <>
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <IoSparklesOutline className="w-5 h-5" />
                <span>Tạo tóm tắt với AI</span>
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Mẹo sử dụng:</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• File nên có nội dung rõ ràng, có cấu trúc</li>
                  <li>• Chọn dạng tóm tắt phù hợp với mục đích</li>
                  <li>• Có thể chỉnh sửa nội dung sau khi tạo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Result & Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Area */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Kết quả</h2>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-4 h-4" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadContent}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Tải xuống</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Đang phân tích tài liệu...</p>
                  <p className="text-sm text-gray-500 mt-2">Quá trình này có thể mất vài giây</p>
                </div>
              ) : generatedContent ? (
                <div className="prose max-w-none">
                  <pre className="bg-gray-50 rounded-xl p-6 text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IoDocumentTextOutline className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có kết quả</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tải tài liệu lên và chọn dạng tóm tắt để bắt đầu
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Files */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tài liệu gần đây</h2>
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{file.date}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span className="text-emerald-600">{file.summaryType}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                    Xem lại
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNotebook;