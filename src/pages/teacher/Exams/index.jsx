import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiUpload } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';

import ExamStats from './ExamStats';
import ExamFilters from './ExamFilters';
import { subjects } from './constants';
import ExamCard from './ExamCard';
import ExamDetailModal from './ExamDetailModal';
import ExamEditModal from './ExamEditModal';
import CreateExamModal from './CreateExamModal';
import ImportExamModal from './ImportExamModal';
import { exportExamToExcel } from './examExcel';

const API = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const TeacherExams = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const [exams, setExams] = useState([]);
  const [statsData, setStatsData] = useState({ total: 0, published: 0, completed: 0, draft: 0 });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailExam, setDetailExam] = useState(null);
  const [editExam, setEditExam] = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (filterSubject !== 'all') {
        const subjectName = subjects.find((s) => s.id === filterSubject)?.name;
        if (subjectName) params.append('subject', subjectName);
      }
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API}/exams?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setExams(data.exams);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterSubject, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/exams/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setStatsData(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshData = () => {
    fetchExams();
    fetchStats();
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;
    try {
      const res = await fetch(`${API}/exams/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) refreshData();
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const handleDuplicateExam = async (id) => {
    try {
      const res = await fetch(`${API}/exams/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) refreshData();
    } catch (err) {
      console.error('Error duplicating exam:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/exams/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) refreshData();
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleDownload = (exam) => {
    exportExamToExcel(exam);
  };

  const handleViewDetail = async (exam) => {
    try {
      const res = await fetch(`${API}/exams/${exam._id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setDetailExam(data.exam);
    } catch (err) {
      console.error('Error fetching exam detail:', err);
    }
  };

  const handleEdit = async (exam) => {
    try {
      const res = await fetch(`${API}/exams/${exam._id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setEditExam(data.exam);
    } catch (err) {
      console.error('Error fetching exam for edit:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý đề thi</h1>
          <p className="text-gray-600">Tạo, quản lý và theo dõi kết quả đề thi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <FiUpload className="w-5 h-5" />
            <span>Tải đề lên</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
          >
            <FiPlus className="w-5 h-5" />
            <span>Tạo đề thi mới</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <ExamStats statsData={statsData} />

      {/* Filters */}
      <ExamFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        statsData={statsData}
      />

      {/* Exams List */}
      <div className="space-y-4">
        {exams.map((exam) => (
          <ExamCard
            key={exam._id}
            exam={exam}
            onEdit={handleEdit}
            onDelete={handleDeleteExam}
            onDuplicate={handleDuplicateExam}
            onStatusChange={handleStatusChange}
            onViewDetail={handleViewDetail}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <IoDocumentTextOutline className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy đề thi</h3>
          <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tạo đề thi mới</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Tải đề từ Excel
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Tạo đề thi mới
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            refreshData();
          }}
        />
      )}

      {showImportModal && (
        <ImportExamModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            setShowImportModal(false);
            refreshData();
          }}
        />
      )}

      {detailExam && (
        <ExamDetailModal
          exam={detailExam}
          onClose={() => setDetailExam(null)}
          onDownload={handleDownload}
        />
      )}

      {editExam && (
        <ExamEditModal
          exam={editExam}
          onClose={() => setEditExam(null)}
          onSaved={() => {
            setEditExam(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};

export default TeacherExams;
