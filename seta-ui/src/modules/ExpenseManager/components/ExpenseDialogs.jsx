// No major deprecated items found - just minor cleanup
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

export default function ExpenseDialogs({
  confirmDialogOpen,
  deleteDialogOpen,
  handleCloseConfirm,
  handleConfirmAdd,
  handleCancelDelete,
  handleConfirmDelete,
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
          Confirm
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText>Are you sure you want to add this expense?</DialogContentText>
          <Box sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.03)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Date:</strong> {formData.date}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}><strong>Category:</strong> {formData.category_name}</Typography>
            <Typography variant="body2"><strong>Amount:</strong> ${parseFloat(formData.amount || 0).toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} variant="outlined" sx={{ borderRadius: 1 }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAdd} variant="contained" color="primary" sx={{ borderRadius: 1 }} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', py: 1.5 }}>
          Delete Expense
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3 }}>
          <DialogContentText>Are you sure you want to delete this expense?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelDelete} variant="outlined" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ borderRadius: 1, textTransform: 'none', px: 2 }} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
