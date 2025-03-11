// No deprecated items found - just minor cleanup
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function ExpenseNotifications({ notification, handleCloseNotification }) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
