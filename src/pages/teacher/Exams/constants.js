export const subjects = [
  { id: 'all', name: 'Tất cả môn' },
  // Khoa học tự nhiên
  { id: 'math', name: 'Toán học' },
  { id: 'physics', name: 'Vật lý' },
  { id: 'chemistry', name: 'Hóa học' },
  { id: 'biology', name: 'Sinh học' },
  // Khoa học xã hội
  { id: 'literature', name: 'Ngữ văn' },
  { id: 'history', name: 'Lịch sử' },
  { id: 'geography', name: 'Địa lý' },
  { id: 'civic_education', name: 'Giáo dục công dân' },
  // Ngoại ngữ
  { id: 'english', name: 'Tiếng Anh' },
  // Công nghệ & Tin học
  { id: 'informatics', name: 'Tin học' },
  { id: 'technology', name: 'Công nghệ' },
  // Nghệ thuật & Thể chất
  { id: 'music', name: 'Âm nhạc' },
  { id: 'art', name: 'Mỹ thuật' },
  { id: 'physical_education', name: 'Giáo dục thể chất' },
  // Khác
  { id: 'national_defense', name: 'Giáo dục quốc phòng' },
];

/** Danh sách môn (không có "Tất cả môn") dùng cho form chọn */
export const subjectOptions = subjects.filter((s) => s.id !== 'all');
