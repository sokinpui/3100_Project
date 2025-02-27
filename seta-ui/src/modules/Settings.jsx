import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert
} from '@mui/material';

// Import icons
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';

export default function Settings() {
  // Default settings state
  const defaultSettings = {
    theme: 'light',
    language: 'english',
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    currency: 'USD'
  };

  // State for settings
  const [settings, setSettings] = useState(defaultSettings);
  
  // State for notification on save
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Load saved settings from localStorage when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handler for settings changes
  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handler for simple settings changes (top level)
  const handleDirectSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle saving settings
  const saveSettings = () => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSnackbarMessage('Settings saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage('Failed to save settings.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Available languages
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  
  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  ];

  return (
    <Container maxWidth="lg">
      {/* Page title */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mt: 4, 
          mb: 3, 
          fontWeight: 'bold',
          color: '#1976d2',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <SettingsIcon sx={{ mr: 1, fontSize: 35 }} />
        Settings
      </Typography>

      {/* Theme and Appearance Card */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ColorLensIcon sx={{ mr: 1 }} />
              Theme & Appearance
            </Box>
          }
          sx={{ 
            backgroundColor: 'primary.light', 
            color: 'primary.contrastText',
            py: 2
          }} 
        />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel id="theme-select-label">Theme</InputLabel>
                <Select
                  labelId="theme-select-label"
                  id="theme-select"
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleDirectSettingChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleDirectSettingChange('language', e.target.value)}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.toLowerCase()} value={lang.toLowerCase()}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel id="currency-select-label">Default Currency</InputLabel>
                <Select
                  labelId="currency-select-label"
                  id="currency-select"
                  value={settings.currency}
                  label="Default Currency"
                  onChange={(e) => handleDirectSettingChange('currency', e.target.value)}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Profile Settings Card */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile Settings
            </Box>
          }
          sx={{ 
            backgroundColor: 'secondary.light', 
            color: 'secondary.contrastText',
            py: 2
          }} 
        />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={settings.profile.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ 
                  mt: 1,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Change Password
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 'medium',
            boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Save Settings
        </Button>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}