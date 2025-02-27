import React from 'react';
// React Router hooks for navigation and location tracking
import { useNavigate, useLocation } from 'react-router-dom';

// Material-UI Components - Each provides specific UI functionality
import {
  Box,          // Flexible container component with margin, padding, and layout controls
  Drawer,       // Side panel that can slide in from the edge of the screen
  List,         // Container for displaying items vertically
  ListItem,     // Individual item within a List
  ListItemButton, // Makes ListItem interactive and clickable
  ListItemIcon, // Container for icons in a ListItem
  ListItemText, // Text content for a ListItem
  Typography,   // Text component with variants for different text styles
  Avatar,       // Circular container typically used for user profile images
  Button,       // Standard clickable button component
  Dialog,       // Modal window that appears in front of the main content
  DialogActions, // Container for dialog buttons, usually at bottom
  DialogContent, // Main content area of a Dialog
  DialogContentText, // Text content within dialog body
  DialogTitle,  // Title section of a Dialog
  Divider,      // Horizontal line to separate content
  Tooltip       // Info popup when hovering over elements
} from '@mui/material';

// Material-UI Icons - Pre-designed SVG icons
import {
  Dashboard as DashboardIcon,     // Home/overview icon
  AddCard as AddCardIcon,         // Add/create/new item icon
  Assessment as AssessmentIcon,   // Charts/reports/analytics icon
  Settings as SettingsIcon,       // Configuration/preferences icon
  Logout as LogoutIcon,           // Sign out icon
  AccountCircle as AccountCircleIcon // User profile icon
} from '@mui/icons-material';

// Width of the sidebar in pixels - Important for layout calculations
const drawerWidth = 240; // 240px is a common width for desktop sidebars

// Navigation menu configuration - Defines each menu item's properties
// This data structure makes it easy to add/remove menu items
const menuItems = [
  { 
    text: 'Dashboard',  // Display name
    icon: <DashboardIcon />, // Icon component to display
    path: '/'  // Route path for navigation
  },
  { 
    text: 'Add Expense', 
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
  // React Router hook for programmatic navigation between routes
  const navigate = useNavigate();
  
  // Hook that returns the current URL location object
  // Used to determine which menu item is currently active
  const location = useLocation();
  
  // State to control the visibility of the logout confirmation dialog
  // useState hook returns a state value and a setter function
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  // Event handler for when user clicks the logout button
  // Opens the confirmation dialog
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true); // Update state to show dialog
  };

  // Event handler for confirming logout
  // Clears authentication data and redirects to login page
  const handleLogoutConfirm = () => {
    // Remove authentication data from browser storage
    localStorage.removeItem('loginTime');
    
    // Close the dialog by updating state
    setLogoutDialogOpen(false);
    
    // Redirect to login page
    // replace: true replaces current entry in history stack rather than pushing a new one
    navigate('/login', { replace: true });
  };

  // Event handler for closing dialog without logging out
  const handleDialogClose = () => {
    setLogoutDialogOpen(false);
  };

  // Helper function to check if a menu item corresponds to current URL path
  // Used to highlight the active menu item
  const isActive = (path) => {
    return location.pathname === path; // Returns true if paths match
  };

  // The sidebar content definition
  // This is separated to keep the code organized
  const drawer = (
    <Box sx={{ 
      // sx prop is Material UI's styling solution - similar to inline CSS but with theme access
      overflow: 'auto', // Enables scrolling if content is too tall
      height: '100%',   // Takes full height of parent
      display: 'flex',  // Enables flexbox layout
      flexDirection: 'column', // Stack children vertically
    }}>
      {/* App Logo and Title Section - Top bar with app name */}
      <Box
        sx={{
          height: '80px', // Fixed height header
          display: 'flex',
          alignItems: 'center',     // Vertical center
          justifyContent: 'center', // Horizontal center
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)', // Bottom border
          // Gradient background creates a modern look
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white', // Text color
          mb: 2 // Margin bottom of 16px (2 * 8px theme spacing)
        }}
      >
        {/* App title with custom typography styling */}
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold',
          letterSpacing: '1px', // Spacing between letters
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)' // Subtle shadow for depth
        }}>
          SETA App
        </Typography>
      </Box>

      {/* Navigation Menu - Contains all navigation items */}
      {/* List is a container that renders items in a vertical column */}
      <List sx={{ 
        flexGrow: 1, // Takes available space in flex container
        px: 2 // Horizontal padding of 16px (2 * 8px theme spacing)
      }}>
        {/* Main Menu Section Heading */}
        <Typography 
          variant="overline" // Small uppercase text style
          sx={{ 
            pl: 2, // Left padding
            opacity: 0.7, // Makes text slightly transparent
            fontWeight: 'bold',
            letterSpacing: 1 // Spacing between letters
          }}
        >
          Main Menu
        </Typography>
        
        {/* Map through menu items array to create navigation buttons */}
        {/* This approach makes adding new menu items easy */}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)} // Navigate when clicked
              sx={{
                borderRadius: '8px', // Rounded corners for modern look
                // Background changes based on active state
                backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                '&:hover': {
                  // Different hover effect for active vs inactive
                  backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.18)' : 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'background-color 0.2s' // Smooth color transition animation
              }}
            >
              {/* Icon container - Controls icon appearance */}
              <ListItemIcon sx={{ 
                // Icon color changes when active
                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                minWidth: '40px' // Fixed width for alignment
              }}>
                {item.icon} {/* Render the icon from menu item config */}
              </ListItemIcon>
              
              {/* Text label for the menu item */}
              <ListItemText 
                primary={item.text} // The visible text
                primaryTypographyProps={{ 
                  // Text gets bolder when active
                  fontWeight: isActive(item.path) ? 'medium' : 'regular'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Divider creates a horizontal line to separate content sections */}
        <Divider sx={{ my: 2 }} /> {/* my: margin top and bottom */}
        
        {/* Account Section Heading */}
        <Typography 
          variant="overline" 
          sx={{ 
            pl: 2, 
            opacity: 0.7, 
            fontWeight: 'bold',
            letterSpacing: 1
          }}
        >
          Account
        </Typography>
        
        {/* Logout Button - Special styling for destructive action */}
        <ListItem disablePadding sx={{ mt: 0.5 }}>
          <ListItemButton 
            onClick={handleLogoutClick} // Opens confirmation dialog
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)', // Light red hover effect
              },
              transition: 'background-color 0.2s' // Smooth animation
            }}
          >
            {/* Red icon indicates caution/warning */}
            <ListItemIcon sx={{ 
              color: 'error.main', // Red color from theme
              minWidth: '40px'
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Profile Section - Bottom of sidebar */}
      {/* Tooltip shows extra info on hover */}
      <Tooltip title="View Profile" arrow placement="top">
        <Box
          sx={{
            borderTop: '1px solid rgba(0, 0, 0, 0.12)', // Top border
            px: 2, // Horizontal padding
            py: 2, // Vertical padding
            display: 'flex',
            alignItems: 'center',
            gap: 1.5, // Space between avatar and text
            boxSizing: 'border-box',
            minWidth: 0,
            cursor: 'pointer', // Hand cursor indicates clickability
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
            },
            transition: 'background-color 0.2s' // Smooth animation
          }}
          onClick={() => navigate('/profile')} // Navigate to profile page when clicked
        >
          {/* User Avatar - Could display user photo if available */}
          <Avatar sx={{ 
            width: 38, 
            height: 38,
            flexShrink: 0, // Prevents avatar from shrinking
            bgcolor: 'primary.main', // Blue background from theme
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
          }}>
            <AccountCircleIcon /> {/* Default user icon */}
          </Avatar>
          
          {/* User information container */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Username with bold styling */}
            <Typography 
              variant="body2" 
              noWrap // Prevents text wrapping, shows ellipsis instead
              sx={{
                fontWeight: 'bold'
              }}
            >
              User Name
            </Typography>
            {/* Email with muted styling */}
            <Typography 
              variant="caption" // Smaller text size
              noWrap
              sx={{
                opacity: 0.7, // Partially transparent
                display: 'block' // Ensures it's on its own line
              }}
            >
              user@example.com
            </Typography>
          </Box>
        </Box>
      </Tooltip>
      
      {/* Logout Confirmation Dialog - Modal popup */}
      <Dialog
        open={logoutDialogOpen} // Controls visibility based on state
        onClose={handleDialogClose} // Called when clicking outside or pressing ESC
        aria-labelledby="alert-dialog-title" // Accessibility attribute
        aria-describedby="alert-dialog-description" // Accessibility attribute
        slotProps={{
          elevation: 3, // Shadow depth
          sx: { borderRadius: 2, p: 1 } // Rounded corners and padding
        }}
      >
        {/* Dialog title section */}
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          {"Confirm Logout"} {/* Title text */}
        </DialogTitle>
        
        {/* Dialog content/body section */}
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out of your account?
          </DialogContentText>
        </DialogContent>
        
        {/* Dialog buttons section */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {/* Cancel button - Secondary action */}
          <Button 
            onClick={handleDialogClose} 
            variant="outlined" // Outlined style is less prominent
            color="primary" // Blue color from theme
            sx={{
              borderRadius: '4px', // Slightly rounded corners
              textTransform: 'none', // Prevents ALL CAPS text
              px: 2 // Horizontal padding
            }}
          >
            Cancel
          </Button>
          
          {/* Logout button - Primary destructive action */}
          <Button 
            onClick={handleLogoutConfirm} // Handles actual logout
            autoFocus // Gets focus when dialog opens
            variant="contained" // Solid background style
            color="error"  // Red color indicates destructive action
            sx={{
              borderRadius: '4px',
              textTransform: 'none', // Prevents ALL CAPS text
              px: 2, // Horizontal padding
              boxShadow: '0px 2px 4px rgba(211, 47, 47, 0.25)', // Custom shadow
              '&:hover': {
                backgroundColor: '#d32f2f',  // Slightly darker red on hover
                boxShadow: '0px 3px 6px rgba(211, 47, 47, 0.35)' // Enhanced shadow on hover
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Main component return - Layout structure of the entire page
  return (
    <Box sx={{ display: 'flex' }}> {/* Flex container for sidebar and content */}
      {/* Permanent drawer that's always visible (not collapsible) */}
      <Drawer
        variant="permanent" // Always visible, doesn't slide in/out
        sx={{
          width: drawerWidth, // Width defined at top of file
          '& .MuiDrawer-paper': { // Targets the actual paper component inside drawer
            boxSizing: 'border-box', // Includes padding and border in element's width/height
            width: drawerWidth,
            backgroundColor: '#f8f9fa', // Light gray background
            borderRight: '1px solid rgba(0, 0, 0, 0.08)', // Very subtle right border
            boxShadow: '0px 1px 3px rgba(0,0,0,0.08)', // Subtle shadow for depth
          },
        }}
        open // Always open since it's permanent
      >
        {drawer} {/* Insert the drawer content defined above */}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main" // Semantic HTML - renders as <main>
        sx={{
          flexGrow: 1, // Takes up remaining space
          p: 3, // Padding of 24px (3 * 8px theme spacing)
          width: `calc(100% - ${drawerWidth}px)`, // Full width minus drawer width
        }}
      >
        {children} {/* Renders the child components passed to Sidebar */} 
      </Box>
    </Box>
  );
}