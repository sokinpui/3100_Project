import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // DEMO HARD-CODED USER DATA HERE:
  const user = [
    {
      username: 'admin',
      password: 'admin'
    },
   {
      username: 'user',
      password: 'user'
   }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!user.find(u => u.username === formData.username && u.password === formData.password)) {
        alert('Invalid username or password');
        setFormData({
          username: '',
          password: ''
        });
        return;
      }
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('loginTime', new Date().getTime().toString());
      
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <h2>SETA Login Page</h2>
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" disabled={isLoading}>
                Login
              </button>
            </form>
            {/* Delete this after */}
            <div className="test-data">
              <b>testing user data for now:</b>
              {user.map((data, index) => (
                <div key={index}>
                  <p>Username: {data.username}</p>
                  <p>Password: {data.password}</p>
                </div>
              ))}
            </div>
            {/* Until here */}
          </>
        )}
      </div>
    </div>
  );
}