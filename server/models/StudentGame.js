import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
});

const studentGameSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['flip', 'memory', 'sequence'],
      required: [true, 'Loại trò chơi là bắt buộc'],
    },
    cards: {
      type: [cardSchema],
      validate: {
        validator: (v) => v.length >= 2,
        message: 'Cần ít nhất 2 cặp thẻ',
      },
    },
    gridSize: { type: Number, default: 4 },
    plays: { type: Number, default: 0 },
    bestTime: { type: Number, default: null },
    bestScore: { type: Number, default: null },
  },
  { timestamps: true }
);

studentGameSchema.index({ student: 1, type: 1 });

const StudentGame = mongoose.model('StudentGame', studentGameSchema);
export default StudentGame;
