import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('loginTime', new Date().getTime().toString());
      
      // Add a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await navigate('/', { replace: true });
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          Login
        </button>
      )}
    </div>
  );
}