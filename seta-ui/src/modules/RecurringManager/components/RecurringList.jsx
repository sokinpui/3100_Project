import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton, Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getCategoryDetails } from '../../../constants'; // Import constants

export default function RecurringList({ recurringList, accounts, handleOpenDeleteDialog, isDeleting }) {
    const { t } = useTranslation();

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
            valueGetter: (value) => getTranslatedCategory(value), // For filtering/sorting
        },
         {
            field: 'frequency',
            headerName: t('recurringManager.frequency'),
            width: 120,
            renderCell: (params) => <T>{`recurringManager.frequency_${params.value}`}</T>, // Translate frequency
            valueGetter: (value) => t(`recurringManager.frequency_${value}`), // For filtering/sorting
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
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : <Typography variant="caption" color="text.disabled">None</Typography>, // Show 'None' if null
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
                        <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(params.row)} disabled={isDeleting}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
         <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader title={<T>recurringManager.listTitle</T>} sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }} />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={recurringList}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'start_date', sort: 'desc' }] }, // Default sort
                        columns: { columnVisibilityModel: { end_date: false, account_id: false } }, // Hide some
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                    // Add NoRowsOverlay later if needed
                />
            </CardContent>
        </Card>
    );
}
