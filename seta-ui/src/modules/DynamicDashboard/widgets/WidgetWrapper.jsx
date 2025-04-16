import React from 'react';
import { Card, CardHeader, CardContent, IconButton, Box, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T'; // Your translation component

export default function WidgetWrapper({ titleKey, children, widgetId, onRemoveWidget }) {
  const { t } = useTranslation();

  // --- Add stopPropagation to the click handler ---
  const handleRemoveClick = (event) => {
    event.stopPropagation(); // Prevent event from bubbling up to react-grid-layout
    event.preventDefault();  // Prevent any default browser action if applicable
    if (onRemoveWidget) {
      onRemoveWidget(widgetId);
    }
  };
  // --- End change ---

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CardHeader
        title={<T>{titleKey}</T>}
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem', fontWeight: 500 }}
        action={
          onRemoveWidget && (
            <Tooltip title={t('dynamicDashboard.removeWidget')}>
              {/* --- Update onClick handler --- */}
              <IconButton size="small" onClick={handleRemoveClick} sx={{ mt: -0.5, mr: -1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              {/* --- End update --- */}
            </Tooltip>
          )
        }
        sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 1, px: 2,
          cursor: 'move', // Add move cursor to header for dragging indication (optional)
        }}
        // className="widget-drag-handle" // Optional: Uncomment if you want only header to be draggable
      />
      <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {children}
      </CardContent>
    </Card>
  );
}
