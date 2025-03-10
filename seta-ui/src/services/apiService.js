// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change as needed

// Add auth token to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const getUserExpenses = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/expenses/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getTotalExpenses = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/expenses/${userId}/total`);
    return response.data.total;
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const response = await axios.post(`${API_URL}/expenses`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await axios.delete(`${API_URL}/expenses/${expenseId}`);
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const response = await axios.put(`${API_URL}/expenses/${expenseId}`, expenseData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};
