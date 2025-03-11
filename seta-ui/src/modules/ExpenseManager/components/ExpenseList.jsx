import React, { useState } from 'react';
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

export default function ExpenseList({ expenses, isLoading, handleOpenDeleteDialog, onSelectionChange, handleBulkDelete, selectedExpenseIds }) {
  const [pageSize] = useState(5);
  const [sortModel, setSortModel] = useState([]);

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
          Date
        </Box>
      ),
      sortable: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
          Amount
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
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
          Description
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
              No description
            </Typography>
          )}
        </Box>
      ),
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Delete expense" arrow>
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
      headerName: 'Created At',
      width: 200,
      renderCell: (params) => (
        <Typography>
          {new Date(params.value).toLocaleString()}
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
        title="Expense History"
        sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText', py: 1.5 }}
        slotProps={{ title: { fontWeight: 500 } }}
      />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading...</Typography>
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
                  Delete Selected ({selectedExpenseIds.length})
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
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                  '& .MuiDataGrid-row:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  border: 'none',
                }}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body1" color="textSecondary">No expenses added yet</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Use the form above to add your first expense</Typography>
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
