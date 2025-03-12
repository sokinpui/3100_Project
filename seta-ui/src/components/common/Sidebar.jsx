import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import T from '../../utils/T.jsx'; // Import the T component for translation

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  AddCard as AddCardIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Sidebar width (expanded and collapsed)
const drawerWidth = 240;
const collapsedWidth = 70;

// Sidebar Menu Items all listed here
const menuItems = [
  {
    text: 'sidebar.dashboard',
    icon: <DashboardIcon />,
    path: '/'
  },
  {
    text: 'sidebar.expenseManager',
    icon: <AddCardIcon />,
    path: '/add-expense'
  },
  {
    text: 'sidebar.newExpenseManager',
    icon: <AddCardIcon />,
    path: '/manage-expenses'
  },
  {
    text: 'sidebar.reports',
    icon: <AssessmentIcon />,
    path: '/reports'
  },
  {
    text: 'sidebar.settings',
    icon: <SettingsIcon />,
    path: '/settings'
  },
];

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { themeMode, updateTheme } = useTheme(); // Add this to get current theme
  const isDarkMode = themeMode === 'dark';

  // Logout Dialog State
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Reset theme to light explicitly
    updateTheme('light');
    // Remove auth data from storage after confirming logout
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
    localStorage.removeItem('expenses');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setLogoutDialogOpen(false);
    navigate('/login', { replace: true });
  };

  const handleDialogClose = () => {
    setLogoutDialogOpen(false);
  };

  // Check if a menu item is currently active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{
      overflow: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* App Logo and Title */}
      <Box
        sx={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          background: isDarkMode ? 'linear-gradient(45deg, #1565C0 30%, #0D47A1 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          mb: 2,
          px: 2
        }}
      >
        {open && (
          <Typography variant="h5" sx={{
            fontWeight: 'bold',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            <T>sidebar.appName</T>
          </Typography>
        )}
        {!open && <Box />}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, px: open ? 2 : 0.5 }}>
        {open && (
          <Typography
            variant="overline"
            sx={{
              pl: 2,
              opacity: 0.7,
              fontWeight: 'bold',
              letterSpacing: 1,
              color: isDarkMode ? 'text.primary' : 'inherit'
            }}
          >
            <T>sidebar.mainMenu</T>
          </Typography>
        )}

        {/* Sidebar Menu Items mapped by using menuItems*/}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mt: 0.5 }}>
            <Tooltip title={open ? "" : <T>{item.text}</T>} placement="right" arrow>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  justifyContent: open ? 'initial' : 'center',
                  borderRadius: '8px',
                  backgroundColor: isActive(item.path)
                    ? isDarkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.12)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? isDarkMode ? 'rgba(25, 118, 210, 0.25)' : 'rgba(25, 118, 210, 0.18)'
                      : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  },
                  transition: 'background-color 0.2s',
                  py: open ? 1 : 1.5
                }}
              >
                <ListItemIcon sx={{
                  color: isActive(item.path) ? 'primary.main' : isDarkMode ? 'text.primary' : 'text.secondary',
                  minWidth: open ? '40px' : '0px',
                  mr: open ? 'auto' : 'auto',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>

                {open && (
                  <ListItemText
                    primary={<T>{item.text}</T>}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: isActive(item.path) ? 'medium' : 'normal',
                          color: isDarkMode ? 'text.primary' : 'inherit',
                        }
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}

        {/* Divider(a horizontal line) for separating Account section */}
        <Divider sx={{
          my: 2,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
        }} />

        {open && (
          <Typography
            variant="overline"
            sx={{
              pl: 2,
              opacity: 0.7,
              fontWeight: 'bold',
              letterSpacing: 1,
              color: isDarkMode ? 'text.primary' : 'inherit'
            }}
          >
            <T>sidebar.account</T>
          </Typography>
        )}

        {/* Logout Button div and its icon*/}
        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <Tooltip title={open ? "" : <T>sidebar.logout</T>} placement="right" arrow>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                justifyContent: open ? 'initial' : 'center',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.08)',
                },
                transition: 'background-color 0.2s',
                py: open ? 1 : 1.5
              }}
            >
              <ListItemIcon sx={{
                color: 'error.main',
                minWidth: open ? '40px' : '0px',
                mr: open ? 'auto' : 'auto',
                justifyContent: 'center'
              }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary={<T>sidebar.logout</T>} sx={{ color: isDarkMode ? 'text.primary' : 'inherit' }} />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>

      {/* User Profile Section */}
      {open ? (
        <Tooltip title={<T>sidebar.viewProfile</T>} arrow placement="top">
          {/* Profile Section with Avatar, Username and Email */}
          <Box
            sx={{
              borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              px: 2,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              boxSizing: 'border-box',
              minWidth: 0,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
              transition: 'background-color 0.2s'
            }}
            onClick={() => navigate('/settings')}
          >
            <Avatar sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              bgcolor: 'primary.main',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}>
              <AccountCircleIcon />
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{
                fontWeight: 'bold',
                color: isDarkMode ? 'text.primary' : 'inherit'
              }}>
                {localStorage.getItem('username')}
              </Typography>
              <Typography variant="caption" noWrap sx={{
                opacity: 0.7,
                display: 'block',
                color: isDarkMode ? 'text.secondary' : 'inherit'
              }}>
                {localStorage.getItem('email')}
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      ) : (
        <Tooltip title={<T>sidebar.viewProfile</T>} arrow placement="right">
          <Box
            sx={{
              borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              py: 2,
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
            onClick={() => navigate('/profile')}
          >
            <Avatar sx={{
              width: 38,
              height: 38,
              bgcolor: 'primary.main',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}>
              <AccountCircleIcon />
            </Avatar>
          </Box>
        </Tooltip>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        slotProps={{
          elevation: 3,
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          <T>sidebar.confirmLogout</T>
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <T>sidebar.logoutMessage</T>
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '4px',
              textTransform: 'none',
              px: 2
            }}
          >
            <T>sidebar.cancel</T>
          </Button>

          <Button
            onClick={handleLogoutConfirm}
            autoFocus
            variant="contained"
            color="error"
            sx={{
              borderRadius: '4px',
              textTransform: 'none',
              px: 2,
              boxShadow: '0px 2px 4px rgba(211, 47, 47, 0.25)',
              '&:hover': {
                backgroundColor: '#d32f2f',
                boxShadow: '0px 3px 6px rgba(211, 47, 47, 0.35)'
              }
            }}
          >
            <T>sidebar.logoutButton</T>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

    return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease-in-out',
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: open ? drawerWidth : collapsedWidth,
            backgroundColor: isDarkMode ? 'background.paper' : '#f8f9fa',
            borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: isDarkMode ? '0px 1px 3px rgba(0,0,0,0.2)' : '0px 1px 3px rgba(0,0,0,0.08)',
            transition: 'width 0.2s ease-in-out',
            overflowX: 'hidden'
          },
        }}
        open={open}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
          transition: 'width 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

