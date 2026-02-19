import { FiX, FiClock, FiFileText, FiDownload } from 'react-icons/fi';
import {
  IoDocumentTextOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

const examTypeNames = {
  'multiple-choice': 'Trắc nghiệm',
  essay: 'Tự luận',
  mixed: 'Trắc nghiệm + Tự luận',
};

const difficultyNames = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const statusNames = {
  draft: 'Nháp',
  published: 'Đang mở',
  completed: 'Đã hoàn thành',
};

const ExamDetailModal = ({ exam, onClose, onDownload }) => {
  if (!exam) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {exam.subject} - {examTypeNames[exam.type]} - {difficultyNames[exam.difficulty]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(exam)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              <span>Tải Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <FiClock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-blue-600">Thời gian</p>
              <p className="font-semibold text-blue-900">{exam.duration} phút</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <FiFileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-purple-600">Số câu</p>
              <p className="font-semibold text-purple-900">{exam.totalQuestions}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-600">Trạng thái</p>
              <p className="font-semibold text-green-900">{statusNames[exam.status]}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <IoDocumentTextOutline className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-orange-600">Tổng điểm</p>
              <p className="font-semibold text-orange-900">{exam.totalPoints}</p>
            </div>
          </div>

          {exam.topics && exam.topics.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Chủ đề:</p>
              <div className="flex flex-wrap gap-2">
                {exam.topics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Danh sách câu hỏi ({exam.questions?.length || 0})
          </h3>

          {(!exam.questions || exam.questions.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <IoDocumentTextOutline className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Chưa có câu hỏi nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exam.questions.map((q, index) => (
                <div key={q._id || index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">{q.question}</p>

                      {q.type === 'multiple-choice' && q.answers && (
                        <div className="space-y-2 mb-2">
                          {q.answers.map((answer, aIndex) => (
                            <div
                              key={aIndex}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                aIndex === q.correct
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-white text-gray-700 border border-gray-100'
                              }`}
                            >
                              <span className="font-medium">
                                {String.fromCharCode(65 + aIndex)}.
                              </span>
                              <span>{answer}</span>
                              {aIndex === q.correct && (
                                <IoCheckmarkCircleOutline className="w-4 h-4 ml-auto text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-200 rounded">
                          {q.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                        <span>{q.points} điểm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetailModal;
