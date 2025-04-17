import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'; // Added EditIcon for later
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

export default function AccountList({ accounts, handleOpenDeleteDialog, isDeleting }) {
    const { t } = useTranslation();

    const columns: GridColDef[] = [
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
            headerName: t('common.createdAt'), // Use common translation
            width: 170,
            type: 'dateTime',
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'Pp') : '', // Localized date+time
        },
        {
            field: 'actions',
            headerName: t('common.actions'), // Use common translation
            width: 100,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box>
                    {/* Edit Button (for later) */}
                    {/* <Tooltip title={t('common.edit')} arrow>
                         <IconButton size="small" onClick={() => console.log('Edit', params.row.id)} disabled={isDeleting}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip> */}
                    <Tooltip title={t('common.delete')} arrow>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(params.row)} // Pass the whole row or needed info
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
            <CardHeader title={<T>accountManager.listTitle</T>} sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }} />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={accounts}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                         columns: { columnVisibilityModel: { created_at: false } }, // Hide created_at by default
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
