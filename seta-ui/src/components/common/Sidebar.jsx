// src/components/common/Sidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { changeLanguage } from '../../locales/i18n';
import T from '../../utils/T.jsx';
import { sidebarMenuItems } from '../../modulesConfig'; // Import from config
import axios from 'axios'; // Import axios

import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Tooltip, IconButton, Menu, MenuItem,
  CircularProgress // Added CircularProgress
} from '@mui/material';

import {
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  ColorLens as ColorLensIcon, Language as LanguageIcon,
  Logout as LogoutIcon, AccountCircle as AccountCircleIcon,
  Lock as LockIcon // Example icon for licensed features
} from '@mui/icons-material';

import { t } from 'i18next'; // Import i18next for translation

const API_URL = 'http://localhost:8000'; // Define API URL
const drawerWidth = 240;
const collapsedWidth = 70;

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { themeMode, updateTheme } = useTheme();
  const { language, updateLanguage } = useLanguage();
  const isDarkMode = themeMode === 'dark';

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);

  // --- Licence Status State ---
  const [licenceStatus, setLicenceStatus] = useState('loading'); // 'loading', 'active', 'inactive', 'not_set', 'error'
  const userId = localStorage.getItem('userId');
  // ---

  // --- Fetch Licence Status ---
  const fetchLicenceStatus = useCallback(async () => {
      if (!userId) {
          setLicenceStatus('inactive'); // Treat no user as inactive licence
          return;
      }
      setLicenceStatus('loading');
      try {
          const response = await axios.get(`${API_URL}/users/${userId}/licence`);
          setLicenceStatus(response.data.status || 'error');
      } catch (error) {
          console.error("Failed to fetch licence status:", error);
          setLicenceStatus('error'); // Indicate an error fetching status
      }
  }, [userId]);

  useEffect(() => {
      fetchLicenceStatus();
      // TODO: Consider adding a listener or interval if licence status can change externally
      // or re-fetch after navigating away from/back to settings page?
  }, [fetchLicenceStatus]);
  // ---

  const handleDrawerToggle = () => setOpen(!open);
  const handleLogoutClick = () => setLogoutDialogOpen(true);
  const handleDialogClose = () => setLogoutDialogOpen(false);
  const isActive = (path) => location.pathname === path;

  const handleLogoutConfirm = () => {
    // Reset theme/language to defaults if needed
    updateTheme('system'); // Example: reset to system default on logout
    const defaultLang = 'english';
    updateLanguage(defaultLang);
    changeLanguage(defaultLang);
    // Clear all relevant local storage
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    // Keep userSettings for theme/language preference for next login? Optional.
    // localStorage.removeItem('userSettings');
    // Clear layout/filter preferences
    localStorage.removeItem('dynamicDashboardLayout_v2');
    localStorage.removeItem('dynamicDashboardFilters_v2');
    localStorage.removeItem('dynamicDashboardTimePreset_v1');
    localStorage.removeItem('dynamicDashboardCustomStart_v1');
    localStorage.removeItem('dynamicDashboardCustomEnd_v1');

    setLogoutDialogOpen(false);
    navigate('/login', { replace: true });
  };

  const handleThemeClick = (event) => setThemeAnchorEl(event.currentTarget);
  const handleThemeClose = () => setThemeAnchorEl(null);
  const handleThemeChange = (value) => {
    updateTheme(value);
    // Save setting
    try {
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        settings.theme = value;
        localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (e) { console.error("Failed to save theme setting", e); }
    handleThemeClose();
  };

  const handleLanguageClick = (event) => setLanguageAnchorEl(event.currentTarget);
  const handleLanguageClose = () => setLanguageAnchorEl(null);
  const handleLanguageChange = (value) => {
    updateLanguage(value);
    changeLanguage(value);
    // Save setting
     try {
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        settings.language = value;
        localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (e) { console.error("Failed to save language setting", e); }
    handleLanguageClose();
  };

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Box */}
      <Box
        sx={{
          height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          background: isDarkMode ? 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white', mb: 2, px: 2,
        }}
      >
        {open && (
          <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: '1px', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            <T>sidebar.appName</T>
          </Typography>
        )}
         {/* Placeholder to keep toggle button right-aligned when closed */}
        {!open && <Box sx={{ width: 40 }} />}
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Main Navigation List */}
      <List sx={{ flexGrow: 1, px: open ? 2 : 0.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          {/* Theme & Language Toggles */}
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <Tooltip title={open ? '' : <T>settings.themeLabel</T>} placement="right" arrow>
              <ListItemButton onClick={handleThemeClick} sx={{ justifyContent: open ? 'initial' : 'center', borderRadius: '8px', '&:hover': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }, py: open ? 1 : 1.5 }}>
                <ListItemIcon sx={{ color: isDarkMode ? 'text.primary' : 'text.secondary', minWidth: open ? '40px' : '0px', mr: open ? 'auto' : 'auto', justifyContent: 'center' }}>
                  <ColorLensIcon />
                </ListItemIcon>
                {open && <ListItemText primary={<T>settings.themeLabel</T>} slotProps={{ primary: { sx: { fontWeight: 'normal', color: isDarkMode ? 'text.primary' : 'inherit' } } }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <Menu anchorEl={themeAnchorEl} open={Boolean(themeAnchorEl)} onClose={handleThemeClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <MenuItem onClick={() => handleThemeChange('light')}><T>settings.lightMode</T></MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')}><T>settings.darkMode</T></MenuItem>
            <MenuItem onClick={() => handleThemeChange('system')}><T>settings.systemDefault</T></MenuItem>
          </Menu>

          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <Tooltip title={open ? '' : <T>settings.language</T>} placement="right" arrow>
              <ListItemButton onClick={handleLanguageClick} sx={{ justifyContent: open ? 'initial' : 'center', borderRadius: '8px', '&:hover': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }, py: open ? 1 : 1.5 }}>
                <ListItemIcon sx={{ color: isDarkMode ? 'text.primary' : 'text.secondary', minWidth: open ? '40px' : '0px', mr: open ? 'auto' : 'auto', justifyContent: 'center' }}>
                  <LanguageIcon />
                </ListItemIcon>
                {open && <ListItemText primary={<T>settings.language</T>} slotProps={{ primary: { sx: { fontWeight: 'normal', color: isDarkMode ? 'text.primary' : 'inherit' } } }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <Menu anchorEl={languageAnchorEl} open={Boolean(languageAnchorEl)} onClose={handleLanguageClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <MenuItem onClick={() => handleLanguageChange('english')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('zh')}>中文</MenuItem>
          </Menu>

          <Divider sx={{ my: 2, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' }} />

          {/* Filtered Menu Items */}
          {sidebarMenuItems.map((item) => {
            // Licence Check
            const isLicensed = licenceStatus === 'active';
            const isLoadingLicence = licenceStatus === 'loading';

            // If requires licence and not licensed, don't render
            if (item.requiresLicence && !isLicensed) {
                // Optionally render a disabled item or placeholder while loading
                if (isLoadingLicence && open) {
                     return (
                         <ListItem key={item.path} disablePadding sx={{ mt: 0.5, opacity: 0.5 }}>
                             <ListItemButton disabled sx={{ justifyContent: 'initial', borderRadius: '8px', py: 1 }}>
                                 <ListItemIcon sx={{ minWidth: '40px', mr: 'auto', justifyContent: 'center' }}>
                                     {item.icon}
                                 </ListItemIcon>
                                 <ListItemText primary={<CircularProgress size={16}/>} />
                             </ListItemButton>
                         </ListItem>
                     );
                }
                // Optionally render a disabled item with a lock icon if licence is inactive/error/not_set
                if (!isLoadingLicence && open) {
                     return (
                        <Tooltip key={item.path} title={t('sidebar.requiresLicenceTooltip') || "Requires active licence"} placement="right" arrow>
                         <ListItem disablePadding sx={{ mt: 0.5, opacity: 0.6 }}>
                             <ListItemButton disabled sx={{ justifyContent: 'initial', borderRadius: '8px', py: 1 }}>
                                 <ListItemIcon sx={{ minWidth: '40px', mr: 'auto', justifyContent: 'center' }}>
                                     {item.icon}
                                 </ListItemIcon>
                                 <ListItemText primary={<T>{item.text}</T>} />
                                 <LockIcon fontSize="small" sx={{ml:1}}/>
                             </ListItemButton>
                         </ListItem>
                         </Tooltip>
                     );
                }
                 // Don't show anything if sidebar is collapsed and licence is missing/loading
                 if (!open) return null;
            }

            // Render enabled item
            return (
              <ListItem key={item.path} disablePadding sx={{ mt: 0.5 }}>
                <Tooltip title={open ? '' : <T>{item.text}</T>} placement="right" arrow>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    disabled={isLoadingLicence && item.requiresLicence} // Disable if loading licence status for licensed item
                    sx={{
                      justifyContent: open ? 'initial' : 'center', borderRadius: '8px',
                      backgroundColor: isActive(item.path) ? (isDarkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.12)') : 'transparent',
                      '&:hover': { backgroundColor: isActive(item.path) ? (isDarkMode ? 'rgba(25, 118, 210, 0.25)' : 'rgba(25, 118, 210, 0.18)') : (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)') },
                      py: open ? 1 : 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : (isDarkMode ? 'text.primary' : 'text.secondary'), minWidth: open ? '40px' : '0px', mr: open ? 'auto' : 'auto', justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {open && <ListItemText primary={<T>{item.text}</T>} slotProps={{ primary: { sx: { fontWeight: isActive(item.path) ? 'medium' : 'normal', color: isDarkMode ? 'text.primary' : 'inherit' } } }} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </Box>

        {/* Bottom Section (Logout, Profile) */}
        <Box>
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <Tooltip title={open ? '' : <T>sidebar.logout</T>} placement="right" arrow>
              <ListItemButton onClick={handleLogoutClick} sx={{ justifyContent: open ? 'initial' : 'center', borderRadius: '8px', '&:hover': { backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.08)' }, py: open ? 1 : 1.5 }}>
                <ListItemIcon sx={{ color: 'error.main', minWidth: open ? '40px' : '0px', mr: open ? 'auto' : 'auto', justifyContent: 'center' }}>
                  <LogoutIcon />
                </ListItemIcon>
                {open && <ListItemText primary={<T>sidebar.logout</T>} sx={{ color: isDarkMode ? 'text.primary' : 'inherit' }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {open ? (
            <Tooltip title={<T>sidebar.viewProfile</T>} arrow placement="top">
              <Box onClick={() => navigate('/settings')} sx={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`, px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' } }}>
                <Avatar sx={{ width: 38, height: 38, flexShrink: 0, bgcolor: 'primary.main', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}> <AccountCircleIcon /> </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', color: isDarkMode ? 'text.primary' : 'inherit' }}> {localStorage.getItem('username')} </Typography>
                  <Typography variant="caption" noWrap sx={{ opacity: 0.7, display: 'block', color: isDarkMode ? 'text.secondary' : 'inherit' }}> {localStorage.getItem('email')} </Typography>
                </Box>
              </Box>
            </Tooltip>
          ) : (
            <Tooltip title={<T>sidebar.viewProfile</T>} arrow placement="right">
              <Box onClick={() => navigate('/settings')} sx={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`, py: 2, display: 'flex', justifyContent: 'center', cursor: 'pointer', '&:hover': { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' } }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}> <AccountCircleIcon /> </Avatar>
              </Box>
            </Tooltip>
          )}
        </Box>
      </List>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" PaperProps={{ elevation: 3, sx: { borderRadius: 2, p: 1 } }}>
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}><T>sidebar.confirmLogout</T></DialogTitle>
        <DialogContent> <DialogContentText id="alert-dialog-description"><T>sidebar.logoutMessage</T></DialogContentText> </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDialogClose} variant="outlined" color="primary" sx={{ borderRadius: '4px', textTransform: 'none', px: 2 }}> <T>sidebar.cancel</T> </Button>
          <Button onClick={handleLogoutConfirm} autoFocus variant="contained" color="error" sx={{ borderRadius: '4px', textTransform: 'none', px: 2, boxShadow: '0px 2px 4px rgba(211, 47, 47, 0.25)', '&:hover': { backgroundColor: '#d32f2f', boxShadow: '0px 3px 6px rgba(211, 47, 47, 0.35)' } }}> <T>sidebar.logoutButton</T> </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth, flexShrink: 0, transition: 'width 0.2s ease-in-out',
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box', width: open ? drawerWidth : collapsedWidth,
            backgroundColor: isDarkMode ? 'background.paper' : '#f8f9fa', // Use theme background or fallback
            borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: isDarkMode ? '0px 1px 3px rgba(0,0,0,0.2)' : '0px 1px 3px rgba(0,0,0,0.08)',
            transition: 'width 0.2s ease-in-out', overflowX: 'hidden',
          },
        }}
        open={open}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3,
          width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          transition: 'width 0.2s ease-in-out',
          // Ensure main content area uses theme background
          bgcolor: 'background.default',
          minHeight: '100vh' // Ensure it takes full height
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
