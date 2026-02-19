import {
  IoDocumentTextOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';

const statConfig = [
  { key: 'total', label: 'Tổng đề thi', icon: IoDocumentTextOutline, color: 'blue' },
  { key: 'published', label: 'Đang diễn ra', icon: IoTimeOutline, color: 'green' },
  { key: 'completed', label: 'Đã hoàn thành', icon: IoCheckmarkCircleOutline, color: 'purple' },
  { key: 'draft', label: 'Nháp', icon: IoCreateOutline, color: 'orange' },
];

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
};

const ExamStats = ({ statsData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat) => {
        const Icon = stat.icon;
        const colors = colorMap[stat.color];
        return (
          <div key={stat.key} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{statsData[stat.key]}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExamStats;
