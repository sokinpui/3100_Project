// file name: modules/ExpenseManager/components/ExpenseForm.jsx
import React from 'react';
// Use original Grid import if that was present
import Grid from '@mui/material/Grid'; // Or Grid2 if that was original
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
  Box,         // Added for MenuItem layout
  Typography,  // Added for MenuItem layout
  CircularProgress, // Added for submit button loading state
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next'; // Keep this
import T from '../../../utils/T'; // Keep this
import { expenseCategories } from '../../../constants'; // Import categories

export default function ExpenseForm({
  formData,
  showOtherCategoryField,
  handleChange,
  handleDateChange,
  handleSubmit,
  handleCustomCategoryChange,
  isSubmitting, // Keep receiving this prop
}) {
  // Get the translation function
  const { t } = useTranslation();

  return (
    <Card
      // Keep original elevation and shadow
      elevation={3}
      sx={{
        mb: 4,
        overflow: 'visible',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', // Original shadow
      }}
    >
      <CardHeader
        title={<T>expenseManager.addNewExpense</T>}
        sx={{
          // Original styles
          backgroundColor: '#5e35b1',
          color: 'primary.contrastText', // Assuming this was intended or use 'white'
          py: 1.5,
          borderRadius: '5px 5px 0 0', // Original border radius
        }}
        // Keep original slotProps usage
        slotProps={{ title: { fontWeight: 500 } }}
      />
      <CardContent>
        {/* Keep original form structure */}
        <form onSubmit={handleSubmit} noValidate>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Keep original Grid structure */}
            <Grid container spacing={3}>
              {/* Category Field */}
              {/* Use original Grid size prop */}
              <Grid item xs={12} sm={4}> {/* Adjusted to item and xs/sm for basic responsiveness while keeping structure */}
                <FormControl fullWidth required>
                  <InputLabel id="category-label"><T>expenseManager.category</T></InputLabel>
                  <Select
                    labelId="category-label"
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    label={<T>expenseManager.category</T>}
                    renderValue={(selectedValue) => { // Keep renderValue for selected display
                      const selectedCategory = expenseCategories.find(cat => cat.name === selectedValue);
                      const translationKey = selectedCategory
                          ? `expenseManager.category_${selectedCategory.key}`
                          : 'expenseManager.category_unknown';
                      return t(translationKey, { defaultValue: selectedValue });
                    }}
                    // Keep original startAdornment usage if desired, although less common for Select
                    // startAdornment={
                    //   <InputAdornment position="start">
                    //     <CategoryIcon fontSize="small" />
                    //   </InputAdornment>
                    // }
                  >
                    {expenseCategories.map(({ name, key, icon: Icon }) => {
                      const translationKey = `expenseManager.category_${key}`;
                      const translatedName = t(translationKey, { defaultValue: name });
                      return (
                        <MenuItem key={name} value={name}>
                           {/* Keep original MenuItem structure */}
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Use Box for layout */}
                             <Icon fontSize="small" sx={{ mr: 1 }} /> {/* Original icon usage */}
                             <Typography variant="inherit">{translatedName}</Typography> {/* Display translated name */}
                           </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {showOtherCategoryField && (
                  <TextField
                    fullWidth
                    required
                    label={<T>expenseManager.specifyCategory</T>}
                    value={formData.category_name === 'Others (Specify)' ? '' : formData.category_name}
                    onChange={handleCustomCategoryChange}
                    // *** FIX HERE: Use t() for placeholder string ***
                    placeholder={t('expenseManager.enterCustomCategory')}
                    sx={{ mt: 2 }}
                    // Keep original slotProps usage for TextField adornment
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

              {/* Date Picker */}
              {/* Use original Grid size prop */}
              <Grid item xs={12} sm={4}>
                <DatePicker
                  disableFuture
                  label={<T>expenseManager.date</T>}
                  value={formData.date ? dayjs(formData.date) : null}
                  format="YYYY-MM-DD" // Keep explicit format
                  onChange={handleDateChange}
                  // Keep original slotProps usage
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      // Keep original placeholder usage
                      // placeholder: t('expenseManager.dateFormatHint')
                    },
                    // Keep original inputAdornment usage
                    inputAdornment: {
                      position: 'start',
                      children: <DateRangeIcon fontSize="small" />,
                    },
                  }}
                />
              </Grid>

              {/* Amount Field */}
              {/* Use original Grid size prop */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  required
                  label={<T>expenseManager.amount</T>}
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  type="number" // Keep type number
                  // Keep original slotProps usage
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      // Keep original type if specified here
                      // type: 'number',
                      step: "0.01", // Keep step/min if they were here
                      min: "0"
                    },
                  }}
                />
              </Grid>

              {/* Description Field */}
              {/* Use original Grid size prop */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5} // Keep original rows
                  label={<T>expenseManager.descriptionOptional</T>}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Submit Button */}
              {/* Use original Grid size prop */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}> {/* Keep original 'end' */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting} // Keep disabled state
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />} // Keep loading indicator
                  sx={{
                    // Keep original styles
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
                    },
                  }}
                >
                  <T>expenseManager.addExpense</T>
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </form>
      </CardContent>
    </Card>
  );
}
