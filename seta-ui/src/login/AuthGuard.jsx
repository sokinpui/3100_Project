import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthGuard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  const checkSession = () => {
    const loginTime = localStorage.getItem('loginTime');
    const currentTime = new Date().getTime();

    if (!loginTime) {                 // If no loginTime, redirect to login page
      setIsLoggedIn(false);
      if (location.pathname === '/signup') {
        navigate('/signup', { replace: true });
      }
      else if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    const timeDifference = currentTime - parseInt(loginTime);
    
    if (timeDifference > SESSION_DURATION) {
      // Session expired
      // localStorage.removeItem('authToken');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('username');
      localStorage.removeItem('expenses');
      localStorage.removeItem('userSettings');
      navigate('/login', { replace: true });
    } else {
      // Session is still valid
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    checkSession();
    // Check session every 5 seconds
    const intervalId = setInterval(checkSession, 5000);

    return () => clearInterval(intervalId);
  }, [location.pathname]);

  return null;
}