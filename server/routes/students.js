import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// All routes require auth + teacher role
router.use(protect, authorize('teacher', 'admin'));

// GET /api/students - Lấy danh sách học sinh của giáo viên
router.get('/', async (req, res) => {
  try {
    const { className, status, search } = req.query;
    const filter = { teacher: req.user._id };

    if (className) filter.className = className;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/students/stats - Thống kê
router.get('/stats', async (req, res) => {
  try {
    const teacherId = req.user._id;

    const total = await Student.countDocuments({ teacher: teacherId });
    const active = await Student.countDocuments({ teacher: teacherId, status: 'active' });

    const scoreAgg = await Student.aggregate([
      { $match: { teacher: teacherId, status: 'active' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          avgAttendance: { $avg: '$attendance' },
          excellent: { $sum: { $cond: [{ $gte: ['$score', 8.5] }, 1, 0] } },
        },
      },
    ]);

    const stats = scoreAgg[0] || { avgScore: 0, avgAttendance: 0, excellent: 0 };

    // Lấy danh sách lớp
    const classes = await Student.aggregate([
      { $match: { teacher: teacherId } },
      { $group: { _id: '$className', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        total,
        active,
        excellent: stats.excellent,
        avgScore: Math.round(stats.avgScore * 10) / 10,
        avgAttendance: Math.round(stats.avgAttendance),
        classes: classes.map((c) => ({ name: c._id, count: c.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/students/check-email - Kiểm tra email có tồn tại trong hệ thống
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('name email avatar role');

    if (user) {
      res.json({ success: true, exists: true, user: { name: user.name, email: user.email, role: user.role } });
    } else {
      res.json({ success: true, exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/students/:id - Lấy chi tiết 1 học sinh
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      teacher: req.user._id,
    });

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/students - Thêm học sinh mới (liên kết hoặc tạo tài khoản User)
router.post('/', async (req, res) => {
  try {
    const { email, name, password, ...rest } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    // Tìm hoặc tạo tài khoản User
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewAccount = false;

    if (!user) {
      // Tạo tài khoản mới với mật khẩu do giáo viên cung cấp
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
        role: 'student',
      });
      isNewAccount = true;
    }

    // Kiểm tra học sinh đã được giáo viên này thêm chưa
    const existingStudent = await Student.findOne({
      email: email.toLowerCase(),
      teacher: req.user._id,
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Học sinh với email này đã tồn tại trong danh sách của bạn' });
    }

    const student = await Student.create({
      ...rest,
      name,
      email: email.toLowerCase(),
      user: user._id,
      teacher: req.user._id,
    });

    res.status(201).json({ success: true, student, isNewAccount });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT /api/students/:id - Cập nhật học sinh
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    res.json({ success: true, student });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /api/students/:id - Xóa học sinh
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id,
    });

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    res.json({ success: true, message: 'Đã xóa học sinh' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
