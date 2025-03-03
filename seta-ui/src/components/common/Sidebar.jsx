import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  Tooltip
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  AddCard as AddCardIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

// Sidebar width
const drawerWidth = 240; 

// Sidebar Menu Items all listed here
const menuItems = [
  { 
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/'
  },
  { 
    text: 'Expense Manager', 
    icon: <AddCardIcon />, 
    path: '/add-expense' 
  },
  { 
    text: 'Reports', 
    icon: <AssessmentIcon />, 
    path: '/reports' 
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/settings' 
  },
];

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Logout Dialog State
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
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
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',   // Gradient background, open for color suggestions.
          color: 'white',
          mb: 2
        }}
      >
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold',
          letterSpacing: '1px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          SETA App
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, px: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ pl: 2, opacity: 0.7, fontWeight: 'bold', letterSpacing: 1 }}
        >
          Main Menu
        </Typography>
        
        {/* Sidebar Menu Items mapped by using menuItems*/}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '8px',
                backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.18)' : 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              
              <ListItemText 
                primary={item.text}
                slotProps={{
                  primary: { 
                    sx: { 
                      fontWeight: isActive(item.path) ? 'medium' : 'normal', 
                    }
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Divider(a horizontal line) for separating Account section */}
        <Divider sx={{ my: 2 }} />  
        
        <Typography 
          variant="overline" 
          sx={{ pl: 2, opacity: 0.7, fontWeight: 'bold', letterSpacing: 1 }}
        >
          Account
        </Typography>
        
        {/* Logout Button div and its icon*/}
        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton 
            onClick={handleLogoutClick}
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
              transition: 'background-color 0.2s'
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Profile Section */}
      <Tooltip title="View Profile" arrow placement="top">
        {/* Profile Section with Avatar, Username and Email */}
        <Box
          sx={{
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            px: 2,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxSizing: 'border-box',
            minWidth: 0,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            transition: 'background-color 0.2s'
          }}
          onClick={() => navigate('/profile')}
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
            <Typography variant="body2" noWrap sx={{ fontWeight: 'bold' }}>
              {localStorage.getItem('username')}
            </Typography>
            <Typography variant="caption" noWrap sx={{ opacity: 0.7, display: 'block' }}>
              {localStorage.getItem('email')}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
      
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
          {"Confirm Logout"}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out of your account?
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
            Cancel
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
            Logout
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
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}