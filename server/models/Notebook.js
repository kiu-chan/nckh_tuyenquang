import mongoose from 'mongoose';

const notebookSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'Tên file là bắt buộc'],
      trim: true,
    },
    fileType: { type: String },
    fileSize: { type: Number, default: 0 },
    summaryType: {
      type: String,
      enum: ['list', 'table', 'bullets', 'framework'],
      required: true,
    },
    content: { type: String },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

notebookSchema.index({ teacher: 1, createdAt: -1 });

notebookSchema.virtual('formattedSize').get(function () {
  if (this.fileSize >= 1048576) {
    return (this.fileSize / 1048576).toFixed(1) + ' MB';
  }
  if (this.fileSize >= 1024) {
    return (this.fileSize / 1024).toFixed(0) + ' KB';
  }
  return this.fileSize + ' B';
});

notebookSchema.set('toJSON', { virtuals: true });

const Notebook = mongoose.model('Notebook', notebookSchema);
export default Notebook;
