import express from 'express';
import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import ExamSubmission from '../models/ExamSubmission.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect, authorize('student'));

// Helper: tìm Student document từ User._id
const getStudent = async (userId) => {
  return Student.findOne({ user: userId, status: 'active' });
};

// GET /api/student-portal/classroom - Thông tin lớp học
router.get('/classroom', async (req, res) => {
  try {
    const student = await getStudent(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin học sinh' });
    }

    // Lấy thông tin giáo viên
    const teacher = await User.findById(student.teacher).select('name email avatar');

    // Lấy bạn cùng lớp
    const classmates = await Student.find({
      teacher: student.teacher,
      className: student.className,
      status: 'active',
      _id: { $ne: student._id },
    }).select('name email');

    res.json({
      success: true,
      classroom: {
        className: student.className,
        studentName: student.name,
        studentId: student._id,
        teacher: teacher
          ? { name: teacher.name, email: teacher.email, avatar: teacher.avatar }
          : null,
        classmates,
        totalStudents: classmates.length + 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/student-portal/exams - Danh sách bài tập được giao
router.get('/exams', async (req, res) => {
  try {
    const student = await getStudent(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin học sinh' });
    }

    // Tìm exams được giao cho học sinh này
    const exams = await Exam.find({
      status: 'published',
      teacher: student.teacher,
      $or: [
        { assignmentType: 'class', assignedClasses: student.className },
        { assignmentType: 'student', assignedStudents: student._id },
      ],
    })
      .select('title subject type difficulty duration totalPoints deadline questions assignmentType assignedClasses scheduledDate scheduledTime')
      .sort({ createdAt: -1 });

    // Lấy submissions của học sinh
    const examIds = exams.map((e) => e._id);
    const submissions = await ExamSubmission.find({
      exam: { $in: examIds },
      student: student._id,
    }).select('exam status score mcScore essayScore totalPoints submittedAt totalEssayQuestions gradedEssayQuestions');

    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.exam.toString()] = s;
    });

    const examList = exams.map((exam) => {
      const submission = submissionMap[exam._id.toString()];
      return {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        type: exam.type,
        difficulty: exam.difficulty,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        totalQuestions: exam.questions?.length || 0,
        deadline: exam.deadline,
        scheduledDate: exam.scheduledDate,
        scheduledTime: exam.scheduledTime,
        submission: submission
          ? {
              status: submission.status,
              score: submission.score,
              mcScore: submission.mcScore || 0,
              essayScore: submission.essayScore || 0,
              totalPoints: submission.totalPoints,
              submittedAt: submission.submittedAt,
              totalEssayQuestions: submission.totalEssayQuestions || 0,
              gradedEssayQuestions: submission.gradedEssayQuestions || 0,
            }
          : null,
      };
    });

    res.json({ success: true, exams: examList });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/student-portal/exams/:id - Chi tiết đề thi (để làm bài)
router.get('/exams/:id', async (req, res) => {
  try {
    const student = await getStudent(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin học sinh' });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      status: 'published',
      teacher: student.teacher,
      $or: [
        { assignmentType: 'class', assignedClasses: student.className },
        { assignmentType: 'student', assignedStudents: student._id },
      ],
    });

    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }

    // Kiểm tra hạn nộp
    if (exam.deadline && new Date(exam.deadline) < new Date()) {
      return res.status(400).json({ message: 'Đã hết hạn nộp bài' });
    }

    // Kiểm tra đã nộp chưa
    const existingSubmission = await ExamSubmission.findOne({
      exam: exam._id,
      student: student._id,
    });

    if (existingSubmission && existingSubmission.status === 'submitted') {
      return res.status(400).json({ message: 'Bạn đã nộp bài thi này rồi' });
    }

    // Trả về questions KHÔNG kèm correct answer
    const questions = exam.questions.map((q, index) => ({
      index,
      question: q.question,
      type: q.type,
      answers: q.answers,
      points: q.points,
    }));

    // Tạo hoặc lấy submission đang làm
    let submission = existingSubmission;
    if (!submission) {
      submission = await ExamSubmission.create({
        exam: exam._id,
        student: student._id,
        totalPoints: exam.totalPoints,
        startedAt: new Date(),
      });
    }

    res.json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        type: exam.type,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        questions,
      },
      submission: {
        _id: submission._id,
        startedAt: submission.startedAt,
        answers: submission.answers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /api/student-portal/exams/:id/submit - Nộp bài
router.post('/exams/:id/submit', async (req, res) => {
  try {
    const student = await getStudent(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin học sinh' });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      status: 'published',
      teacher: student.teacher,
    });

    if (!exam) {
      return res.status(404).json({ message: 'Không tìm thấy đề thi' });
    }

    const submission = await ExamSubmission.findOne({
      exam: exam._id,
      student: student._id,
    });

    if (!submission) {
      return res.status(400).json({ message: 'Chưa bắt đầu làm bài' });
    }

    if (submission.status === 'submitted') {
      return res.status(400).json({ message: 'Bạn đã nộp bài rồi' });
    }

    const { answers, timeSpent } = req.body;

    // Tự động chấm điểm trắc nghiệm
    let mcRawScore = 0;
    const totalPoints = exam.totalPoints;
    let totalEssayQuestions = 0;

    if (answers && Array.isArray(answers)) {
      answers.forEach((ans) => {
        const question = exam.questions[ans.questionIndex];
        if (!question) return;

        if (question.type === 'multiple-choice' && ans.answer !== undefined) {
          if (ans.answer === question.correct) {
            mcRawScore += question.points || 1;
          }
        } else if (question.type === 'essay') {
          totalEssayQuestions++;
        }
      });
    }

    // Tính điểm trắc nghiệm theo thang totalPoints
    const totalQuestionPoints = exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const mcPoints = exam.questions
      .filter((q) => q.type === 'multiple-choice')
      .reduce((sum, q) => sum + (q.points || 1), 0);
    const mcScore = totalQuestionPoints > 0
      ? Math.round((mcRawScore / totalQuestionPoints) * totalPoints * 100) / 100
      : 0;

    const hasEssay = totalEssayQuestions > 0;

    submission.answers = answers || [];
    submission.mcScore = mcScore;
    submission.essayScore = 0;
    submission.score = mcScore; // tạm = mcScore, sẽ cộng essayScore khi chấm
    submission.totalPoints = totalPoints;
    submission.totalEssayQuestions = totalEssayQuestions;
    submission.gradedEssayQuestions = 0;
    submission.timeSpent = timeSpent || 0;
    submission.submittedAt = new Date();
    submission.status = hasEssay ? 'submitted' : 'graded';
    await submission.save();

    // Cập nhật exam submitted count
    await Exam.findByIdAndUpdate(exam._id, { $inc: { submitted: 1 } });

    // Trả về kết quả
    const results = exam.questions.map((q, index) => {
      const studentAnswer = (answers || []).find((a) => a.questionIndex === index);
      return {
        index,
        question: q.question,
        type: q.type,
        answers: q.answers,
        correct: q.type === 'multiple-choice' ? q.correct : null,
        studentAnswer: studentAnswer?.answer,
        studentEssay: studentAnswer?.essayAnswer,
        isCorrect:
          q.type === 'multiple-choice' ? studentAnswer?.answer === q.correct : null,
        points: q.points || 1,
      };
    });

    res.json({
      success: true,
      result: {
        score: finalScore,
        totalPoints,
        status: submission.status,
        results,
        timeSpent: submission.timeSpent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /api/student-portal/dashboard - Tổng quan trang chủ học sinh
router.get('/dashboard', async (req, res) => {
  try {
    const student = await getStudent(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin học sinh' });
    }

    const teacher = await User.findById(student.teacher).select('name');

    // Lấy tất cả bài thi được giao cho học sinh
    const exams = await Exam.find({
      status: 'published',
      teacher: student.teacher,
      $or: [
        { assignmentType: 'class', assignedClasses: student.className },
        { assignmentType: 'student', assignedStudents: student._id },
      ],
    }).select('_id title subject type difficulty duration totalPoints deadline scheduledDate scheduledTime').lean();

    const examIds = exams.map((e) => e._id);

    // Lấy tất cả submissions của học sinh
    const submissions = await ExamSubmission.find({
      student: student._id,
      exam: { $in: examIds },
    }).select('exam status score totalPoints submittedAt').lean();

    const submissionMap = {};
    submissions.forEach((s) => { submissionMap[s.exam.toString()] = s; });

    // Phân loại
    const completedSubmissions = submissions.filter((s) => s.status === 'submitted' || s.status === 'graded');
    const pendingExams = exams.filter((e) => !submissionMap[e._id.toString()]);

    // Điểm trung bình
    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && s.totalPoints > 0
    );
    const avgScore =
      gradedSubmissions.length > 0
        ? Math.round(
            (gradedSubmissions.reduce((sum, s) => sum + (s.score / s.totalPoints) * 10, 0) /
              gradedSubmissions.length) *
              10
          ) / 10
        : null;

    // Bài thi sắp tới (chưa làm, sắp đến deadline hoặc có scheduled)
    const now = new Date();
    const upcoming = pendingExams
      .filter((e) => !e.deadline || new Date(e.deadline) > now)
      .sort((a, b) => {
        const da = a.deadline ? new Date(a.deadline) : new Date('2099-01-01');
        const db = b.deadline ? new Date(b.deadline) : new Date('2099-01-01');
        return da - db;
      })
      .slice(0, 5)
      .map((e) => ({
        _id: e._id,
        title: e.title,
        subject: e.subject,
        type: e.type,
        difficulty: e.difficulty,
        duration: e.duration,
        totalPoints: e.totalPoints,
        deadline: e.deadline,
      }));

    // Bài nộp gần đây nhất
    const recentSubmissions = await ExamSubmission.find({
      student: student._id,
      status: { $in: ['submitted', 'graded'] },
    })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('exam', 'title subject totalPoints')
      .select('exam status score totalPoints submittedAt')
      .lean();

    res.json({
      success: true,
      student: {
        name: student.name,
        className: student.className,
        teacher: teacher ? teacher.name : null,
      },
      stats: {
        totalExams: exams.length,
        completedExams: completedSubmissions.length,
        pendingExams: pendingExams.length,
        avgScore,
      },
      upcomingExams: upcoming,
      recentSubmissions: recentSubmissions.map((s) => ({
        _id: s._id,
        examTitle: s.exam?.title || 'Đề thi',
        subject: s.exam?.subject || '',
        status: s.status,
        score: s.score,
        totalPoints: s.totalPoints || s.exam?.totalPoints || 10,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

export default router;

