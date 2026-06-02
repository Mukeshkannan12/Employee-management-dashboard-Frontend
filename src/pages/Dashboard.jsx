import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchEmployeesStart, fetchEmployeesSuccess, fetchEmployeesFailure } from '../store/slices/employeeSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaUsers, FaUserCheck } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Yellow, Red

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector((state) => state.employees);

  useEffect(() => {
    const fetchEmployees = async () => {
      dispatch(fetchEmployeesStart());
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/employees/`, {
          headers: {
            'x-auth-token': token
          }
        });
        dispatch(fetchEmployeesSuccess(response.data.employees || []));
      } catch (err) {
        dispatch(fetchEmployeesFailure(err.response?.data?.message || 'Failed to fetch employees'));
      }
    };

    fetchEmployees();
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Active').length;

    // Department data
    const deptMap = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    const departmentData = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    // Status data
    const statusMap = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Monthly data (joining date)
    const monthMap = employees.reduce((acc, emp) => {
      const date = new Date(emp.joiningDate);
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    // Order months
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthOrder
      .filter(m => monthMap[m])
      .map(month => ({ month, joined: monthMap[month] }));

    return { total, active, departmentData, statusData, monthlyData };
  }, [employees]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Employee Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4">
            <FaUsers size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold uppercase">Total Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4">
            <FaUserCheck size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold uppercase">Active Employees</p>
            <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Department-wise Count */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Department-wise Count</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Joined Employees */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Joined Employees</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="joined" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Status Distribution</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;