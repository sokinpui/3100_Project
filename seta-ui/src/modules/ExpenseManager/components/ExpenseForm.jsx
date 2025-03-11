import React from 'react';
import Grid from '@mui/material/Grid2';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AddCircleOutline as AddCircleOutlineIcon, AttachMoney as AttachMoneyIcon, Category as CategoryIcon, DateRange as DateRangeIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const expenseCategories = [
  'Food & Dining', 'Transportation', 'Housing', 'Entertainment', 'Healthcare',
  'Shopping', 'Education', 'Utilities', 'Travel', 'Personal Care', 'Others (Specify)',
];

export default function ExpenseForm({
  formData,
  showOtherCategoryField,
  handleChange,
  handleDateChange,
  handleSubmit,
  handleCustomCategoryChange,
}) {
  return (
    <Card 
      elevation={3}
      sx={{
        mb: 4,
        overflow: 'visible',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
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
      <CardContent>
        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          </LocalizationProvider>
        </form>
      </CardContent>
    </Card>
  );
}
