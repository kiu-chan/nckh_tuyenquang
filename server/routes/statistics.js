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

// GET /api/statistics/overview - Thống kê tổng quan
router.get('/overview', async (req, res) => {
  try {
    const { className } = req.query;
    const filter = { teacher: req.user._id };
    if (className && className !== 'all') {
      filter.className = className;
    }

    const students = await Student.find(filter);
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.json({
        success: true,
        stats: {
          avgScore: 0,
          attendanceRate: 0,
          assignmentRate: 0,
          excellentCount: 0,
        },
        totalStudents: 0,
      });
    }

    const avgScore = students.reduce((sum, s) => sum + (s.score || 0), 0) / totalStudents;
    const attendanceRate = students.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents;

    const totalAssignmentsCompleted = students.reduce((sum, s) => sum + (s.assignmentsCompleted || 0), 0);
    const totalAssignmentsTotal = students.reduce((sum, s) => sum + (s.assignmentsTotal || 0), 0);
    const assignmentRate = totalAssignmentsTotal > 0
      ? Math.round((totalAssignmentsCompleted / totalAssignmentsTotal) * 100)
      : 0;

    const excellentCount = students.filter(s => (s.score || 0) >= 9.0).length;

    res.json({
      success: true,
      stats: {
        avgScore: Math.round(avgScore * 10) / 10,
        attendanceRate: Math.round(attendanceRate),
        assignmentRate,
        excellentCount,
      },
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/score-distribution - Phân bố điểm số
router.get('/score-distribution', async (req, res) => {
  try {
    const { className } = req.query;
    const filter = { teacher: req.user._id };
    if (className && className !== 'all') {
      filter.className = className;
    }

    const students = await Student.find(filter);
    const total = students.length;

    const ranges = [
      { range: '9.0 - 10', min: 9.0, max: 10.1, color: 'bg-emerald-500' },
      { range: '8.0 - 8.9', min: 8.0, max: 9.0, color: 'bg-blue-500' },
      { range: '7.0 - 7.9', min: 7.0, max: 8.0, color: 'bg-yellow-500' },
      { range: '6.0 - 6.9', min: 6.0, max: 7.0, color: 'bg-orange-500' },
      { range: '< 6.0', min: 0, max: 6.0, color: 'bg-red-500' },
    ];

    const distribution = ranges.map(r => {
      const count = students.filter(s => (s.score || 0) >= r.min && (s.score || 0) < r.max).length;
      return {
        range: r.range,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: r.color,
      };
    });

    res.json({ success: true, distribution, totalStudents: total });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/class-comparison - So sánh giữa các lớp
router.get('/class-comparison', async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id });

    const classMap = {};
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'];

    students.forEach(s => {
      const classNames = Array.isArray(s.className) ? s.className : [s.className];
      classNames.forEach(cn => {
        if (!classMap[cn]) {
          classMap[cn] = { scores: [], attendances: [], assignmentsCompleted: 0, assignmentsTotal: 0, count: 0 };
        }
        const cls = classMap[cn];
        cls.scores.push(s.score || 0);
        cls.attendances.push(s.attendance || 0);
        cls.assignmentsCompleted += s.assignmentsCompleted || 0;
        cls.assignmentsTotal += s.assignmentsTotal || 0;
        cls.count++;
      });
    });

    const comparison = Object.entries(classMap).map(([name, data], index) => ({
      class: name,
      avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.count) * 10) / 10,
      attendance: Math.round(data.attendances.reduce((a, b) => a + b, 0) / data.count),
      assignments: data.assignmentsTotal > 0
        ? Math.round((data.assignmentsCompleted / data.assignmentsTotal) * 100)
        : 0,
      students: data.count,
      color: colors[index % colors.length],
    }));

    comparison.sort((a, b) => b.avgScore - a.avgScore);

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/top-students - Học sinh xuất sắc
router.get('/top-students', async (req, res) => {
  try {
    const { className, limit = 5 } = req.query;
    const filter = { teacher: req.user._id };
    if (className && className !== 'all') {
      filter.className = className;
    }

    const topStudents = await Student.find(filter)
      .sort({ score: -1 })
      .limit(parseInt(limit));

    const result = topStudents.map((s, index) => ({
      id: s._id,
      name: s.name,
      class: Array.isArray(s.className) ? s.className.join(', ') : s.className,
      score: s.score || 0,
      rank: index + 1,
      attendance: s.attendance || 0,
    }));

    res.json({ success: true, topStudents: result });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/classes - Danh sách lớp
router.get('/classes', async (req, res) => {
  try {
    const classes = await Student.distinct('className', { teacher: req.user._id });
    res.json({ success: true, classes: classes.sort() });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/subject-performance - Thành tích theo môn
router.get('/subject-performance', async (req, res) => {
  try {
    const { className } = req.query;
    const filter = { teacher: req.user._id };
    if (className && className !== 'all') {
      filter.className = className;
    }

    const exams = await Exam.find(filter);

    const subjectMap = {};
    exams.forEach(exam => {
      if (!exam.subject) return;
      if (!subjectMap[exam.subject]) {
        subjectMap[exam.subject] = { totalPoints: 0, count: 0 };
      }
      subjectMap[exam.subject].totalPoints += exam.totalPoints || 0;
      subjectMap[exam.subject].count++;
    });

    const performance = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      score: data.count > 0 ? Math.round((data.totalPoints / data.count) * 10) / 10 : 0,
    }));

    performance.sort((a, b) => b.score - a.score);

    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/statistics/recent-activity - Hoạt động gần đây
router.get('/recent-activity', async (req, res) => {
  try {
    const activities = [];

    // Recent exams
    const recentExams = await Exam.find({ teacher: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    recentExams.forEach(exam => {
      activities.push({
        id: exam._id,
        type: 'exam',
        title: exam.title,
        class: exam.className || 'Tất cả',
        avgScore: exam.totalPoints,
        date: exam.createdAt,
      });
    });

    // Recent games
    const recentGames = await Game.find({ teacher: req.user._id })
      .sort({ createdAt: -1 })
      .limit(2);

    recentGames.forEach(game => {
      activities.push({
        id: game._id,
        type: 'game',
        title: game.title,
        class: game.subject || 'Tổng hợp',
        plays: game.plays,
        date: game.createdAt,
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, activities: activities.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
