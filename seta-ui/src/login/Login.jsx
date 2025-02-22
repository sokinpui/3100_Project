import React from "react";

export default function Login({ onLogin }) { // Receive the onLogin prop
  const handleLogin = () => {
    localStorage.setItem('authToken', 'token');
    console.log('Logged in');
    onLogin(); // Call the onLogin function to update state in App
  };

  return <button onClick={handleLogin}>Login</button>;
}