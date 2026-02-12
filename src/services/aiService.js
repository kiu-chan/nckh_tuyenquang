import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Tạo câu hỏi trắc nghiệm từ nội dung
 */
export const generateMultipleChoiceQuestions = async ({
  content,
  numberOfQuestions = 10,
  difficulty = 'medium',
  subject = '',
  topics = [],
  instructions = ''
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const difficultyMap = {
      easy: 'dễ',
      medium: 'trung bình',
      hard: 'khó'
    };

    const prompt = `
Bạn là một giáo viên chuyên nghiệp. Hãy tạo ${numberOfQuestions} câu hỏi trắc nghiệm từ nội dung sau:

THÔNG TIN:
- Môn học: ${subject || 'Tổng hợp'}
- Chủ đề: ${topics.length > 0 ? topics.join(', ') : 'Tổng hợp'}
- Độ khó: ${difficultyMap[difficulty]}
- Số câu hỏi: ${numberOfQuestions}

NỘI DUNG TÀI LIỆU:
${content}
${instructions ? `\nHƯỚNG DẪN BỔ SUNG TỪ GIÁO VIÊN:\n${instructions}\n` : ''}
YÊU CẦU:
1. Mỗi câu hỏi phải có 4 đáp án (A, B, C, D)
2. Chỉ có 1 đáp án đúng
3. Câu hỏi phải rõ ràng, chính xác và phù hợp với độ khó đã chọn
4. Đáp án phải hợp lý và có tính nhiễu cao
5. Phải có giải thích ngắn gọn cho đáp án đúng

ĐỊNH DẠNG TRẢ VỀ (JSON):
Trả về một mảng JSON với định dạng sau (KHÔNG có markdown, KHÔNG có \`\`\`json):
[
  {
    "question": "Nội dung câu hỏi?",
    "options": [
      {"label": "A", "text": "Đáp án A"},
      {"label": "B", "text": "Đáp án B"},
      {"label": "C", "text": "Đáp án C"},
      {"label": "D", "text": "Đáp án D"}
    ],
    "correctAnswer": "A",
    "explanation": "Giải thích tại sao đáp án này đúng",
    "points": 1,
    "difficulty": "${difficulty}",
    "topic": "Tên chủ đề cụ thể"
  }
]

CHÚ Ý: Chỉ trả về JSON thuần túy, không thêm bất kỳ text nào khác.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Loại bỏ markdown nếu có
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questions = JSON.parse(text);
    return {
      success: true,
      questions,
      totalQuestions: questions.length
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      success: false,
      error: error.message || 'Không thể tạo câu hỏi từ AI',
      questions: []
    };
  }
};

/**
 * Tạo câu hỏi tự luận từ nội dung
 */
export const generateEssayQuestions = async ({
  content,
  numberOfQuestions = 5,
  difficulty = 'medium',
  subject = '',
  topics = [],
  instructions = ''
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const difficultyMap = {
      easy: 'dễ',
      medium: 'trung bình',
      hard: 'khó'
    };

    const prompt = `
Bạn là một giáo viên chuyên nghiệp. Hãy tạo ${numberOfQuestions} câu hỏi tự luận từ nội dung sau:

THÔNG TIN:
- Môn học: ${subject || 'Tổng hợp'}
- Chủ đề: ${topics.length > 0 ? topics.join(', ') : 'Tổng hợp'}
- Độ khó: ${difficultyMap[difficulty]}
- Số câu hỏi: ${numberOfQuestions}

NỘI DUNG TÀI LIỆU:
${content}
${instructions ? `\nHƯỚNG DẪN BỔ SUNG TỪ GIÁO VIÊN:\n${instructions}\n` : ''}
YÊU CẦU:
1. Câu hỏi phải yêu cầu học sinh phân tích, giải thích hoặc trình bày
2. Phù hợp với độ khó đã chọn
3. Có đáp án mẫu chi tiết
4. Có tiêu chí chấm điểm rõ ràng

ĐỊNH DẠNG TRẢ VỀ (JSON):
Trả về một mảng JSON với định dạng sau (KHÔNG có markdown, KHÔNG có \`\`\`json):
[
  {
    "question": "Nội dung câu hỏi tự luận",
    "sampleAnswer": "Đáp án mẫu chi tiết",
    "rubric": [
      "Tiêu chí 1 (2 điểm)",
      "Tiêu chí 2 (3 điểm)"
    ],
    "points": 5,
    "difficulty": "${difficulty}",
    "topic": "Tên chủ đề cụ thể"
  }
]

CHÚ Ý: Chỉ trả về JSON thuần túy, không thêm bất kỳ text nào khác.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Loại bỏ markdown nếu có
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questions = JSON.parse(text);
    return {
      success: true,
      questions,
      totalQuestions: questions.length
    };
  } catch (error) {
    console.error('Error generating essay questions:', error);
    return {
      success: false,
      error: error.message || 'Không thể tạo câu hỏi từ AI',
      questions: []
    };
  }
};

/**
 * Trích xuất text từ file PDF
 */
const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Đọc từng trang
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw new Error('Không thể đọc file PDF. Vui lòng thử file khác hoặc copy-paste nội dung.');
  }
};

/**
 * Trích xuất text từ file DOCX
 */
const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error extracting DOCX:', error);
    throw new Error('Không thể đọc file DOCX. Vui lòng thử file khác hoặc copy-paste nội dung.');
  }
};

/**
 * Trích xuất text từ file
 * Hỗ trợ: .txt, .pdf, .docx
 */
export const extractTextFromFile = async (file) => {
  try {
    // Text file
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // PDF file
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    }

    // DOCX file
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    }

    // DOC file (old format - not fully supported)
    if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      throw new Error('File .doc không được hỗ trợ. Vui lòng chuyển sang .docx hoặc copy-paste nội dung.');
    }

    throw new Error('Định dạng file không được hỗ trợ. Chỉ hỗ trợ: .txt, .pdf, .docx');
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo đề thi hỗn hợp (trắc nghiệm + tự luận)
 */
export const generateMixedExam = async ({
  content,
  multipleChoiceCount = 20,
  essayCount = 5,
  difficulty = 'medium',
  subject = '',
  topics = [],
  instructions = ''
}) => {
  try {
    // Tạo song song cả 2 loại câu hỏi
    const [mcResult, essayResult] = await Promise.all([
      generateMultipleChoiceQuestions({
        content,
        numberOfQuestions: multipleChoiceCount,
        difficulty,
        subject,
        topics,
        instructions
      }),
      generateEssayQuestions({
        content,
        numberOfQuestions: essayCount,
        difficulty,
        subject,
        topics,
        instructions
      })
    ]);

    if (!mcResult.success && !essayResult.success) {
      return {
        success: false,
        error: 'Không thể tạo câu hỏi từ AI',
        questions: []
      };
    }

    return {
      success: true,
      multipleChoiceQuestions: mcResult.questions || [],
      essayQuestions: essayResult.questions || [],
      totalQuestions: (mcResult.questions?.length || 0) + (essayResult.questions?.length || 0)
    };
  } catch (error) {
    console.error('Error generating mixed exam:', error);
    return {
      success: false,
      error: error.message || 'Không thể tạo đề thi',
      questions: []
    };
  }
};
