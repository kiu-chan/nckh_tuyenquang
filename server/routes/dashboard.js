import express from 'express';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Game from '../models/Game.js';
import Document from '../models/Document.js';
import Notebook from '../models/Notebook.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect, authorize('teacher', 'admin'));

// GET /api/dashboard - Dữ liệu tổng quan cho dashboard
router.get('/', async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Đếm số lượng song song
    const [studentCount, documentCount, examCount, gameCount, notebookCount] = await Promise.all([
      Student.countDocuments({ teacher: teacherId }),
      Document.countDocuments({ teacher: teacherId }),
      Exam.countDocuments({ teacher: teacherId }),
      Game.countDocuments({ teacher: teacherId }),
      Notebook.countDocuments({ teacher: teacherId }),
    ]);

    // Đề thi chờ chấm (status = published, có submitted > graded)
    const pendingGrading = await Exam.countDocuments({
      teacher: teacherId,
      status: 'published',
      $expr: { $gt: ['$submitted', '$graded'] },
    });

    res.json({
      success: true,
      stats: {
        students: studentCount,
        documents: documentCount,
        exams: examCount,
        games: gameCount,
        notebooks: notebookCount,
        pendingGrading,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/dashboard/recent-activities - Hoạt động gần đây
router.get('/recent-activities', async (req, res) => {
  try {
    const teacherId = req.user._id;
    const activities = [];

    // Lấy song song các hoạt động gần đây
    const [recentExams, recentDocuments, recentGames, recentNotebooks] = await Promise.all([
      Exam.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(3),
      Document.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(3),
      Game.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(3),
      Notebook.find({ teacher: teacherId }).sort({ createdAt: -1 }).limit(3),
    ]);

    recentExams.forEach(exam => {
      activities.push({
        id: exam._id,
        type: 'exam',
        title: `Đã tạo đề thi "${exam.title}"`,
        time: exam.createdAt,
      });
    });

    recentDocuments.forEach(doc => {
      activities.push({
        id: doc._id,
        type: 'document',
        title: `Đã tải lên tài liệu "${doc.name}"`,
        time: doc.createdAt,
      });
    });

    recentGames.forEach(game => {
      activities.push({
        id: game._id,
        type: 'game',
        title: `Đã tạo trò chơi "${game.title}"`,
        time: game.createdAt,
      });
    });

    recentNotebooks.forEach(nb => {
      activities.push({
        id: nb._id,
        type: 'notebook',
        title: `Đã tóm tắt "${nb.fileName}"`,
        time: nb.createdAt,
      });
    });

    // Sắp xếp theo thời gian mới nhất
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, activities: activities.slice(0, 8) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/dashboard/upcoming - Công việc sắp tới (đề thi đã lên lịch)
router.get('/upcoming', async (req, res) => {
  try {
    const teacherId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const upcomingExams = await Exam.find({
      teacher: teacherId,
      status: { $in: ['draft', 'published'] },
      scheduledDate: { $gte: today },
    })
      .sort({ scheduledDate: 1 })
      .limit(5);

    const tasks = upcomingExams.map(exam => ({
      id: exam._id,
      title: `${exam.title} - ${exam.className || 'Chưa xếp lớp'}`,
      deadline: exam.scheduledDate,
      time: exam.scheduledTime || '',
      type: exam.type,
      status: exam.status,
    }));

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
