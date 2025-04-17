import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getCategoryDetails } from '../../../constants';

export default function BudgetList({ budgets, onDelete, isDeleting }) {
    const { t } = useTranslation();

    const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    const columns: GridColDef[] = [
        {
            field: 'category_name',
            headerName: t('expenseManager.category'),
            width: 200,
            renderCell: (params) => getTranslatedCategory(params.value),
            valueGetter: (value) => getTranslatedCategory(value),
        },
        {
            field: 'amount_limit',
            headerName: t('budgetManager.amountLimit'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums',
            headerAlign: 'left', align: 'left'
        },
         {
            field: 'period',
            headerName: t('budgetManager.period'),
            width: 120,
            renderCell: (params) => <T>{`recurringManager.frequency_${params.value}`}</T>,
            valueGetter: (value) => t(`recurringManager.frequency_${value}`),
        },
        {
            field: 'start_date',
            headerName: t('budgetManager.startDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : '',
        },
         {
            field: 'end_date',
            headerName: t('budgetManager.endDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : <Typography variant="caption" color="text.disabled">None</Typography>,
        },
        {
            field: 'actions',
            headerName: t('common.actions'),
            width: 80,
            sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('common.delete')} arrow>
                        <IconButton size="small" color="error" onClick={() => onDelete(params.row)} disabled={isDeleting}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
         <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader title={<T>budgetManager.listTitle</T>} sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }} />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={budgets}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'category_name', sort: 'asc' }] },
                         columns: { columnVisibilityModel: { end_date: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                />
            </CardContent>
        </Card>
    );
}
