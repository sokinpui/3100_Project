import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress
} from '@mui/material';
import T from '../../../utils/T';

export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    contentText,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false, // Add loading state for the confirm button
    confirmButtonColor = "primary" // Allow customizing confirm button color (e.g., "error" for delete)
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            disableEscapeKeyDown={isLoading} // Prevent closing while loading
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
             sx={{ '& .MuiDialog-paper': { borderRadius: 2, minWidth: 350 } }}
        >
            <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isLoading}>
                    <T>{cancelText}</T>
                </Button>
                <Button
                    onClick={onConfirm}
                    color={confirmButtonColor}
                    variant="contained"
                    disabled={isLoading}
                    autoFocus
                    sx={{minWidth: 90}} // Ensure space for spinner
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : <T>{confirmText}</T>}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
