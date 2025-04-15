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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enUS, zhCN } from '@mui/x-data-grid/locales';
import {
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';

const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

export default function ExpenseList({ expenses, isLoading, handleOpenDeleteDialog, onSelectionChange, handleBulkDelete, selectedExpenseIds }) {
  // Use state for pagination model to control page size and current page
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5, // Initial page size
    page: 0,
  });
  const [sortModel, setSortModel] = useState([]);
  const { format: formatDate } = useLocalizedDateFormat();
  const { i18n, t } = useTranslation(); // Get i18n instance and t function

  const currentLanguage = i18n.language;
  const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];

  const getDateFormat = () => {
    const testDate = new Date();
    const englishFormat = 'MMM d, yyyy';
    const chineseFormat = 'yyyy年M月d日';
    const formattedEnglish = formatDate(testDate, englishFormat);
    const formattedCurrent = formatDate(testDate, englishFormat);
    return formattedCurrent === formattedEnglish && currentLanguage.startsWith('en')
      ? englishFormat
      : chineseFormat;
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      // Use t() for direct translation of headerName string
      headerName: t('expenseManager.date'),
      width: 150,
      // renderHeader is still useful if you want icons + text
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.date</T> {/* T component works here too */}
        </Box>
      ),
      renderCell: (params) => (
        <Typography sx={{display: 'flex', justifyContent: 'left', alignItems: 'center', height: '100%'}}>
          {formatDate(new Date(params.value), getDateFormat())}
        </Typography>
      ),
      sortable: true,
    },
    {
      field: 'amount',
      headerName: t('expenseManager.amount'),
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.amount</T>
        </Box>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
            ${parseFloat(params.value).toFixed(2)}
          </Typography>
        </Box>
      ),
      sortable: true,
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {params.value ? (
            <Tooltip title={params.value} arrow placement="top">
              <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
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
      sortable: true,
    },
    {
      field: 'actions',
      headerName: t('expenseManager.actions'),
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={<T>expenseManager.deleteExpense</T>} arrow>
          <IconButton
            onClick={() => handleOpenDeleteDialog(params.row.id)}
            color="error"
            size="small"
            sx={{
              transition: 'transform 0.2s, background-color 0.2s',
              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)', transform: 'scale(1.1)' },
              ml: 1,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: 'created_at',
      headerName: t('expenseManager.createdAt'),
      width: 200,
      renderCell: (params) => (
        <Typography>
          {formatDate(new Date(params.value), getDateFormat())}
        </Typography>
      ),
      sortable: true,
      // Keep hideable if you want users to control visibility
      hideable: true,
      // Let initialState handle initial visibility
    },
  ];

  // Use initialState primarily for non-pagination settings like column visibility
  const initialState = {
    columns: {
      columnVisibilityModel: {
        created_at: false, // Keep 'createdAt' hidden initially
      },
    },
  };

  return (
    <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
      <CardHeader
        title={<T>expenseManager.expenseHistory</T>}
        sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText', py: 1.5 }}
        slotProps={{ title: { fontWeight: 500 } }}
      />
      <CardContent sx={{ p: 0 }}> {/* Ensure no padding conflicts */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography><T>expenseManager.loading</T></Typography>
          </Box>
        ) : (
          <>
            {selectedExpenseIds.length > 0 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleBulkDelete(selectedExpenseIds)}
                  startIcon={<DeleteIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  <T>expenseManager.deleteSelected</T> ({selectedExpenseIds.length})
                </Button>
              </Box>
            )}
             {/* REMOVED the Box with fixed height that was wrapping DataGrid */}
            <DataGrid
              // ADD autoHeight prop
              autoHeight
              rows={expenses}
              columns={columns}
              // Control pagination state directly
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel} // Update state on change
              pageSizeOptions={[5, 10, 25, 50, 100]} // Options user can select
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => onSelectionChange(newSelection)}
              rowSelectionModel={selectedExpenseIds}
              sortModel={sortModel}
              onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
              localeText={dataGridLocale}
              // Pass the initialState for column visibility etc.
              initialState={initialState}
              sx={{
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                border: 'none', // Remove default border
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary"><T>expenseManager.noExpensesAddedYet</T></Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}><T>expenseManager.useFormAboveToAddFirstExpense</T></Typography>
                  </Box>
                ),
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
