import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Document from '../models/Document.js';
import Notebook from '../models/Notebook.js';
import Game from '../models/Game.js';

const router = express.Router();

// GET /api/public/stats - Thống kê công khai cho trang chủ
router.get('/stats', async (req, res) => {
  try {
    const [teacherCount, studentCount, documentCount, examCount, gameCount, notebookCount] = await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      Student.countDocuments(),
      Document.countDocuments(),
      Exam.countDocuments(),
      Game.countDocuments(),
      Notebook.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: {
        teachers: teacherCount,
        students: studentCount,
        documents: documentCount,
        exams: examCount,
        games: gameCount,
        notebooks: notebookCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
