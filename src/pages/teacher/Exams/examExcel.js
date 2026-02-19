import * as XLSX from 'xlsx';

const difficultyMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const typeMap = { 'multiple-choice': 'Trắc nghiệm', essay: 'Tự luận', mixed: 'Hỗn hợp' };
const reverseDifficultyMap = { 'Dễ': 'easy', 'Trung bình': 'medium', 'Khó': 'hard' };
const reverseTypeMap = { 'Trắc nghiệm': 'multiple-choice', 'Tự luận': 'essay', 'Hỗn hợp': 'mixed' };

/**
 * Export an exam to an Excel file (.xlsx)
 * Format is designed to be re-importable
 */
export function exportExamToExcel(exam) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Exam Info
  const infoData = [
    ['Thông tin đề thi'],
    ['Tên đề thi', exam.title],
    ['Môn học', exam.subject],
    ['Mã môn', exam.subjectId || ''],
    ['Loại đề', typeMap[exam.type] || exam.type],
    ['Độ khó', difficultyMap[exam.difficulty] || exam.difficulty],
    ['Thời gian (phút)', exam.duration],
    ['Chủ đề', (exam.topics || []).join(', ')],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Thông tin');

  // Sheet 2: Questions
  const questionHeaders = ['STT', 'Câu hỏi', 'Loại', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Điểm'];
  const questionRows = (exam.questions || []).map((q, i) => {
    const answers = q.answers || [];
    const correctLetter = q.correct != null ? String.fromCharCode(65 + q.correct) : '';
    return [
      i + 1,
      q.question,
      q.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Tự luận',
      answers[0] || '',
      answers[1] || '',
      answers[2] || '',
      answers[3] || '',
      q.type === 'multiple-choice' ? correctLetter : '',
      q.points || 1,
    ];
  });

  const wsQuestions = XLSX.utils.aoa_to_sheet([questionHeaders, ...questionRows]);
  wsQuestions['!cols'] = [
    { wch: 5 }, { wch: 50 }, { wch: 15 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 12 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'Câu hỏi');

  const fileName = `${exam.title.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Parse an uploaded Excel file into exam data
 * Returns { info, questions } or throws error
 */
export function parseExamFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        // Parse info sheet
        const infoSheet = wb.Sheets[wb.SheetNames[0]];
        const infoRows = XLSX.utils.sheet_to_json(infoSheet, { header: 1 });

        const getValue = (label) => {
          const row = infoRows.find((r) => r[0] === label);
          return row ? (row[1] || '') : '';
        };

        const info = {
          title: getValue('Tên đề thi'),
          subject: getValue('Môn học'),
          subjectId: getValue('Mã môn'),
          type: reverseTypeMap[getValue('Loại đề')] || 'multiple-choice',
          difficulty: reverseDifficultyMap[getValue('Độ khó')] || 'medium',
          duration: parseInt(getValue('Thời gian (phút)')) || 90,
          topics: getValue('Chủ đề') ? getValue('Chủ đề').split(',').map((t) => t.trim()).filter(Boolean) : [],
        };

        // Parse questions sheet
        const questionsSheet = wb.Sheets[wb.SheetNames[1]];
        if (!questionsSheet) {
          resolve({ info, questions: [] });
          return;
        }

        const questionRows = XLSX.utils.sheet_to_json(questionsSheet, { header: 1 });
        // Skip header row
        const questions = questionRows.slice(1)
          .filter((row) => row[1]) // must have question text
          .map((row) => {
            const qType = row[2] === 'Tự luận' ? 'essay' : 'multiple-choice';
            const answers = qType === 'multiple-choice'
              ? [row[3] || '', row[4] || '', row[5] || '', row[6] || ''].filter(Boolean)
              : [];

            let correct = 0;
            if (qType === 'multiple-choice' && row[7]) {
              const letter = String(row[7]).trim().toUpperCase();
              correct = letter.charCodeAt(0) - 65;
              if (correct < 0 || correct >= answers.length) correct = 0;
            }

            return {
              question: String(row[1]),
              type: qType,
              answers,
              correct: qType === 'multiple-choice' ? correct : undefined,
              points: parseInt(row[8]) || 1,
            };
          });

        resolve({ info, questions });
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsArrayBuffer(file);
  });
}
