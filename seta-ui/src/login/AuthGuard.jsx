import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Move session duration to a constants file or environment variable
const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export default function AuthGuard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const checkSession = () => {
    const loginTime = localStorage.getItem('loginTime');
    const currentTime = new Date().getTime();

    if (!loginTime) {
      setIsLoggedIn(false);
      // Don't redirect if already on login or signup page
      if (location.pathname === '/signup') {
        return;
      } else if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return;
    }

    const timeDifference = currentTime - parseInt(loginTime);

    if (timeDifference > SESSION_DURATION) {
      // Session expired - clear all user data
      localStorage.removeItem('loginTime');
      localStorage.removeItem('username');
      localStorage.removeItem('expenses');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');

      setIsLoggedIn(false);
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
