// src/modules/IncomeManager/components/IncomeList.jsx
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

// Map language codes to MUI locale objects
const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

export default function IncomeList({
    incomeList,
    accounts,
    handleOpenDeleteDialog,
    isDeleting, // Combined deleting state (single or bulk)
    onSelectionChange,
    handleBulkDelete,
    selectedIncomeIds
}) {
    const { t, i18n } = useTranslation(); // Get i18n instance

    // Determine current locale for DataGrid
    const currentLanguage = i18n.language.split('-')[0]; // Get base language ('en', 'zh')
    const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];


    // Helper to find account name
    const getAccountName = (accountId) => {
        const account = accounts.find(acc => acc.id === accountId);
        return account ? account.name : 'N/A';
    };

    const columns: GridColDef[] = [
        {
            field: 'date',
            headerName: t('incomeManager.date'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : '',
        },
        {
            field: 'amount',
            headerName: t('incomeManager.amount'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums',
            headerAlign: 'left',
            align: 'left'
        },
        { field: 'source', headerName: t('incomeManager.source'), width: 200 },
        {
            field: 'account_id',
            headerName: t('incomeManager.account'),
            width: 180,
            renderCell: (params) => getAccountName(params.value),
            valueGetter: (value) => getAccountName(value),
        },
        { field: 'description', headerName: t('incomeManager.description'), flex: 1, minWidth: 200 },
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
                title={<T>incomeManager.listTitle</T>}
                action={
                    selectedIncomeIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedIncomeIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                            <T>incomeManager.deleteSelected</T> ({selectedIncomeIds.length})
                        </Button>
                    )
                }
                sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
            />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={incomeList}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
                        columns: { columnVisibilityModel: { created_at: false, account_id: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedIncomeIds}
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
