import { useState } from 'react';
import {
  FiUpload,
  FiFile,
  FiX,
  FiDownload,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader
} from 'react-icons/fi';
import {
  IoDocumentTextOutline,
  IoSparklesOutline,
  IoListOutline,
  IoGridOutline,
  IoBookOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { extractTextFromFile, summarizeDocument } from '../../../services/aiService';

const TeacherNotebook = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, result
  const [summaryType, setSummaryType] = useState('list'); // list, table, bullets, framework
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');

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

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    setSelectedFile(file);
    setActiveTab('upload');
    setError('');
    setParsingFile(true);
    setGeneratedContent('');

    try {
      // Trích xuất text từ file
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length < 100) {
        setError('Nội dung file quá ngắn hoặc không đọc được. Vui lòng thử file khác.');
        setExtractedText('');
      } else {
        setExtractedText(text);
        setError('');
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err.message || 'Không thể đọc file. Vui lòng thử lại.');
      setExtractedText('');
    } finally {
      setParsingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setGeneratedContent('');
    setExtractedText('');
    setError('');
    setActiveTab('upload');
  };

  const handleGenerate = async () => {
    if (!selectedFile || !summaryType || !extractedText) return;

    setIsProcessing(true);
    setActiveTab('result');
    setError('');

    try {
      const result = await summarizeDocument({
        content: extractedText,
        summaryType,
        subject: '', // Có thể thêm trường để người dùng chọn môn học
        additionalInstructions: ''
      });

      if (result.success) {
        setGeneratedContent(result.content);
      } else {
        setError(result.error || 'Không thể tóm tắt tài liệu');
        setGeneratedContent('');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Đã xảy ra lỗi khi tóm tắt. Vui lòng thử lại.');
      setGeneratedContent('');
    } finally {
      setIsProcessing(false);
    }
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
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      parsingFile ? 'bg-purple-50 animate-pulse' : 'bg-emerald-50'
                    }`}>
                      {parsingFile ? (
                        <FiLoader className="w-6 h-6 text-purple-600 animate-spin" />
                      ) : (
                        <FiFile className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                        {parsingFile && <span className="ml-2 text-purple-600">• Đang đọc file...</span>}
                        {!parsingFile && extractedText && (
                          <span className="ml-2 text-green-600">• Đã tải {extractedText.length} ký tự</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      disabled={parsingFile}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
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
            disabled={!selectedFile || !summaryType || isProcessing || parsingFile || !extractedText}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            {isProcessing ? (
              <>
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang tóm tắt...</span>
              </>
            ) : parsingFile ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                <span>Đang đọc file...</span>
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
              {error && !isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <FiAlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-800 font-medium mb-2">Đã xảy ra lỗi</p>
                  <p className="text-sm text-gray-600 text-center max-w-md">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Đang phân tích và tóm tắt tài liệu...</p>
                  <p className="text-sm text-gray-500 mt-2">AI đang xử lý, vui lòng đợi</p>
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