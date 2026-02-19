import { useState, useEffect, useCallback } from 'react';
import { FiX, FiUsers, FiUser, FiCheck, FiSearch, FiClock } from 'react-icons/fi';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const AssignExamModal = ({ exam, onClose, onAssigned }) => {
  const [tab, setTab] = useState('class'); // 'class' | 'student'
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load current assignment
  useEffect(() => {
    if (exam.assignmentType === 'class') {
      setTab('class');
      setSelectedClasses(exam.assignedClasses || []);
    } else if (exam.assignmentType === 'student') {
      setTab('student');
      setSelectedStudents(
        (exam.assignedStudents || []).map((s) => (typeof s === 'string' ? s : s._id))
      );
    }
    if (exam.deadline) {
      const d = new Date(exam.deadline);
      setDeadline(d.toISOString().slice(0, 16));
    }
  }, [exam]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API}/exams/classes`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) setClasses(data.classes);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class selected (for student tab)
  const fetchStudents = useCallback(async (className) => {
    if (!className) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/exams/students-by-class?className=${encodeURIComponent(className)}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'student' && selectedClassForStudents) {
      fetchStudents(selectedClassForStudents);
    }
  }, [tab, selectedClassForStudents, fetchStudents]);

  const toggleClass = (className) => {
    setSelectedClasses((prev) =>
      prev.includes(className) ? prev.filter((c) => c !== className) : [...prev, className]
    );
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((s) => s !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const filtered = filteredStudents;
    const allIds = filtered.map((s) => s._id);
    const allSelected = allIds.every((id) => selectedStudents.includes(id));
    if (allSelected) {
      setSelectedStudents((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedStudents((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const totalStudentCount =
    tab === 'class'
      ? classes
          .filter((c) => selectedClasses.includes(c.name))
          .reduce((sum, c) => sum + c.count, 0)
      : selectedStudents.length;

  const filteredStudents = students.filter(
    (s) =>
      !searchStudent ||
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body =
        tab === 'class'
          ? { assignmentType: 'class', assignedClasses: selectedClasses, deadline: deadline || null }
          : { assignmentType: 'student', assignedStudents: selectedStudents, deadline: deadline || null };

      const res = await fetch(`${API}/exams/${exam._id}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onAssigned();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error assigning exam:', err);
      alert('Có lỗi xảy ra khi giao đề');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = tab === 'class' ? selectedClasses.length > 0 : selectedStudents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Giao đề thi</h2>
            <p className="text-sm text-gray-500 mt-1">{exam.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('class')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'class'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            Theo lớp
          </button>
          <button
            onClick={() => setTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === 'student'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUser className="w-4 h-4" />
            Theo học sinh
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'class' ? (
            <div className="space-y-3">
              {classes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có lớp nào</p>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls.name}
                    onClick={() => toggleClass(cls.name)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedClasses.includes(cls.name)
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                          selectedClasses.includes(cls.name)
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedClasses.includes(cls.name) && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{cls.name}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{cls.count} học sinh</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Class selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp</label>
                <select
                  value={selectedClassForStudents}
                  onChange={(e) => setSelectedClassForStudents(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((cls) => (
                    <option key={cls.name} value={cls.name}>
                      {cls.name} ({cls.count} học sinh)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              {selectedClassForStudents && (
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm học sinh..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* Student list */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedClassForStudents && filteredStudents.length > 0 ? (
                <div className="space-y-2">
                  {/* Select all */}
                  <button
                    onClick={selectAllStudents}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {filteredStudents.every((s) => selectedStudents.includes(s._id))
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </button>

                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => toggleStudent(student._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStudents.includes(student._id)
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                          selectedStudents.includes(student._id)
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedStudents.includes(student._id) && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{student.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedClassForStudents ? (
                <p className="text-center text-gray-500 py-8">Không tìm thấy học sinh</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className="px-6 pb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FiClock className="w-4 h-4" />
            Hạn nộp
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {isValid && (
              <span>
                Sẽ giao cho <strong className="text-emerald-600">{totalStudentCount}</strong> học
                sinh
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang giao...' : 'Giao đề'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignExamModal;
