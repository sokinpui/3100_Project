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
    <Box sx={{ 
      overflow: 'auto',      // Enable scrolling if content overflows
      height: '100%',        // Take full height of container
      display: 'flex',       // Use flexbox layout
      flexDirection: 'column'// Stack children vertically
    }}>
      {/* App Title Section */}
      <Box
        sx={{
          height: '64px',    // Fixed height header
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          mb: 2             // Margin bottom for spacing
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          SETA App
        </Typography>
      </Box>

      {/* Navigation Menu List */}
      {/* flexGrow: 1 pushes the user profile section to bottom */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Profile Section */}
      {/* Positioned at bottom using flex layout */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          px: 2,              // Horizontal padding only
          py: 1.5,           // Vertical padding (slightly reduced)
          display: 'flex',   // Use flexbox for alignment
          alignItems: 'center', // Center items vertically
          gap: 1,            // Space between avatar and text
          boxSizing: 'border-box', // Include padding in width calculation
          minWidth: 0        // Allow child elements to shrink below their default minimum width
        }}
      >
        <Avatar sx={{ 
          width: 32, 
          height: 32,
          flexShrink: 0     // Prevent avatar from shrinking
        }}>Hi</Avatar>
        <Typography 
          variant="body2" 
          noWrap           // Prevent text wrapping
          sx={{
            flexGrow: 1,   // Take up remaining space
            minWidth: 0    // Allow text to shrink
          }}
        >
          User Name
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>    {/* Flex container for layout */}
      {/* Permanent Drawer - Always visible sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#f8f9fa',  // Add this line - you can use any color
            // Or use MUI theme colors like:
            // backgroundColor: 'background.default',
            // backgroundColor: 'grey.100',
          },
        }}
        open
      >
        {drawer}
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