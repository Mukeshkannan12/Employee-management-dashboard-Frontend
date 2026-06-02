import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import Button from '../components/button';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      dispatch(loginStart());
      
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, formData);
        const { user, token } = response.data;
        
        if (token) {
          localStorage.setItem('token', token);
        }
        
        dispatch(loginSuccess(user || response.data));
        navigate('/dashboard');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Invalid email or password';
        dispatch(loginFailure(errorMessage));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for the field being typed in
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{authError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
