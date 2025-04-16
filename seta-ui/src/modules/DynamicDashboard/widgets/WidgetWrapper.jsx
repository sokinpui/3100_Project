// src/modules/DynamicDashboard/widgets/WidgetWrapper.jsx
import React from 'react';
import { Card, CardHeader, CardContent, IconButton, Box, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';

// Define a specific class name for the button
const cancelButtonClass = 'widget-remove-button';

export default function WidgetWrapper({ titleKey, children, widgetId, onRemoveWidget }) {
  const { t } = useTranslation();

  // Keep the stopPropagation/preventDefault just in case, but draggableCancel is primary
  const handleRemoveClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (onRemoveWidget) {
      onRemoveWidget(widgetId);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <CardHeader
        // className="widget-drag-handle" // Optional: Uncomment if you ONLY want dragging via the header
        title={<T>{titleKey}</T>}
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem', fontWeight: 500 }}
        action={
          onRemoveWidget && (
            <Tooltip title={t('dynamicDashboard.removeWidget')}>
              <IconButton
                size="small"
                onClick={handleRemoveClick}
                className={cancelButtonClass} // <-- Add the class here
                sx={{ mt: -0.5, mr: -1 }}
                aria-label={t('dynamicDashboard.removeWidget')} // Add aria-label for accessibility
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5', // Theme aware background
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          py: 1, px: 2,
          cursor: 'move',
        }}
      />
      <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {children}
      </CardContent>
    </Card>
  );
}
