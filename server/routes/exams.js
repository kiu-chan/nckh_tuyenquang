import express from 'express';
import Exam from '../models/Exam.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect, authorize('teacher', 'admin'));

// GET /api/exams - Lấy danh sách đề thi
router.get('/', async (req, res) => {
  try {
    const { status, subject, search } = req.query;
    const filter = { teacher: req.user._id };

    if (status) filter.status = status;
    if (subject) filter.subjectId = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/exams/stats - Thống kê
router.get('/stats', async (req, res) => {
  try {
    const teacherId = req.user._id;

    const result = await Exam.aggregate([
      { $match: { teacher: teacherId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
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

// GET /api/exams/:id - Chi tiết đề thi
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/exams - Tạo đề thi mới
router.post('/', async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      teacher: req.user._id,
    });
    res.status(201).json({ success: true, exam });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT /api/exams/:id - Cập nhật đề thi
router.put('/:id', async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }
    res.json({ success: true, exam });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PATCH /api/exams/:id/status - Thay đổi trạng thái
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      { status },
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/exams/:id/duplicate - Sao chép đề thi
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Exam.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!original) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }

    const copy = await Exam.create({
      title: `${original.title} (Bản sao)`,
      subject: original.subject,
      subjectId: original.subjectId,
      type: original.type,
      difficulty: original.difficulty,
      duration: original.duration,
      totalPoints: original.totalPoints,
      questions: original.questions,
      topics: original.topics,
      status: 'draft',
      teacher: req.user._id,
    });

    res.status(201).json({ success: true, exam: copy });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /api/exams/:id - Xóa đề thi
router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }
    res.json({ success: true, message: 'Đã xóa đề thi' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
