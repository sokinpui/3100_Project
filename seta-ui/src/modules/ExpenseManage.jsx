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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
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

// Import axios for API calls
import axios from 'axios';

// API base URL 
const API_URL = 'http://localhost:8000';

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
  'Others (Specify)'
];

// Main component function
export default function ExpenseAdd() {
  // State for storing the list of expenses
  const [expenses, setExpenses] = useState([]);
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for API error handling
  const [apiError, setApiError] = useState(null);
  // State for success notification
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // State for storing form input values
  const [formData, setFormData] = useState({
    amount: '',
    category_name: '', // Changed from 'category' to match API model
    date: '',
    description: ''
  });

  // State for controlling the confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // State for controlling the custom category field
  const [showOtherCategoryField, setShowOtherCategoryField] = useState(false);

  // State for controlling the expense delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Get userId from localStorage (set during login)
  const userId = localStorage.getItem('userId');

  // Function to show notifications
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Function to close notifications
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Load expenses from API when component mounts, this function has some weird warnings (Can ignore for now, idk why yet)
  useEffect(() => {
    // Only fetch if userId exists (user is logged in)
    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  // Fetch expenses from API
  const fetchExpenses = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await axios.get(`${API_URL}/expenses/${userId}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setApiError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the confirmation dialog
  const handleOpenConfirmDialog = (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.amount || !formData.category_name || !formData.date) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Open the confirmation dialog
    setConfirmDialogOpen(true);
  };
  
  // Function to close the Add Expense dialog
  const handleCloseConfirmAddExpenseDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // Add Expense Confirmation handler - Add expense via API
  const handleConfirmAddExpense = async () => {
    setIsSubmitting(true);
    
    try {
      // Create expense object for API
      const expenseData = {
        user_id: parseInt(userId),
        amount: parseFloat(formData.amount),
        category_name: formData.category_name,
        date: formData.date,
        description: formData.description || ""
      };
      
      // Send POST request to API
      const response = await axios.post(`${API_URL}/expenses`, expenseData);
      
      // Add the new expense to state with the ID from the response
      const newExpense = response.data;
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
      
      // Reset form fields after submission
      setFormData({
        amount: '',
        category_name: '',
        date: '',
        description: ''
      });
      
      // Close the confirmation dialog and the custom category field
      setConfirmDialogOpen(false);
      setShowOtherCategoryField(false);
      
      // Show success notification
      showNotification('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      showNotification('Failed to add expense. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if category is "Others"
    if (name === 'category_name') {
      setShowOtherCategoryField(value === 'Others (Specify)');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a handler for custom category input
  const handleCustomCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      // Update the category_name field
      category_name: e.target.value
    }));
  };

  // Date change handler
  const handleDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
    }));
  };

  // Handler for opening the delete dialog
  const handleOpenDeleteDialog = (expenseId) => {
    // Set the expense ID to be deleted
    setExpenseToDelete(expenseId);
    // Open the confirmation dialog
    setDeleteDialogOpen(true);
  };

  // Handler for closing the delete dialog
  const handleCancelDelete = () => {
    // Close the dialog and clear the selected expense
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  // Function to confirm and execute the expense deletion
  const handleConfirmDelete = async () => {
    // Validate that we have an expense ID
    if (!expenseToDelete) return;
    
    try {
      // Call API to delete the expense
      await axios.delete(`${API_URL}/expenses/${expenseToDelete}`);
      
      // Update local state by filtering out the deleted expense
      setExpenses(prev => prev.filter(expense => expense.id !== expenseToDelete));
      
      // Show success notification
      showNotification('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification('Failed to delete expense. Please try again.', 'error');
    } finally {
      // Close the dialog and clear the selected expense
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Calculate the sum of all expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.amount) || 0);
    }, 0).toFixed(2);
  };

  // Component rendering
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* API Error Alert */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
      
      {/* Success/Error Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
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
            backgroundColor: '#5e35b1', 
            color: 'primary.contrastText',
            py: 1.5,
            borderRadius: '5px 5px 0 0',
          }} 
          slotProps={{ title: { fontWeight: 500 } }} 
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleOpenConfirmDialog}>
            {/* Grid container for responsive layout */}
            <Grid container spacing={3}>
              {/* First row: Category, Date, Amount */}
              <Grid size={4}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category_name" // Changed from 'category' to match API model
                    value={formData.category_name}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {expenseCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {showOtherCategoryField && (
                  <TextField
                    fullWidth
                    label="Specify Category"
                    value={formData.category_name === 'Others (Specify)' ? '' : formData.category_name}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter custom category"
                    sx={{ mt: 2 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              </Grid>
              {/* Date picker */}
              <Grid size={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  disableFuture
                  label="Date"
                  value={formData.date ? dayjs(formData.date) : null}
                  format='YYYY-MM-DD'
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                    inputAdornment: {
                      position: 'start',
                      children: <DateRangeIcon fontSize="small" />
                    },
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
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    type: 'number',
                  },
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
                    py: 1.25,
                    px: 2.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.2rem',
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
            py: 1.5,
          }} 
          slotProps={{ title: { fontWeight: 500 } }} 
        />
        <CardContent sx={{ p: 0 }}>
          {/* Show loading spinner while fetching data */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                    expenses.map((expense) => (
                      // Each row needs a unique key for React to efficiently update the DOM
                      <TableRow 
                        key={expense.id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          transition: 'background-color 0.2s',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        {/* Date cell */}
                        <TableCell width="15%">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        
                        {/* Category cell with tooltip for overflow */}
                        <TableCell 
                          sx={{ 
                            maxWidth: '200px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <Tooltip title={expense.category_name} arrow placement="top">
                            <Chip 
                              label={expense.category_name} 
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
                              color: 'success.main'
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
                              onClick={() => handleOpenDeleteDialog(expense.id)}
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
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog Component */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmAddExpenseDialog}
        aria-labelledby="expense-confirmation-dialog"
        aria-describedby="expense-confirmation-description"
        // Add subtle animation and styling
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        {/* Dialog Title */}
        <DialogTitle id="expense-confirmation-dialog" sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 1.5
        }}>
          Confirm 
        </DialogTitle>
        
        {/* Dialog Content */}
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText id="expense-confirmation-description">
            Are you sure you want to add this expense?
          </DialogContentText>
          
          {/* Display expense summary for verification */}
          <Box sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.03)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              <strong>Date:</strong> {formData.date}
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              <strong>Category:</strong> {formData.category_name}
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              <strong>Amount:</strong> ${parseFloat(formData.amount || 0).toFixed(2)}
            </Typography>
            {formData.description && (
              <Typography variant="body2" component="div">
                <strong>Description:</strong> {formData.description}
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        {/* Dialog Actions */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel Button */}
          <Button 
            onClick={handleCloseConfirmAddExpenseDialog}
            variant="outlined" 
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 2
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          {/* Confirm Button */}
          <Button 
            onClick={handleConfirmAddExpense}
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 2
            }}
            disabled={isSubmitting}
            autoFocus
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog Component */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        // Add subtle animation and styling
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        {/* Dialog Title */}
        <DialogTitle id="expense-delete-dialog" sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          py: 1.5
        }}>
          Delete Expense
        </DialogTitle>
        
        {/* Dialog Content */}
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText id="expense-delete-description">
            Are you sure you want to delete this expense?
          </DialogContentText>
        </DialogContent>
        
        {/* Dialog Actions */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel Button */}
          <Button 
            onClick={handleCancelDelete}
            variant="outlined" 
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 2
            }}
          >
            Cancel
          </Button>
          
          {/* Confirm Button */}
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 2
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}