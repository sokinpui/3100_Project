import React, { useState, useEffect } from 'react';
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
import {
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';
import { enUS } from 'date-fns/locale';
import i18n from 'i18next'; // Import i18n instance

export default function ExpenseList({ expenses, isLoading, handleOpenDeleteDialog, onSelectionChange, handleBulkDelete, selectedExpenseIds }) {
  const [pageSize] = useState(5);
  const [sortModel, setSortModel] = useState([]);

  // Use the localized date formatting hook
  const { format: formatDate } = useLocalizedDateFormat();

  // Determine the appropriate format string based on language
  const getDateFormat = () => {
    const testDate = new Date();
    const englishFormat = 'MMM d, yyyy';
    const chineseFormat = 'yyyy年M月d日';
    return formatDate(testDate, englishFormat) === formatDate(testDate, englishFormat, { locale: enUS })
      ? englishFormat
      : chineseFormat;
  };

    const [localeText, setLocaleText] = useState({
        // Footer pagination
        footerRowPerPage: i18n.t('expenseManager.rowsPerPage'), // Correct key for "Rows per page:"
        // Note: "of" in "1-5 of 1119" is not directly customizable via a single key in Material-UI DataGrid.
        // You may need to use a custom pagination component or override the footer slot if you want to change "of".

        // Column menu (sorting, filtering, hiding)
        columnMenuSortAsc: i18n.t('expenseManager.sortByAsc'), // "Sort by ASC"
        columnMenuSortDesc: i18n.t('expenseManager.sortByDesc'), // "Sort by DESC"
        columnMenuFilter: i18n.t('expenseManager.filter'), // "Filter"
        columnMenuHideColumn: i18n.t('expenseManager.hideColumn'), // "Hide column"
        columnMenuManageColumns: i18n.t('expenseManager.manageColumns'), // "Manage columns"

        // Filter panel
        filterPanelDeleteIconLabel: i18n.t('expenseManager.reset'), // Tooltip for the reset button in the filter panel

        // Column management (Columns Panel)
        columnsPanelShowAllButton: i18n.t('expenseManager.showHideAll'), // "Show/Hide All" (Show All)
        columnsPanelHideAllButton: i18n.t('expenseManager.showHideAll'), // "Show/Hide All" (Hide All)

        // Additional keys for completeness (optional)
        noRowsLabel: i18n.t('expenseManager.noExpensesAddedYet'), // "No expenses added yet"
        columnsPanelTextFieldLabel: 'Find column', // Optional: Label for the search input in the columns panel
        columnsPanelTextFieldPlaceholder: 'Column title', // Optional: Placeholder for the search input
    });

    useEffect(() => {
        setLocaleText({
            // Footer pagination
            footerRowPerPage: i18n.t('expenseManager.rowsPerPage'), // "Rows per page:" or "每页行数:"

            // Column menu
            columnMenuSortAsc: i18n.t('expenseManager.sortByAsc'), // "Sort by ASC" or "按升序排序"
            columnMenuSortDesc: i18n.t('expenseManager.sortByDesc'), // "Sort by DESC" or "按降序排序"
            columnMenuFilter: i18n.t('expenseManager.filter'), // "Filter" or "过滤"
            columnMenuHideColumn: i18n.t('expenseManager.hideColumn'), // "Hide column" or "隐藏列"
            columnMenuManageColumns: i18n.t('expenseManager.manageColumns'), // "Manage columns" or "管理列"

            // Filter panel
            filterPanelDeleteIconLabel: i18n.t('expenseManager.reset'), // "Reset" or "重置" (for the reset button tooltip)

            // Column management (Columns Panel)
            columnsPanelShowAllButton: i18n.t('expenseManager.showHideAll'), // "Show/Hide All" or "显示/隐藏全部"
            columnsPanelHideAllButton: i18n.t('expenseManager.showHideAll'), // "Show/Hide All" or "显示/隐藏全部"

            // Additional keys
            noRowsLabel: i18n.t('expenseManager.noExpensesAddedYet'), // "No expenses added yet" or "尚未添加任何支出"
        });
    }, [i18n.language]);

  const columns = [
    {
      field: 'date',
      headerName: <T>expenseManager.date</T>,
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
          <T>expenseManager.date</T>
        </Box>
      ),
      renderCell: (params) => (
        <Typography sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center', height: '100%' }}>
          {formatDate(new Date(params.value), getDateFormat())}
        </Typography>
      ),
      sortable: true,
    },
    {
      field: 'amount',
      headerName: <T>expenseManager.amount</T>,
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
      headerName: <T>expenseManager.description</T>,
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
      headerName: <T>expenseManager.actions</T>,
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
      headerName: <T>expenseManager.createdAt</T>,
      width: 200,
      renderCell: (params) => (
        <Typography>
          {formatDate(new Date(params.value), getDateFormat())}
        </Typography>
      ),
      sortable: true,
      hideable: true,
      hide: true,
    },
  ];

  const initialState = {
    columns: {
      columnVisibilityModel: {
        created_at: false,
      },
    },
    pagination: { paginationModel: { pageSize, page: 0 } },
  };

  return (
    <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
      <CardHeader
        title={<T>expenseManager.expenseHistory</T>}
        sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText', py: 1.5 }}
        slotProps={{ title: { fontWeight: 500 } }}
      />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography><T>expenseManager.loading</T></Typography>
          </Box>
        ) : (
          <>
            {selectedExpenseIds.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
            <Box sx={{ width: '100%' }}>
            <DataGrid
            rows={expenses}
            columns={columns}
            initialState={initialState}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => onSelectionChange(newSelection)}
            rowSelectionModel={selectedExpenseIds}
            sortModel={sortModel}
            onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
            localeText={localeText}
            sx={{
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                    '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    border: 'none',
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
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
