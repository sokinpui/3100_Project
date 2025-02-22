// Import necessary dependencies
import React, { useState } from 'react';
import useApi from '../../services/useApi';
// Material-UI Grid system for responsive layouts
import Grid from '@mui/material/Grid2';
// Import Material-UI components - these are pre-built React components with Material Design
import {
  Button,        // Material styled button component
  Table,         // Components for creating tables
  TableBody,     // Table body wrapper
  TableCell,     // Individual table cell
  TableContainer,// Wrapper for tables with additional features
  TableHead,     // Table header wrapper
  TableRow,      // Table row component
  Paper,         // Surface-like component that provides elevation
  Container,     // Responsive container with max-width
  TextField,     // Input field component with material design
  Box           // Basic layout component for div-like elements
} from '@mui/material';

export default function ExpenseAdd() {
  // Custom hook for API calls
  const api = useApi();         // Currently non-functional

  // State for storing list of expenses
  const [expenses, setExpenses] = useState([]);
  // State for form input values
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: '',
    description: ''
  });

  // Handler for input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,          // create a copy of previous state             
      [name]: value     // Update the field that was changed
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to API
      await api.post('/expenses', formData);
      // Update local state with new expense
      setExpenses([...expenses, formData]);       // ...expense = spread operator, used to copy the existing array and add the new expense to it.
      // Clear form fields
      setFormData({
        amount: '',
        category: '',
        date: '',
        description: ''
      });
      alert('Expense added successfully!');
    } catch (error) {
      alert('Failed to add expense.');
    }
  };

  return (
    // Container component centers content and sets max width
    <Container maxWidth="lg">
      {/* Box component adds margin top and bottom */}
      <Box sx={{ mt: 2, mb: 2, justifyContent: 'center' }}>
        {/* Heading for the page */}
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          {/* Grid container for responsive layout */}
          {/* spacing prop adds gap between grid items */}
          <Grid container spacing={1}>

            {/* Grid items with size prop for responsive columns */}
            <Grid size={4}>             {/*sum of one line = 12, otherwise will shift to the next line*/}
              {/* TextField provides styled input with label */}
              {/* fullWidth makes the input take full width of its co ntainer */}
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid size={4}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Full width description field */}
            <Grid size={12}>
              <TextField
                fullWidth
                margin='normal'
                multiline        // Allows multiple lines
                rows={4}         // Sets height to 4 rows
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            {/* Button container with flex alignment */}
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" color="primary">
                Add Expense
              </Button>
            </Grid>
            <br></br>
          </Grid>
        </form>

        {/* Table to display expenses */}
        {/* Paper component gives elevation effect */}
        <TableContainer component={Paper} sx={{ mt: 6 }}>
          <Table>
            {/* Table header */}
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount ($)</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            {/* Table body */}
            <TableBody>

              {/* Map through expenses array to create rows */}
              {expenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell align="right">{expense.amount}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                </TableRow>
              ))}
              
              {/* Show message when no expenses exist */}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No expenses added yet
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}