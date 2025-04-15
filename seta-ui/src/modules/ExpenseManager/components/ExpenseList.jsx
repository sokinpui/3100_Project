// file name: modules/ExpenseManager/components/ExpenseList.jsx
import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enUS, zhCN } from '@mui/x-data-grid/locales';
import {
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon, // Default Icon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';
// Import the details helper and categories directly
import { expenseCategories, getCategoryDetails } from '../../../constants';
import { format as formatDateFns } from 'date-fns';

const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

// Simplified safe formatter, assuming date-fns is available
const safeFormatDate = (date, formatString) => {
    if (!date || isNaN(date.getTime())) {
        return 'N/A';
    }
    try {
        return formatDateFns(date, formatString);
    } catch (error) {
        console.error("Date formatting error:", error);
        return date.toLocaleDateString(); // Basic fallback
    }
};


export default function ExpenseList({
    expenses,
    isLoading,
    isBulkDeleting,
    handleOpenDeleteDialog,
    onSelectionChange,
    handleBulkDelete,
    selectedExpenseIds
}) {
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [sortModel, setSortModel] = useState([{ field: 'date', sort: 'desc' }]);
  // const { format: formatLocaleDate } = useLocalizedDateFormat(); // Not used in this version for simplicity
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language.split('-')[0];
  const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('expenseManager.date'),
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.date</T>
        </Box>
      ),
      renderCell: (params) => {
          const dateValue = params.value ? new Date(params.value) : null;
          // Using a standard, unambiguous format
          return (
              <Typography sx={{display: 'flex', alignItems: 'center', height: '100%'}}>
                  {safeFormatDate(dateValue, 'yyyy-MM-dd')}
              </Typography>
          );
      },
      sortable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null
    },
    {
        field: 'category_name',
        headerName: t('expenseManager.category'), // Header uses 'category' key
        width: 180,
        renderHeader: () => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Use the default category icon for the header */}
            <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
            <T>expenseManager.category</T>
            </Box>
        ),
        renderCell: (params) => {
            // 1. Find the category details using the name from the data
            const categoryDetails = getCategoryDetails(params.value);

            // 2. Determine the icon (use default if category not found)
            const IconComponent = categoryDetails ? categoryDetails.icon : CategoryIcon;

            // 3. Construct the translation key using the stable 'key' property
            //    Use the original name as defaultValue if key/translation missing
            const translationKey = categoryDetails
                ? `expenseManager.category_${categoryDetails.key}`
                : 'expenseManager.category_unknown'; // Fallback key if needed
            const translatedCategory = t(translationKey, { defaultValue: params.value || 'Unknown' });

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
                    <IconComponent fontSize="small" color="action" />
                    <Typography variant="body2" noWrap title={translatedCategory}> {/* Add title for long names */}
                        {translatedCategory}
                    </Typography>
                </Box>
            );
        },
        sortable: true,
        // Optional: If you want filtering based on translated values, you might need valueGetter
        // valueGetter: (value, row) => {
        //    const details = getCategoryDetails(value);
        //    const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        //    return t(key, { defaultValue: value || 'Unknown' });
        // }
    },
    {
      field: 'amount',
      headerName: t('expenseManager.amount'),
      width: 130,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.amount</T>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            ${Number(params.value).toFixed(2)}
          </Typography>
        </Box>
      ),
      sortable: true,
      type: 'number',
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'description',
      headerName: t('expenseManager.description'),
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.description</T>
        </Box>
      ),
      renderCell: (params) => (
         <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', overflow: 'hidden' }}>
          {params.value ? (
            <Tooltip title={params.value} arrow placement="top">
              <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {params.value}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              <T>expenseManager.noDescription</T>
            </Typography>
          )}
        </Box>
      ),
      sortable: false,
    },
     {
      field: 'created_at',
      headerName: t('expenseManager.createdAt'),
      width: 170,
      renderCell: (params) => {
          const dateValue = params.value ? new Date(params.value) : null;
          // Using 'Pp' for localized short date/time via date-fns
          return (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  {safeFormatDate(dateValue, 'Pp')}
              </Typography>
          );
      },
      sortable: true,
      type: 'dateTime',
      valueGetter: (value) => value ? new Date(value) : null
    },
    {
      field: 'actions',
      headerName: t('expenseManager.actions'),
      width: 80,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={<T>expenseManager.deleteExpense</T>} arrow>
          <IconButton
            onClick={() => handleOpenDeleteDialog(params.row.id)}
            color="error"
            size="small"
            disabled={isBulkDeleting}
            sx={{
              transition: 'transform 0.2s, background-color 0.2s',
              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
            }}
          >
            <DeleteIcon fontSize="small"/>
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const initialState = {
    columns: {
      columnVisibilityModel: {
         created_at: false, // Hide by default again
      },
    },
  };

  return (
    <Card elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={<T>expenseManager.expenseHistory</T>}
        action={
            selectedExpenseIds.length > 0 && (
              <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleBulkDelete}
                  startIcon={isBulkDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                  disabled={isBulkDeleting}
                  sx={{ textTransform: 'none', mr: 1 }}
                >
                  <T>expenseManager.deleteSelected</T> ({selectedExpenseIds.length})
              </Button>
            )
        }
        sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
        titleTypographyProps={{ fontWeight: 500, fontSize: '1.1rem' }}
      />
      <CardContent sx={{ p: 0 }}>
        <DataGrid
          autoHeight
          loading={isLoading || isBulkDeleting}
          rows={expenses}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => onSelectionChange(newSelection)}
          rowSelectionModel={selectedExpenseIds}
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
          localeText={dataGridLocale}
          initialState={initialState}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            '& .MuiDataGrid-virtualScroller': {
                overflowY: 'auto !important',
            },
            '& .MuiDataGrid-overlay': {
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
            }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                    {isLoading ? t('expenseManager.loading') : t('expenseManager.noExpensesAddedYet')}
                </Typography>
                {!isLoading && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }} textAlign="center">
                        <T>expenseManager.useFormAboveToAddFirstExpense</T>
                    </Typography>
                )}
              </Box>
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
