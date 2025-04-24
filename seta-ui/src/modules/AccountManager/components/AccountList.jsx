// src/modules/AccountManager/components/AccountList.jsx
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

// --- Add this mapping ---
const ACCOUNT_TYPE_TRANSLATION_KEYS = {
    'Checking': 'checking',
    'Savings': 'savings',
    'Credit Card': 'creditCard',
    'Cash': 'cash',
    'Investment': 'investment',
    'Loan': 'loan',
    'Other': 'other',
};
// --- End mapping ---

// Map language codes to MUI locale objects
const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

export default function AccountList({
    accounts,
    handleOpenDeleteDialog,
    isDeleting, // Combined deleting state
    onSelectionChange,
    handleBulkDelete,
    selectedAccountIds
 }) {
    const { t, i18n } = useTranslation(); // Get i18n instance

    // Determine current locale for DataGrid
    const currentLanguage = i18n.language.split('-')[0]; // Get base language ('en', 'zh')
    const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];

    // --- Helper function to get translated account type ---
    const getTranslatedAccountType = (value) => {
        const translationStem = ACCOUNT_TYPE_TRANSLATION_KEYS[value];
        if (translationStem) {
            return t(`accountManager.accountType_${translationStem}`, { defaultValue: value });
        }
        return value; // Fallback to the raw value if no key found
    };
    // --- End helper function ---

    const columns: GridColDef[] = [
        { field: 'name', headerName: t('accountManager.accountName'), width: 200 },
        {
            field: 'account_type',
            headerName: t('accountManager.accountType'),
            width: 150,
            // Use renderCell to display the translated value
            renderCell: (params) => getTranslatedAccountType(params.value),
            // Use valueGetter to provide translated value for sorting/filtering
            valueGetter: (value) => getTranslatedAccountType(value),
        },
        {
            field: 'starting_balance',
            headerName: t('accountManager.startingBalance'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums', // Optional: aligns numbers
            headerAlign: 'left', align: 'left' // Align header and cell content left
        },
        {
            field: 'balance_date',
            headerName: t('accountManager.balanceDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : '',
        },
         {
            field: 'created_at',
            headerName: t('common.createdAt'),
            width: 170,
            type: 'dateTime',
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'Pp') : '',
        },
        {
            field: 'actions',
            headerName: t('common.actions'),
            width: 80,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
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
                title={<T>accountManager.listTitle</T>}
                action={
                    selectedAccountIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedAccountIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                            <T>accountManager.deleteSelected</T> ({selectedAccountIds.length})
                        </Button>
                    )
                }
                sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
            />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={accounts}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        columns: { columnVisibilityModel: { created_at: false } }, // Hide 'Created At' by default
                        sorting: { sortModel: [{ field: 'name', sort: 'asc' }] }, // Sort by name initially
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedAccountIds}
                    disableRowSelectionOnClick
                    loading={isDeleting} // Show loading overlay during delete
                    localeText={dataGridLocale} // <-- Apply localization
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            // Optional: Add some padding or adjust alignment if needed
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                        '& .MuiDataGrid-row.Mui-selected:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}
