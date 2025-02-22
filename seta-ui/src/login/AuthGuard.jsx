import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

export default function AuthGuard({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login', { replace: true });
      }
    }
  }, [isLoggedIn, navigate]);

  return null;
}