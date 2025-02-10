import React from 'react';
import axios from 'axios';
import ApiContext from './ApiContext';

export default function ApiProvider({ children, baseUrl }) {
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
