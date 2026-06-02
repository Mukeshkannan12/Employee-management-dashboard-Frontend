import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from '../store/slices/employeeSlice';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

const EmployeeCRUD = () => {
  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'IT',
    designation: '',
    salary: '',
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEmployees();
  }, [dispatch, currentPage, searchTerm]);

  const fetchEmployees = async () => {
    dispatch(fetchEmployeesStart());
    try {
      const token = localStorage.getItem('token');
      // Using query parameters for search and pagination
      const response = await axios.get(`${API_URL}/api/employees/`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: limit
        },
        headers: { 'x-auth-token': token }
      });
      
      // Use the structure provided by the API: { employees, totalPages, ... }
      dispatch(fetchEmployeesSuccess(response.data.employees || []));
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      dispatch(fetchEmployeesFailure(err.response?.data?.message || 'Failed to fetch employees'));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (employee = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      // Format date to YYYY-MM-DD for input
      const formattedEmployee = {
        ...employee,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : ''
      };
      setFormData(formattedEmployee);
    } else {
      setCurrentEmployee(null);
      setFormData({
        name: '',
        email: '',
        department: 'IT',
        designation: '',
        salary: '',
        status: 'Active',
        joiningDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (currentEmployee) {
        // Update using _id
        const response = await axios.put(`${API_URL}/api/employees/${currentEmployee._id}`, formData, {
          headers: { 'x-auth-token': token }
        });
        dispatch(updateEmployee(response.data));
      } else {
        // Create - Using specific Add Employees/ endpoint
        const response = await axios.post(`${API_URL}/api/employees/`, formData, {
          headers: { 'x-auth-token': token }
        });
        dispatch(addEmployee(response.data));
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_URL}/api/employees/${id}`, {
          headers: { 'x-auth-token': token }
        });
        dispatch(deleteEmployee(id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-semibold"
          >
            <FaPlus className="mr-2" /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.salary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.designation}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openModal(employee)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <FaEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(employee._id)} className="text-red-600 hover:text-red-900">
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md border ${
                currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md border ${
                currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{currentEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option>IT</option>
                    <option>HR</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-semibold"
                >
                  {currentEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCRUD;
