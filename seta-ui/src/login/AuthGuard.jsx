// file: AuthGuard.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthGuard({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const checkLoginStatus = () => {
    // Check for the persistent user identifier
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username'); // Optional check

    if (userId && username) {
      // --- User is LOGGED IN ---
      setIsLoggedIn(true);

      // 1. If logged in and on the root path '/', redirect to the default dashboard
      if (location.pathname === '/') {
        console.log('AuthGuard: User logged in, redirecting from / to /dynamic-dashboard');
        navigate('/dynamic-dashboard', { replace: true });
        return; // Important: Stop further checks after redirection
      }

      // 2. If logged in but somehow landed on login/signup, redirect to dashboard
      if (location.pathname === '/login' || location.pathname === '/signup') {
        console.log('AuthGuard: User logged in, redirecting from auth page to /dynamic-dashboard');
        navigate('/dynamic-dashboard', { replace: true });
        return; // Important: Stop further checks
      }

      // 3. If logged in and on any other valid path, allow access (ProtectedRoute in ModuleRouter will handle rendering)
      // No action needed here, just let the component render.

    } else {
      // --- User is NOT LOGGED IN ---
      setIsLoggedIn(false);

      // If not logged in and trying to access anything other than public routes, redirect to login
      const isPublicPath = location.pathname === '/login' ||
                           location.pathname === '/signup' ||
                           location.pathname.startsWith('/reset-password') ||  // Allow password reset
                           location.pathname === '/verify-result';

      if (!isPublicPath) {
        console.log(`AuthGuard: User not logged in, redirecting from ${location.pathname} to /login`);
        navigate('/login', { replace: true });
      }
      // If already on a public path (login, signup, reset), do nothing and allow the page to render.
    }
  };

  useEffect(() => {
    console.log('AuthGuard running check on path:', location.pathname);
    checkLoginStatus();
    // Dependency array ensures this runs on mount and route changes.
  }, [location.pathname, setIsLoggedIn, navigate]);

  // This component doesn't render anything itself
  return null;
}
