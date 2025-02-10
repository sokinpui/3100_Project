// modules/ExpenseAdd/ExpenseAdd.jsx (Example Module)
import React from 'react';
import useApi from '../../services/useApi';

export default function ExpenseAdd() {
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expenseData = {
      amount: formData.get('amount'),
      category: formData.get('category'),
      date: formData.get('date'),
      description: formData.get('description'),
    };

    try {
      await api.post('/expenses', expenseData);
      alert('Expense added successfully!');
    } catch (error) {
      alert('Failed to add expense.');
    }
  };

  return (
    <div className="expense-add-module">
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <input type="number" name="amount" placeholder="Amount" required />
        <input type="text" name="category" placeholder="Category" required />
        <input type="date" name="date" required />
        <textarea name="description" placeholder="Description"></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
