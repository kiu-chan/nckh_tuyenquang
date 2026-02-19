import React, { useState } from 'react';
import {
  IoSparklesOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoAddCircleOutline
} from 'react-icons/io5';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';
import {
  generateMultipleChoiceQuestions,
  generateEssayQuestions,
  generateMixedExam,
  extractTextFromFile
} from '../services/aiService';
import MathDisplay from './MathDisplay';

const AIExamCreator = ({ examType, subject, difficulty, onQuestionsGenerated, onClose }) => {
  const [step, setStep] = useState(1); // 1: Upload/Input, 2: Preview Questions
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState({
    multipleChoice: 20,
    essay: 5
  });
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState({
    multipleChoice: [],
    essay: []
  });

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Kiểm tra định dạng file
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const validExtensions = ['.txt', '.pdf', '.docx'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      setError('Định dạng file không được hỗ trợ. Chỉ hỗ trợ: .txt, .pdf, .docx');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setParsingFile(true);

    try {
      // Trích xuất text từ file
      const extractedText = await extractTextFromFile(selectedFile);

      if (!extractedText || extractedText.trim().length < 50) {
        setError('Nội dung file quá ngắn hoặc không đọc được. Vui lòng thử file khác.');
        setFile(null);
        setContent('');
      } else {
        setContent(extractedText);
        setError('');
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err.message || 'Không thể đọc file. Vui lòng thử lại hoặc copy-paste nội dung.');
      setFile(null);
      setContent('');
    } finally {
      setParsingFile(false);
    }
  };

  const handleAddTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const handleGenerateQuestions = async () => {
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung hoặc upload file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (examType === 'multiple-choice') {
        result = await generateMultipleChoiceQuestions({
          content,
          numberOfQuestions: numberOfQuestions.multipleChoice,
          difficulty,
          subject,
          topics,
          instructions
        });

        if (result.success) {
          setGeneratedQuestions({
            multipleChoice: result.questions,
            essay: []
          });
        }
      } else if (examType === 'essay') {
        result = await generateEssayQuestions({
          content,
          numberOfQuestions: numberOfQuestions.essay,
          difficulty,
          subject,
          topics,
          instructions
        });

        if (result.success) {
          setGeneratedQuestions({
            multipleChoice: [],
            essay: result.questions
          });
        }
      } else if (examType === 'mixed') {
        result = await generateMixedExam({
          content,
          multipleChoiceCount: numberOfQuestions.multipleChoice,
          essayCount: numberOfQuestions.essay,
          difficulty,
          subject,
          topics,
          instructions
        });

        if (result.success) {
          setGeneratedQuestions({
            multipleChoice: result.multipleChoiceQuestions || [],
            essay: result.essayQuestions || []
          });
        }
      }

      if (result.success) {
        setStep(2);
      } else {
        setError(result.error || 'Không thể tạo câu hỏi. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Đã xảy ra lỗi khi tạo câu hỏi. Vui lòng kiểm tra API key và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = () => {
    onQuestionsGenerated({
      multipleChoiceQuestions: generatedQuestions.multipleChoice,
      essayQuestions: generatedQuestions.essay,
      totalQuestions: generatedQuestions.multipleChoice.length + generatedQuestions.essay.length
    });
  };

  const handleRemoveQuestion = (type, index) => {
    setGeneratedQuestions(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <IoSparklesOutline className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Tạo đề thi bằng AI</h3>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'Bước 1: Cung cấp tài liệu' : 'Bước 2: Xem trước và chỉnh sửa'}
          </p>
        </div>
      </div>

      {step === 1 && (
        <>
          {/* Upload File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              1. Upload tài liệu hoặc nhập nội dung
            </label>

            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              parsingFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'
            }`}>
              <input
                type="file"
                id="file-upload"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={parsingFile}
              />
              <label
                htmlFor="file-upload"
                className={`${parsingFile ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center`}
              >
                <div className={`w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 ${
                  parsingFile ? 'animate-pulse' : ''
                }`}>
                  {parsingFile ? (
                    <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
                  ) : (
                    <IoCloudUploadOutline className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <p className="text-gray-700 font-medium mb-1">
                  {parsingFile ? 'Đang đọc file...' : file ? file.name : 'Nhấn để chọn file'}
                </p>
                <p className="text-sm text-gray-500">
                  {parsingFile
                    ? 'Vui lòng đợi, đang trích xuất nội dung...'
                    : 'Hỗ trợ file: .txt, .pdf, .docx'}
                </p>
                {file && !parsingFile && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Đã tải {content.length} ký tự
                  </p>
                )}
              </label>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center mb-2">
                <span className="text-sm text-gray-500">hoặc</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Copy và paste nội dung tài liệu vào đây..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              2. Chủ đề cần tạo câu hỏi (tùy chọn)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                placeholder="VD: Hàm số bậc 2, Phương trình..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <IoAddCircleOutline className="w-5 h-5" />
              </button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {topic}
                    <button
                      onClick={() => handleRemoveTopic(topic)}
                      className="hover:text-purple-900"
                    >
                      <IoCloseCircleOutline className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Hướng dẫn và yêu cầu bổ sung (tùy chọn)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="VD:
- Tập trung vào ứng dụng thực tế
- Thêm câu hỏi về công thức
- Câu hỏi phải phù hợp với học sinh lớp 10
- Đáp án nên có giải thích chi tiết
- Tránh câu hỏi quá khó hoặc quá dễ"
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Mẹo: Càng cụ thể, AI càng tạo câu hỏi chất lượng cao. Bạn có thể yêu cầu về định dạng, nội dung, mức độ, phong cách...
            </p>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              4. Số lượng câu hỏi
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(examType === 'multiple-choice' || examType === 'mixed') && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Trắc nghiệm</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfQuestions.multipleChoice}
                    onChange={(e) => setNumberOfQuestions(prev => ({
                      ...prev,
                      multipleChoice: parseInt(e.target.value) || 1
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              {(examType === 'essay' || examType === 'mixed') && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Tự luận</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfQuestions.essay}
                    onChange={(e) => setNumberOfQuestions(prev => ({
                      ...prev,
                      essay: parseInt(e.target.value) || 1
                    }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || parsingFile || !content.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Đang tạo câu hỏi...</span>
                </>
              ) : parsingFile ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Đang đọc file...</span>
                </>
              ) : (
                <>
                  <IoSparklesOutline className="w-5 h-5" />
                  <span>Tạo câu hỏi với AI</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Preview Questions */}
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {/* Multiple Choice Questions */}
            {generatedQuestions.multipleChoice.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                  Câu hỏi trắc nghiệm ({generatedQuestions.multipleChoice.length})
                </h4>
                <div className="space-y-3">
                  {generatedQuestions.multipleChoice.map((q, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium text-gray-800 flex-1">
                          <span className="text-purple-600 mr-2">Câu {index + 1}:</span>
                          <MathDisplay text={q.question} />
                        </p>
                        <button
                          onClick={() => handleRemoveQuestion('multipleChoice', index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <IoTrashOutline className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2 mb-3">
                        {q.options.map((option) => (
                          <div
                            key={option.label}
                            className={`p-2 rounded ${
                              option.label === q.correctAnswer
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{option.label}.</span>{' '}
                            <MathDisplay text={option.text} />
                            {option.label === q.correctAnswer && (
                              <IoCheckmarkCircleOutline className="inline-block ml-2 w-4 h-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                        <strong>Giải thích:</strong> <MathDisplay text={q.explanation} />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-200 rounded">{q.topic}</span>
                        <span>{q.points} điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essay Questions */}
            {generatedQuestions.essay.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5 text-blue-600" />
                  Câu hỏi tự luận ({generatedQuestions.essay.length})
                </h4>
                <div className="space-y-3">
                  {generatedQuestions.essay.map((q, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium text-gray-800 flex-1">
                          <span className="text-blue-600 mr-2">Câu {index + 1}:</span>
                          <MathDisplay text={q.question} />
                        </p>
                        <button
                          onClick={() => handleRemoveQuestion('essay', index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <IoTrashOutline className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs mb-3">
                        <div className="bg-green-50 p-3 rounded border border-green-200 mb-2">
                          <strong className="text-green-800">Đáp án mẫu:</strong>
                          <p className="text-gray-700 mt-1">{q.sampleAnswer}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          <strong className="text-yellow-800">Tiêu chí chấm:</strong>
                          <ul className="list-disc list-inside text-gray-700 mt-1">
                            {q.rubric.map((criterion, i) => (
                              <li key={i}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-200 rounded">{q.topic}</span>
                        <span>{q.points} điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Tổng số câu hỏi đã tạo</p>
                <p className="text-2xl font-bold text-purple-600">
                  {generatedQuestions.multipleChoice.length + generatedQuestions.essay.length}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <IoRefreshOutline className="w-4 h-4" />
                <span>Tạo lại</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleSaveQuestions}
              disabled={generatedQuestions.multipleChoice.length === 0 && generatedQuestions.essay.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircleOutline className="w-5 h-5" />
              <span>Lưu đề thi</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIExamCreator;
