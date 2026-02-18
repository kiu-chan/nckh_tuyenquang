import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'essay'], default: 'multiple-choice' },
  answers: [{ type: String }],
  correct: { type: Number },
  points: { type: Number, default: 1 },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Môn học là bắt buộc'],
    },
    subjectId: { type: String },
    type: {
      type: String,
      enum: ['multiple-choice', 'essay', 'mixed'],
      default: 'multiple-choice',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    duration: { type: Number, default: 90 },
    totalPoints: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft',
    },
    questions: [examQuestionSchema],
    topics: [{ type: String }],

    // Schedule
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    className: { type: String },

    // Tracking
    students: { type: Number, default: 0 },
    submitted: { type: Number, default: 0 },
    graded: { type: Number, default: 0 },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

examSchema.index({ teacher: 1, status: 1 });

examSchema.virtual('totalQuestions').get(function () {
  return this.questions?.length || 0;
});

examSchema.set('toJSON', { virtuals: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
