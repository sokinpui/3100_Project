// src/modules/RecurringManager/components/RecurringList.jsx
import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton, Button, CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enUS, zhCN } from '@mui/x-data-grid/locales'; // Import locales
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getCategoryDetails } from '../../../constants'; // Import constants

// Map language codes to MUI locale objects
const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

export default function RecurringList({
    recurringList,
    accounts,
    handleOpenDeleteDialog,
    isDeleting, // Combined deleting state
    onSelectionChange,
    handleBulkDelete,
    selectedRecurringIds
 }) {
    const { t, i18n } = useTranslation(); // Get i18n instance

    // Determine current locale for DataGrid
    const currentLanguage = i18n.language.split('-')[0]; // Get base language ('en', 'zh')
    const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];

    const getAccountName = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account ? account.name : ''; // Return empty string if no account
    };

    const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    const columns: GridColDef[] = [
        { field: 'name', headerName: t('recurringManager.name'), width: 180 },
        {
            field: 'amount',
            headerName: t('recurringManager.amount'),
            width: 120,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums',
             headerAlign: 'left', align: 'left'
        },
        {
            field: 'category_name',
            headerName: t('expenseManager.category'),
            width: 180,
            renderCell: (params) => getTranslatedCategory(params.value),
            valueGetter: (value) => getTranslatedCategory(value),
        },
        {
            field: 'frequency',
            headerName: t('recurringManager.frequency'),
            width: 120,
            renderCell: (params) => <T>{`recurringManager.frequency_${params.value}`}</T>,
            // SIMPLIFY valueGetter: It should just return the raw value for sorting/filtering
            valueGetter: (value) => value,
            // Optional: If filtering needs the translated value, use renderCell value
            // valueGetter: (value) => t(`recurringManager.frequency_${value}`), // Use this if filtering needs translation
        },
        {
            field: 'start_date',
            headerName: t('recurringManager.startDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : '',
        },
         {
            field: 'end_date',
            headerName: t('recurringManager.endDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : <Typography variant="caption" color="text.disabled">None</Typography>,
        },
        {
            field: 'account_id',
            headerName: t('recurringManager.account'),
            width: 150,
            renderCell: (params) => getAccountName(params.value) || <Typography variant="caption" color="text.disabled">None</Typography>,
            valueGetter: (value) => getAccountName(value),
        },
        {
            field: 'actions',
            headerName: t('common.actions'),
            width: 80,
            sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('common.delete')} arrow>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(params.row)}
                            disabled={isDeleting}
                        >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
         <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader
                title={<T>recurringManager.listTitle</T>}
                action={
                    selectedRecurringIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedRecurringIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                            <T>recurringManager.deleteSelected</T> ({selectedRecurringIds.length})
                        </Button>
                    )
                }
                sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
            />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={recurringList}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'start_date', sort: 'desc' }] },
                        columns: { columnVisibilityModel: { end_date: false, account_id: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedRecurringIds}
                    disableRowSelectionOnClick
                    loading={isDeleting} // Show loading overlay during delete
                    localeText={dataGridLocale} // <-- Apply localization
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                        '& .MuiDataGrid-row.Mui-selected:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        },
                    }}
                    // Add NoRowsOverlay later if needed
                />
            </CardContent>
        </Card>
    );
}
