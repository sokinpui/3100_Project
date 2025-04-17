// src/modules/PlanningManager/components/GoalList.jsx
import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton, LinearProgress, Button, CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

export default function GoalList({
    goals,
    onDelete,
    isDeleting, // Combined deleting state
    // Bulk delete props
    onSelectionChange,
    handleBulkDelete,
    selectedGoalIds
}) {
    const { t } = useTranslation();

    const columns: GridColDef[] = [
        // Keep existing column definitions...
        { field: 'name', headerName: t('goalManager.goalName'), width: 200 },
        {
            field: 'target_amount',
            headerName: t('goalManager.targetAmount'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums', headerAlign: 'left', align: 'left'
        },
        {
            field: 'current_amount',
            headerName: t('goalManager.currentAmount'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums', headerAlign: 'left', align: 'left'
        },
         {
            field: 'progress',
            headerName: t('goalManager.progress'),
            width: 150,
            sortable: false, filterable: false,
            renderCell: (params) => {
                 const target = parseFloat(params.row.target_amount) || 0;
                 const current = parseFloat(params.row.current_amount) || 0;
                 const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
                 return (
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            color="success"
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="caption">{progress.toFixed(0)}%</Typography>
                    </Box>
                 );
            }
        },
        {
            field: 'target_date',
            headerName: t('goalManager.targetDate'),
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
                        {/* Disable individual delete when any delete is happening */}
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(params.row)}
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
                title={<T>goalManager.listTitle</T>}
                action={
                    selectedGoalIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            // Disable button specifically during bulk delete
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedGoalIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                            {/* TODO: Add translation */}
                            <T>goalManager.deleteSelected</T> ({selectedGoalIds.length})
                        </Button>
                    )
                }
                sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
            />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={goals}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'target_date', sort: 'asc' }] },
                         columns: { columnVisibilityModel: { current_amount: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    // Enable checkbox selection
                    checkboxSelection
                    // Pass selection model and handler
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedGoalIds}
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
