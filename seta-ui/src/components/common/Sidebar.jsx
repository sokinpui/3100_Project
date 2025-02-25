import React from 'react';
// For navigation between pages
import { useNavigate } from 'react-router-dom';

// Material-UI Components
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
  DialogTitle
} from '@mui/material';

// Material-UI Icons for navigation items
import {
  Dashboard as DashboardIcon,
  AddCard as AddCardIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

// Width of the sidebar in pixels
const drawerWidth = 200;

// Navigation menu items configuration
// Each item has text label, icon component, and navigation path
const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon sx={{ color: 'primary.main' }} />, 
    path: '/' 
  },
  { 
    text: 'Add Expense', 
    icon: <AddCardIcon sx={{ color: 'success.main' }} />, 
    path: '/add-expense' 
  },
  { 
    text: 'Reports', 
    icon: <AssessmentIcon sx={{ color: 'info.main' }} />, 
    path: '/reports' 
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon sx={{ color: 'warning.main' }} />, 
    path: '/settings' 
  },
];

export default function Sidebar({ children }) {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // State to control the logout confirmation dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  // Handle logout button click
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  // Handle logout confirmation
  const handleLogoutConfirm = () => {
    // Remove auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('loginTime');
    // Close the dialog
    setLogoutDialogOpen(false);
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setLogoutDialogOpen(false);
  };

  // Custom button style with improved hover effects
  const buttonStyle = {
    cancel: {
      color: 'primary.main',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.08)', // Light blue background on hover
      }
    },
    logout: {
      color: 'error.main',
      '&:hover': {
        backgroundColor: 'rgba(211, 47, 47, 0.08)', // Light red background on hover
      }
    }
  };

  // Reusable drawer content component
  // Contains the list of navigation items
  const drawer = (
    <Box sx={{ 
      overflow: 'auto',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* App Title Section */}
      <Box
        sx={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SETA App
        </Typography>
      </Box>

      {/* Navigation Menu List */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Profile Section */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxSizing: 'border-box',
          minWidth: 0
        }}
      >
        <Avatar sx={{ 
          width: 32, 
          height: 32,
          flexShrink: 0
        }}>Hi</Avatar>
        <Typography 
          variant="body2" 
          noWrap
          sx={{
            flexGrow: 1,
            minWidth: 0
          }}
        >
          User Name
        </Typography>
      </Box>
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Logout Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            sx={buttonStyle.cancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            autoFocus 
            sx={buttonStyle.logout}
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
          ml: `${drawerWidth}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}