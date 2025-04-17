// src/modules/AccountManager/components/AccountList.jsx
import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton, Button, CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

export default function AccountList({
    accounts,
    handleOpenDeleteDialog,
    isDeleting, // Combined deleting state
    // Bulk delete props
    onSelectionChange,
    handleBulkDelete,
    selectedAccountIds
 }) {
    const { t } = useTranslation();

    const columns: GridColDef[] = [
        // Keep existing column definitions...
        { field: 'name', headerName: t('accountManager.accountName'), width: 200 },
        { field: 'account_type', headerName: t('accountManager.accountType'), width: 150 },
        {
            field: 'starting_balance',
            headerName: t('accountManager.startingBalance'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
        },
        {
            field: 'balance_date',
            headerName: t('accountManager.balanceDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null, // Convert string to Date object for sorting/filtering
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
            width: 80, // Adjusted width slightly
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('common.delete')} arrow>
                         {/* Disable individual delete when any delete is happening */}
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
                            // Disable button specifically during bulk delete
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedAccountIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                             {/* TODO: Add translation */}
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
                        columns: { columnVisibilityModel: { created_at: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    // Enable checkbox selection
                    checkboxSelection
                    // Pass selection model and handler
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedAccountIds}
                    disableRowSelectionOnClick
                    // Disable grid interaction during delete
                    loading={isDeleting}
                    sx={{
                        border: 'none',
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
