import React from 'react';
import axios from 'axios';
import ApiContext from './ApiContext';

export default function ApiProvider({ children }) {
  const baseUrl = 'http://localhost:8000'; // Updated to match the FastAPI server
  
  const api = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
}