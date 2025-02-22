import React from 'react';
// For navigation between pages
import { useNavigate } from 'react-router-dom';

// Material-UI Components
import {
  Box,            // A div with enhanced styling capabilities
  Drawer,         // Side panel that can slide in/out
  List,           // Container for vertical list items
  ListItem,       // Individual list item container
  ListItemButton, // Makes list item clickable
  ListItemIcon,   // Container for icons in list items
  ListItemText,   // Container for text in list items
  Typography,
  Avatar
} from '@mui/material';

// Material-UI Icons for navigation items
import {
  Dashboard as DashboardIcon,  // Home/Dashboard icon
  AddCard as AddCardIcon,      // Card/Payment icon
  Assessment as AssessmentIcon, // Chart/Report icon
  Settings as SettingsIcon,    // Gear/Settings icon
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

  // Reusable drawer content component
  // Contains the list of navigation items
  const drawer = (
    <Box sx={{ overflow: 'auto' }}>      {/* Container with scrolling capability */}
      {/* Logo/Title of the app */}
      <Box
        sx={{                         // Styles for the box component
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}> {/* Heading text */}
          SETA App
        </Typography>
      </Box>

      <List>                             {/* Vertical list container */}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>  {/* Individual menu item */}
            <ListItemButton onClick={() => navigate(item.path)}> {/* Clickable area */}
              <ListItemIcon>{item.icon}</ListItemIcon>  {/* Icon container */}
              <ListItemText primary={item.text} />      {/* Text label */}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box                                // User profile section
        sx={{
          position: 'absolute',
          bottom: 0,
          width: drawerWidth-32,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Avatar sx={{ width: 32, height: 32 }}>U</Avatar> {/* User avatar */}
        <Typography variant="body2">User Name</Typography>  {/* User name */}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>    {/* Flex container for layout */}
      {/* Permanent Drawer - Always visible sidebar */}
      <Drawer
        variant="permanent"            // Always visible, not collapsible
        sx={{
          width: drawerWidth,         // Width of the drawer
          '& .MuiDrawer-paper': {     // Styles for the paper component inside drawer
            boxSizing: 'border-box',  // Include padding in width calculation
            width: drawerWidth,       // Same width as drawer
          },
        }}
        open                          // Always open
      >
        {drawer}                      {/* Insert drawer content defined above */}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"              // Renders as <main> element
        sx={{
          flexGrow: 1,               // Take up remaining space
          p: 3,                      // Padding of 24px (3 * 8px)
          width: `calc(100% - ${drawerWidth}px)`,  // Full width minus sidebar
          ml: `${drawerWidth}px`,    // Left margin to account for sidebar
        }}
      >
        {children}                   {/* Render child components */}
      </Box>
    </Box>
  );
}