import express from 'express';
import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Game from '../models/Game.js';
import Document from '../models/Document.js';
import Notebook from '../models/Notebook.js';
import ExamSubmission from '../models/ExamSubmission.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// Tất cả routes yêu cầu admin
router.use(protect, authorize('admin'));

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// GET /api/admin/users - Lấy danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;

    const filter = {};
    if (role && ['teacher', 'student'].includes(role)) {
      filter.role = role;
    } else if (!role || role === 'all') {
      filter.role = { $in: ['teacher', 'student'] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password');

    res.json({ success: true, users: users.map(formatUser) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/admin/users - Tạo tài khoản mới
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
    });

    res.status(201).json({ success: true, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT /api/admin/users/:id - Cập nhật thông tin người dùng
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể chỉnh sửa tài khoản admin' });
    }

    if (name) user.name = name;

    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
      user.email = email.toLowerCase();
    }

    if (role && ['teacher', 'student'].includes(role)) {
      user.role = role;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      user.password = password;
    }

    await user.save();

    res.json({ success: true, message: 'Cập nhật thành công', user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Xóa người dùng
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể xóa tài khoản admin' });
    }

    await user.deleteOne();

    res.json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ─── DASHBOARD ROUTE ─────────────────────────────────────────

// GET /api/admin/dashboard - Dữ liệu tổng quan cho admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Thống kê nhanh
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalDocuments,
      totalExams,
      totalGames,
      pendingSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['teacher', 'student'] } }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Document.countDocuments(),
      Exam.countDocuments(),
      Game.countDocuments(),
      ExamSubmission.countDocuments({ status: 'submitted' }),
    ]);

    // Hoạt động gần đây (10 item mới nhất từ exams + documents + games)
    const [recentExams, recentDocs, recentGames] = await Promise.all([
      Exam.find().sort({ createdAt: -1 }).limit(4)
        .populate('teacher', 'name')
        .select('title subject teacher createdAt'),
      Document.find().sort({ createdAt: -1 }).limit(3)
        .populate('teacher', 'name')
        .select('name teacher createdAt'),
      Game.find().sort({ createdAt: -1 }).limit(3)
        .populate('teacher', 'name')
        .select('title teacher createdAt'),
    ]);

    const activities = [
      ...recentExams.map((e) => ({
        id: e._id,
        type: 'exam',
        user: e.teacher?.name || 'Giáo viên',
        action: 'tạo đề thi',
        subject: e.subject || e.title,
        time: e.createdAt,
      })),
      ...recentDocs.map((d) => ({
        id: d._id,
        type: 'document',
        user: d.teacher?.name || 'Giáo viên',
        action: 'tải lên tài liệu',
        subject: d.name,
        time: d.createdAt,
      })),
      ...recentGames.map((g) => ({
        id: g._id,
        type: 'game',
        user: g.teacher?.name || 'Giáo viên',
        action: 'tạo trò chơi',
        subject: g.title,
        time: g.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalDocuments,
        totalExams,
        totalGames,
        pendingSubmissions,
      },
      activities,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ─── REPORT ROUTES ───────────────────────────────────────────

// GET /api/admin/reports - Thống kê tổng quan toàn hệ thống
router.get('/reports', async (req, res) => {
  try {
    // ── Tổng số lượng song song ──────────────────────────────
    const [
      totalUsers,
      totalTeachers,
      totalStudentAccounts,
      totalExams,
      totalGames,
      totalDocuments,
      totalNotebooks,
      totalSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['teacher', 'student'] } }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      Exam.countDocuments(),
      Game.countDocuments(),
      Document.countDocuments(),
      Notebook.countDocuments(),
      ExamSubmission.countDocuments(),
    ]);

    // ── Trạng thái đề thi ────────────────────────────────────
    const examStatusResult = await Exam.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const examByStatus = { draft: 0, published: 0, completed: 0 };
    examStatusResult.forEach((r) => { examByStatus[r._id] = r.count; });

    // ── Top môn học (theo số đề thi) ─────────────────────────
    const subjectResult = await Exam.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const topSubjects = subjectResult.map((r) => ({ subject: r._id || 'Khác', count: r.count }));

    // ── Loại đề thi ──────────────────────────────────────────
    const examTypeResult = await Exam.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const examByType = {};
    examTypeResult.forEach((r) => { examByType[r._id] = r.count; });

    // ── Top giáo viên hoạt động nhất ─────────────────────────
    const teacherActivityResult = await Exam.aggregate([
      { $group: { _id: '$teacher', examCount: { $sum: 1 } } },
      { $sort: { examCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    ]);

    const topTeachers = teacherActivityResult.map((r) => ({
      name: r.teacher?.name || 'Không xác định',
      email: r.teacher?.email || '',
      examCount: r.examCount,
    }));

    // ── Tài khoản mới theo 6 tháng gần nhất ─────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userGrowthResult = await User.aggregate([
      { $match: { role: { $in: ['teacher', 'student'] }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Tạo mảng 6 tháng
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const MONTH_VI = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

    const userGrowth = months.map(({ year, month }) => {
      const teacherEntry = userGrowthResult.find(
        (r) => r._id.year === year && r._id.month === month && r._id.role === 'teacher'
      );
      const studentEntry = userGrowthResult.find(
        (r) => r._id.year === year && r._id.month === month && r._id.role === 'student'
      );
      return {
        label: MONTH_VI[month],
        teachers: teacherEntry?.count || 0,
        students: studentEntry?.count || 0,
      };
    });

    // ── Đề thi được tạo theo 6 tháng ────────────────────────
    const examGrowthResult = await Exam.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const examGrowth = months.map(({ year, month }) => {
      const entry = examGrowthResult.find(
        (r) => r._id.year === year && r._id.month === month
      );
      return { label: MONTH_VI[month], count: entry?.count || 0 };
    });

    // ── Kết quả bài nộp ──────────────────────────────────────
    const submissionStatusResult = await ExamSubmission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const submissionByStatus = { submitted: 0, graded: 0, in_progress: 0 };
    submissionStatusResult.forEach((r) => {
      if (r._id in submissionByStatus) submissionByStatus[r._id] = r.count;
    });

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalTeachers,
        totalStudentAccounts,
        totalExams,
        totalGames,
        totalDocuments,
        totalNotebooks,
        totalSubmissions,
      },
      examByStatus,
      examByType,
      topSubjects,
      topTeachers,
      userGrowth,
      examGrowth,
      submissionByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ─── EXAM ROUTES ─────────────────────────────────────────────

// GET /api/admin/exams/stats - Thống kê toàn bộ đề thi
router.get('/exams/stats', async (req, res) => {
  try {
    const result = await Exam.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = {};
    result.forEach((r) => { counts[r._id] = r.count; });

    const total = (counts.draft || 0) + (counts.published || 0) + (counts.completed || 0);

    res.json({
      success: true,
      stats: {
        total,
        draft: counts.draft || 0,
        published: counts.published || 0,
        completed: counts.completed || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/admin/exams - Lấy tất cả đề thi (toàn hệ thống)
router.get('/exams', async (req, res) => {
  try {
    const { status, search, teacherId } = req.query;

    const filter = {};
    if (status && ['draft', 'published', 'completed'].includes(status)) {
      filter.status = status;
    }
    if (teacherId) {
      filter.teacher = teacherId;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const exams = await Exam.find(filter)
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 })
      .select('title subject type difficulty duration status questions students submitted graded teacher createdAt totalPoints');

    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/admin/exams/:id - Chi tiết đề thi
router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('teacher', 'name email');
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
