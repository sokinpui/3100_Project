import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete as DeleteIcon } from '@mui/icons-material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';

export default function ExpenseList({ expenses, isLoading, handleOpenDeleteDialog }) {
  const [pageSize, setPageSize] = useState(5); // Initial rows per page

  // Define columns for DataGrid
  const columns = [
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
              <Typography
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
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
            aria-label="delete expense"
            onClick={() => handleOpenDeleteDialog(params.row.id)}
            color="error"
            size="small"
            sx={{
              transition: 'transform 0.2s, background-color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
                transform: 'scale(1.1)',
              },
              ml: 1,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
      <CardHeader
        title="Expense History"
        sx={{
          backgroundColor: 'secondary.light',
          color: 'secondary.contrastText',
          py: 1.5,
        }}
        slotProps={{ title: { fontWeight: 500 } }}
      />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={expenses}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: pageSize, page: 0 },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              onPaginationModelChange={(newModel) => setPageSize(newModel.pageSize)}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                },
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                border: 'none',
              }}
              components={{
                NoRowsOverlay: () => (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      No expenses added yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Use the form above to add your first expense
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
