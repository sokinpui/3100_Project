import React, { useState, useEffect } from 'react';
// Material-UI Grid system for responsive layouts
import Grid from '@mui/material/Grid2';
// Material-UI components for building the UI
import {
  IconButton,
  Tooltip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';

// Import icons
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import SummarizeIcon from '@mui/icons-material/Summarize';

// Import date-related dependencies
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Predefined expense categories to choose from
const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Utilities',
  'Travel',
  'Personal Care',
  'Other'
];

// Main component function
export default function ExpenseAdd() {
  // State for storing the list of expenses - MUST be at top level of component
  const [expenses, setExpenses] = useState([]);

  // State for storing form input values
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: '',
    description: ''
  });

  // Load existing expenses from localStorage when component mounts
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newExpenses = [...expenses, formData];
      setExpenses(newExpenses);
      localStorage.setItem('expenses', JSON.stringify(newExpenses));
      
      setFormData({
        amount: '',
        category: '',
        date: '',
        description: ''
      });
      
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense.');
    }
  };

  // Handler for input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Date change handler
  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
    }));
  };

  // Handler for deleting an expense
  const handleDelete = (indexToDelete) => {
    try {
      const updatedExpenses = expenses.filter((_, index) => index !== indexToDelete);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  // Calculate the sum of all expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.amount) || 0);
    }, 0).toFixed(2);
  };

  // Get today's date for analysis
  const today = dayjs().format('YYYY-MM-DD');
  
  // Count expenses added today
  const expensesAddedToday = expenses.filter(expense => expense.date === today).length;

  // Component rendering
  return (
    <Container maxWidth="lg">
      {/* Page title */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mt: 4, 
          mb: 3, 
          fontWeight: 'bold',
          color: '#1976d2',
          textAlign: 'center'
        }}
      >
        Expense Tracker
      </Typography>
      
      {/* Summary cards row */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Total Expenses Card */}
        <Card sx={{ 
          flexGrow: 1, 
          minWidth: 240,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <SummarizeIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Total Expenses
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                ${calculateTotalExpenses()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* Total Entries Card */}
        <Card sx={{ 
          flexGrow: 1, 
          minWidth: 240,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Total Entries
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {expenses.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        {/* Today's Entries Card */}
        <Card sx={{ 
          flexGrow: 1, 
          minWidth: 240,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          }}}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Added Today
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {expensesAddedToday}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Add Expense Form Card */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          overflow: 'visible',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <CardHeader 
          title="Add New Expense" 
          sx={{ 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            py: 2,
            borderRadius: '5px 5px 0 0'
          }} 
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Grid container for responsive layout */}
            <Grid container spacing={3}>
              {/* First row: Category, Date, Amount */}
              <Grid size={4}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {/* Map through categories array to create dropdown options */}
                    {expenseCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Date picker */}
              <Grid size={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={formData.date ? dayjs(formData.date) : null}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              {/* Amount field */}
              <Grid size={4}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Second row: Description field */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              
              {/* Third row: Submit button */}
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'end'}}>
                <Button 
                  type="submit" 
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Add Expense
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Expenses Table Card */}
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
        <CardHeader 
          title="Expense History" 
          sx={{ 
            backgroundColor: 'secondary.light', 
            color: 'secondary.contrastText',
            py: 2
          }} 
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              {/* Table header */}
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  {/* Date column */}
                  <TableCell width="15%" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                      Date
                    </Box>
                  </TableCell>
                  {/* Category column */}
                  <TableCell width="20%" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                      Category
                    </Box>
                  </TableCell>
                  {/* Amount column */}
                  <TableCell width="15%" align="left" sx={{ fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                      Amount
                    </Box>
                  </TableCell>
                  {/* Description column */}
                  <TableCell sx={{ maxWidth: '40%', fontWeight: 'bold' }} align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                      Description
                    </Box>
                  </TableCell>
                  {/* Actions column */}
                  <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              
              {/* Table body */}
              <TableBody>
                {/* Conditional rendering based on whether expenses exist */}
                {expenses.length === 0 ? (
                  // If no expenses, show a message
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No expenses added yet
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Use the form above to add your first expense
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  // If expenses exist, map through them to create table rows
                  expenses.map((expense, index) => (
                    // Each row needs a unique key for React to efficiently update the DOM
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                        transition: 'background-color 0.2s',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      {/* Date cell */}
                      <TableCell width="15%">{expense.date}</TableCell>
                      
                      {/* Category cell with tooltip for overflow */}
                      <TableCell 
                        sx={{ 
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip title={expense.category} arrow placement="top">
                          <Chip 
                            label={expense.category} 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                            sx={{ maxWidth: '100%' }}
                          />
                        </Tooltip>
                      </TableCell>
                      
                      {/* Amount cell */}
                      <TableCell width="15%" align="left">
                        <Typography 
                          sx={{ 
                            fontWeight: 'medium',
                            color: parseFloat(expense.amount) > 100 ? 'error.main' : 'success.main'
                          }}
                        >
                          ${parseFloat(expense.amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                      
                      {/* Description cell with tooltip for overflow */}
                      <TableCell 
                        sx={{ 
                          maxWidth: '300px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {expense.description ? (
                          <Tooltip title={expense.description} arrow placement="top">
                            <span>{expense.description}</span>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No description
                          </Typography>
                        )}
                      </TableCell>
                      
                      {/* Actions cell with delete button */}
                      <TableCell width="5%" align="center">
                        <Tooltip title="Delete expense" arrow>
                          <IconButton 
                            aria-label="delete expense"
                            onClick={() => handleDelete(index)}
                            color="error"
                            size="small"
                            sx={{
                              transition: 'transform 0.2s, background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                transform: 'scale(1.1)'
                              }
                            }}
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
        </CardContent>
      </Card>
      
      {/* Summary section */}
      <Card 
        sx={{ 
          mb: 6, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'primary.light'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <SummarizeIcon sx={{ mr: 1 }} />
              Expense Summary
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold', 
                color: parseFloat(calculateTotalExpenses()) > 1000 ? 'error.main' : 'success.main',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <AttachMoneyIcon sx={{ mr: 0.5 }} />
              {calculateTotalExpenses()}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="body2" color="textSecondary">Total Entries</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{expenses.length}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="body2" color="textSecondary">Added Today</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{expensesAddedToday}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
              <Typography variant="body2" color="textSecondary">Avg. Amount</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                ${expenses.length > 0 ? (calculateTotalExpenses() / expenses.length).toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}