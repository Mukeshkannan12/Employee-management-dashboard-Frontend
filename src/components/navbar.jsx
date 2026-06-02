import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          EmpDash
        </Link>
        <Link to="/employees" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
          Manage Employees
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 font-medium">
          Welcome, {user?.name}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
