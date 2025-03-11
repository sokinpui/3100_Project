import React from 'react';
import {
  Grid,
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
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material'; // Removed DescriptionIcon

import dayjs from 'dayjs';

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
  'Others (Specify)',
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
    <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
      <CardHeader
        title="Add New Expense"
        sx={{
          backgroundColor: '#5e35b1',
          color: 'white',
          py: 2,
          borderRadius: '8px 8px 0 0',
        }}
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={3}>
              {/* Category Input */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category-select"
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    label="Category"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {expenseCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {showOtherCategoryField && (
                  <TextField
                    fullWidth
                    label="Specify Category"
                    value={formData.category_name === 'Others (Specify)' ? '' : formData.category_name}
                    onChange={handleCustomCategoryChange}
                    sx={{ mt: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </Grid>

              {/* Date Picker */}
              <Grid item xs={12} md={4}>
                <DatePicker
                  disableFuture
                  label="Date"
                  value={formData.date ? dayjs(formData.date) : null}
                  format="YYYY-MM-DD"
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
                      },
                    },
                  }}
                />
              </Grid>

              {/* Amount Input */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Description Input */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description (Optional)" // Label floats above when focused/filled
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  // Removed placeholder and InputProps to eliminate icon
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end' }}>
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
                    fontSize: '1.1rem',
                    fontWeight: 'medium',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    },
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
