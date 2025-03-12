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
import {
  AddCircleOutline as AddCircleOutlineIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { expenseCategories } from '../../../constants'; // Import the global expenseCategories

export default function ExpenseForm({
  formData,
  showOtherCategoryField,
  handleChange,
  handleDateChange,
  handleSubmit,
  handleCustomCategoryChange,
}) {
  const { t } = useTranslation();

  return (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        overflow: 'visible',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <CardHeader
        title={<T>expenseManager.addNewExpense</T>}
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
              {/* Category Field */}
              <Grid size={4}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label"><T>expenseManager.category</T></InputLabel>
                  <Select
                    labelId="category-label"
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    label={<T>expenseManager.category</T>} // Fixed: Valid JSX expression
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    {expenseCategories.map(({ name, key, icon: Icon }) => (
                      <MenuItem key={name} value={name}>
                        <Icon fontSize="small" sx={{ mr: 1 }} />
                        {t(`expenseManager.${key}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {showOtherCategoryField && (
                  <TextField
                    fullWidth
                    label={<T>expenseManager.specifyCategory</T>}
                    value={formData.category_name === 'Others (Specify)' ? '' : formData.category_name}
                    onChange={handleCustomCategoryChange}
                    placeholder={<T>expenseManager.enterCustomCategory</T>}
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

              {/* Date Picker */}
              <Grid size={4}>
                <DatePicker
                  disableFuture
                  label={<T>expenseManager.date</T>}
                  value={formData.date ? dayjs(formData.date) : null}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                    inputAdornment: {
                      position: 'start',
                      children: <DateRangeIcon fontSize="small" />,
                    },
                  }}
                />
              </Grid>

              {/* Amount Field */}
              <Grid size={4}>
                <TextField
                  fullWidth
                  label={<T>expenseManager.amount</T>}
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

              {/* Description Field */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label={<T>expenseManager.descriptionOptional</T>}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Submit Button */}
              <Grid size={12} sx={{ display: 'flex', justifyContent: 'end' }}>
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
