// Import necessary dependencies
import React, { useState } from 'react';
// import useApi from '../../services/useApi';  ----> currently non-functional line
// Material-UI Grid system for responsive layouts
import Grid from '@mui/material/Grid2';
// Import Material-UI components - these are pre-built React components with Material Design
import { IconButton, Tooltip } from '@mui/material';      // Icon button and tooltip components
import DeleteIcon from '@mui/icons-material/Delete';      // Icon for delete button
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

// Import date-related dependencies
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Adapter to integrate dayjs with MUI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Provider for date management
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // The actual date picker component
import dayjs from 'dayjs'; // Modern JavaScript date utility library

export default function ExpenseAdd() {
  // const api = useApi();        ----> currently non-functional line

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await api.post('/expenses', formData);
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

  // Handler for deleting an expense
  const handleDelete = (indexToDelete) => {
    try {
      // Filter out the expense at the specified index
      const updatedExpenses = expenses.filter((_, index) => index !== indexToDelete); // ignoring the first parameter, using only the index

      // Update the expenses state with the filtered array
      setExpenses(updatedExpenses);
      // Show success message
      alert('Expense deleted successfully!');
    } catch (error) {
      // Show error message if deletion fails
      alert('Failed to delete expense.');
    }
  };

  // Date change handler - Called when user selects a new date
  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
      // If a date is selected (newValue exists):
      // 1. Convert it to dayjs object
      // 2. Format it to YYYY-MM-DD string
      // If no date selected (newValue is null), use empty string
    }));
  };

  return (
    // Container component centers content and sets max width
    <Container maxWidth="lg">
      {/* Box component adds margin top and bottom */}
      <Box sx={{ mt: 8, mb: 2, backgroundColor: '#f5f5f5', p: 4, borderRadius: 2 }}>
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
              {/* LocalizationProvider is required to set up the date management system */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* DatePicker component with configuration */}
                <DatePicker
                  label="Date"
                  // Convert stored date string to dayjs object for picker
                  // If date exists in formData, create dayjs object, else null
                  value={formData.date ? dayjs(formData.date) : null}
                  onChange={handleDateChange}
                  // Configure the underlying TextField
                  slotProps={{         // SlotProps are used to configure the underlying TextField
                    textField: {
                      fullWidth: true, // Make the field take full width
                      required: true   // Mark field as required
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={4}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                type='number'       // Input type set to number
              />
            </Grid>
            <Grid size={12}>{/* Full width description field */}
              <TextField
                fullWidth
                margin='normal'
                multiline        // Allows multiple lines
                rows={5}         // Sets height to 5 rows
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>            
            {/* Button container with flex alignment */}
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit"
                variant="contained"
                color="primary"
                sx={{
                  py: 1,
                  borderRadius: 1,
                  textTransform: 'none',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}>
                Add Expense
              </Button>
            </Grid>
          </Grid>
        </form>
        {/* Table to display expenses */}
        {/* Paper component gives elevation effect */}
        <TableContainer component={Paper} sx={{ mt: 12, '& .MuiTableHead-root': { backgroundColor: '#6ac5fe' } }}>
          <Table>
            {/* Table header */}
            <TableHead>
              <TableRow>
                {/* Fixed width for date column */}
                <TableCell width="15%">Date</TableCell>
                {/* Fixed width for category column */}
                <TableCell width="20%">Category</TableCell>
                {/* Fixed width for amount column */}
                <TableCell width="15%" align="left">Amount ($)</TableCell>
                {/* Description takes remaining space but with max-width */}
                <TableCell sx={{ maxWidth: '40%' }} align='left'>Description</TableCell>
                {/* Fixed width for actions column */}
                <TableCell width="10%" align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            {/* Table body */}
            {/* If no expenses, show a single row with message, otherwise show table */}
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No expenses added yet
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell width="15%">{expense.date}</TableCell>
                    <TableCell 
                      sx={{ 
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'auto',
                      }}
                    >
                      <Tooltip title={expense.category}>
                        <span>{expense.category}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell width="15%" align="left">{expense.amount}</TableCell>
                    <TableCell 
                      sx={{ 
                        maxWidth: '300px',
                        whiteSpace: 'nowrap',
                        overflow: 'auto',
                      }}
                    >
                      <Tooltip title={expense.description}>
                        <span>{expense.description}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell width="5%" align="center">
                      <Tooltip title="Delete expense">
                        <IconButton 
                          aria-label="delete"
                          onClick={() => handleDelete(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}