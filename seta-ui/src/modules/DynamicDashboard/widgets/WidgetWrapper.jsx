// src/modules/DynamicDashboard/widgets/WidgetWrapper.jsx
import React from 'react';
import { Card, CardHeader, CardContent, IconButton, Box, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';

const cancelButtonClass = 'widget-remove-button';
const dragHandleClass = 'widget-drag-handle'; // Define class for the handle

export default function WidgetWrapper({ titleKey, children, widgetId, onRemoveWidget }) {
  const { t } = useTranslation();

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
        className={dragHandleClass} // <-- Add the drag handle class here
        title={<T>{titleKey}</T>}
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem', fontWeight: 500 }}
        action={
          onRemoveWidget && (
            <Tooltip title={t('dynamicDashboard.removeWidget')}>
              <IconButton
                size="small"
                onClick={handleRemoveClick}
                className={cancelButtonClass} // Keep cancel class
                sx={{ mt: -0.5, mr: -1 }}
                aria-label={t('dynamicDashboard.removeWidget')}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          py: 1, px: 2,
          cursor: 'move', // Keep move cursor on the handle
        }}
      />
      <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {children}
      </CardContent>
    </Card>
  );
}
