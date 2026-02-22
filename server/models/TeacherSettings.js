import mongoose from 'mongoose';

const teacherSettingsSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    semesterStartDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const TeacherSettings = mongoose.model('TeacherSettings', teacherSettingsSchema);
export default TeacherSettings;
