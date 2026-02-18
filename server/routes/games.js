import express from 'express';
import Game from '../models/Game.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect, authorize('teacher', 'admin'));

// GET /api/games - Lấy danh sách games
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { teacher: req.user._id };
    if (type) filter.type = type;

    const games = await Game.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/games/stats - Thống kê tổng
router.get('/stats', async (req, res) => {
  try {
    const teacherId = req.user._id;

    const result = await Game.aggregate([
      { $match: { teacher: teacherId } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalPlays: { $sum: '$plays' },
          totalScore: { $sum: '$totalScore' },
          totalPlaysForAvg: { $sum: { $cond: [{ $gt: ['$plays', 0] }, '$plays', 0] } },
        },
      },
    ]);

    const data = result[0] || { totalGames: 0, totalPlays: 0, totalScore: 0, totalPlaysForAvg: 0 };
    const avgScore = data.totalPlaysForAvg > 0
      ? Math.round((data.totalScore / data.totalPlaysForAvg) * 10) / 10
      : 0;

    res.json({
      success: true,
      stats: {
        totalGames: data.totalGames,
        totalPlays: data.totalPlays,
        avgScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/games/:id - Chi tiết 1 game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy trò chơi' });
    }
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/games - Tạo game mới
router.post('/', async (req, res) => {
  try {
    const game = await Game.create({
      ...req.body,
      teacher: req.user._id,
    });
    res.status(201).json({ success: true, game });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT /api/games/:id - Cập nhật game
router.put('/:id', async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy trò chơi' });
    }
    res.json({ success: true, game });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/games/:id/play - Ghi nhận lượt chơi + điểm
router.post('/:id/play', async (req, res) => {
  try {
    const { score } = req.body;
    const game = await Game.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy trò chơi' });
    }

    game.plays += 1;
    if (typeof score === 'number') {
      game.totalScore += score;
    }
    game.lastPlayed = new Date();
    await game.save();

    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /api/games/:id - Xóa game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy trò chơi' });
    }
    res.json({ success: true, message: 'Đã xóa trò chơi' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;
