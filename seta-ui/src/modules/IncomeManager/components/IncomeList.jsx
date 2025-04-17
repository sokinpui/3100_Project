import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

export default function IncomeList({ incomeList, accounts, handleOpenDeleteDialog, isDeleting }) {
    const { t } = useTranslation();

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
            cellClassName: 'font-tabular-nums', // Good for aligning numbers
             headerAlign: 'left',
             align: 'left'
        },
        { field: 'source', headerName: t('incomeManager.source'), width: 200 },
        {
            field: 'account_id',
            headerName: t('incomeManager.account'),
            width: 180,
            renderCell: (params) => getAccountName(params.value),
            valueGetter: (value) => getAccountName(value), // For filtering/sorting by name
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
            <CardHeader title={<T>incomeManager.listTitle</T>} sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }} />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={incomeList}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] }, // Default sort by date
                        columns: { columnVisibilityModel: { created_at: false, account_id: false } }, // Hide some by default
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
