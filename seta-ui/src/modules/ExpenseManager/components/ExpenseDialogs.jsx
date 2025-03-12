import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import T from '../../../utils/T';

export default function ExpenseDialogs({
  confirmDialogOpen,
  deleteDialogOpen,
  bulkDeleteDialogOpen,
  handleCloseConfirm,
  handleConfirmAdd,
  handleCancelDelete,
  handleConfirmDelete,
  handleConfirmBulkDelete,
  formData,
  isSubmitting,
}) {
  return (
    <>
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirm}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 400 } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5, borderRadius: '8px 8px 0 0' }}>
          <T>expenseManager.confirm</T>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText><T>expenseManager.confirmAddExpense</T></DialogContentText>
          <Box sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.03)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}><strong><T>expenseManager.date</T>:</strong> {formData.date}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><strong><T>expenseManager.category</T>:</strong> {formData.category_name}</Typography>
            <Typography variant="body2"><strong><T>expenseManager.amount</T>:</strong> ${parseFloat(formData.amount || 0).toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} variant="outlined" sx={{ borderRadius: 1 }} disabled={isSubmitting}>
            <T>expenseManager.cancel</T>
          </Button>
          <Button onClick={handleConfirmAdd} variant="contained" color="primary" sx={{ borderRadius: 1 }} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : <T>expenseManager.confirm</T>}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', py: 1.5 }}>
          <T>expenseManager.deleteExpense</T>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText><T>expenseManager.confirmDeleteExpense</T></DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} variant="outlined" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }}>
            <T>expenseManager.cancel</T>
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }} autoFocus>
            <T>expenseManager.delete</T>
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleCancelDelete}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', py: 1.5 }}>
          <T>expenseManager.deleteMultipleExpenses</T>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText><T>expenseManager.confirmBulkDeleteExpenses</T></DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} variant="outlined" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }}>
            <T>expenseManager.cancel</T>
          </Button>
          <Button onClick={handleConfirmBulkDelete} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }} autoFocus>
            <T>expenseManager.delete</T>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
