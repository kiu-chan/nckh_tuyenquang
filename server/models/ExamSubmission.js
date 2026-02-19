import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  answer: { type: Number }, // index đáp án cho trắc nghiệm
  essayAnswer: { type: String }, // câu trả lời tự luận
  essayScore: { type: Number }, // điểm giáo viên chấm cho câu tự luận
  essayFeedback: { type: String }, // nhận xét của giáo viên
});

const examSubmissionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 }, // tổng điểm
    mcScore: { type: Number, default: 0 }, // điểm trắc nghiệm
    essayScore: { type: Number, default: 0 }, // điểm tự luận
    totalPoints: { type: Number, default: 0 },
    totalEssayQuestions: { type: Number, default: 0 },
    gradedEssayQuestions: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'graded'],
      default: 'in_progress',
    },
    timeSpent: { type: Number, default: 0 }, // giây
  },
  { timestamps: true }
);

examSubmissionSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamSubmission = mongoose.model('ExamSubmission', examSubmissionSchema);
export default ExamSubmission;
