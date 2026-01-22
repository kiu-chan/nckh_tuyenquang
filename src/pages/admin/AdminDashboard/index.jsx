import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAddresses:  0,
    verifiedAddresses: 0,
    pendingValidations: 0,
    userGrowth: 0,
    addressGrowth: 0,
    verificationRate: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setStats({
          totalUsers: 1234,
          totalAddresses: 5678,
          verifiedAddresses: 4321,
          pendingValidations: 234,
          userGrowth:  12.5,
          addressGrowth: 8.3,
          verificationRate: 76.2
        });

        setRecentActivities([
          {
            id: 1,
            type: 'user',
            message: 'Người dùng mới đăng ký',
            user: 'Nguyễn Văn A',
            time: '5 phút trước'
          },
          {
            id: 2,
            type: 'address',
            message: 'Địa chỉ mới được thêm',
            address: '123 Nguyễn Huệ, Q1, TP.HCM',
            time: '10 phút trước'
          },
          {
            id:  3,
            type: 'validation',
            message: 'Địa chỉ được xác minh',
            address: '456 Lê Lợi, Q3, TP.HCM',
            time: '15 phút trước'
          },
          {
            id: 4,
            type: 'user',
            message: 'Người dùng cập nhật thông tin',
            user: 'Trần Thị B',
            time: '20 phút trước'
          },
          {
            id: 5,
            type: 'validation',
            message: 'Yêu cầu xác minh mới',
            address: '789 Trần Hưng Đạo, Q5, TP.HCM',
            time: '25 phút trước'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Tổng người dùng',
      value:  stats.totalUsers,
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      growth: stats.userGrowth,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Tổng địa chỉ',
      value: stats.totalAddresses,
      icon: FaMapMarkerAlt,
      color: 'from-green-500 to-green-600',
      growth: stats.addressGrowth,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Địa chỉ đã xác minh',
      value: stats.verifiedAddresses,
      icon: FaCheckCircle,
      color: 'from-purple-500 to-purple-600',
      growth: stats.verificationRate,
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Chờ xác minh',
      value: stats.pendingValidations,
      icon: FaChartLine,
      color: 'from-orange-500 to-orange-600',
      growth: -3.2,
      bgColor: 'bg-orange-50'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <FaUsers className="text-blue-500" />;
      case 'address': 
        return <FaMapMarkerAlt className="text-green-500" />;
      case 'validation':
        return <FaCheckCircle className="text-purple-500" />;
      default:
        return <FaChartLine className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan hệ thống Localizy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className={`p-6 ${stat.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value. toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                {stat.growth >= 0 ? (
                  <FaArrowUp className="text-green-500 mr-1" size={12} />
                ) : (
                  <FaArrowDown className="text-red-500 mr-1" size={12} />
                )}
                <span className={`text-sm font-medium ${
                  stat.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stat.growth)}%
                </span>
                <span className="text-sm text-gray-500 ml-2">so với tháng trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.message}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity. user || activity.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Thống kê nhanh</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">Tỷ lệ xác minh</p>
              <p className="text-2xl font-bold text-gray-800">{stats.verificationRate}%</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                  style={{ width: `${stats.verificationRate}%` }}
                ></div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Người dùng hoạt động</p>
              <p className="text-2xl font-bold text-gray-800">892</p>
              <p className="text-xs text-gray-500 mt-1">Trong 24 giờ qua</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">Địa chỉ mới hôm nay</p>
              <p className="text-2xl font-bold text-gray-800">47</p>
              <p className="text-xs text-gray-500 mt-1">+12% so với hôm qua</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-sm text-gray-600">Trung bình xác minh/ngày</p>
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-gray-500 mt-1">Trong 7 ngày qua</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;