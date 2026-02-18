import express from 'express';
import Notebook from '../models/Notebook.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect, authorize('teacher', 'admin'));

// GET /api/notebooks - Lấy danh sách tóm tắt
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notebooks = await Notebook.find({ teacher: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, notebooks });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/notebooks/:id - Chi tiết 1 tóm tắt
router.get('/:id', async (req, res) => {
  try {
    const notebook = await Notebook.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!notebook) {
      return res.status(404).json({ message: 'Không tìm thấy tóm tắt' });
    }
    res.json({ success: true, notebook });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/notebooks - Lưu tóm tắt mới
router.post('/', async (req, res) => {
  try {
    const { fileName, fileType, fileSize, summaryType, content } = req.body;
    const notebook = await Notebook.create({
      fileName,
      fileType,
      fileSize,
      summaryType,
      content,
      teacher: req.user._id,
    });
    res.status(201).json({ success: true, notebook });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /api/notebooks/:id - Xóa tóm tắt
router.delete('/:id', async (req, res) => {
  try {
    const notebook = await Notebook.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id,
    });
    if (!notebook) {
      return res.status(404).json({ message: 'Không tìm thấy tóm tắt' });
    }
    res.json({ success: true, message: 'Đã xóa tóm tắt' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
