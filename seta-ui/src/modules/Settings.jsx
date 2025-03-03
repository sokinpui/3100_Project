import React, { useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is installed
import Grid from "@mui/material/Grid2";
import {
  Container,
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
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

// Import icons
import ColorLensIcon from "@mui/icons-material/ColorLens";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
// import LanguageIcon from '@mui/icons-material/Language';

export default function Settings() {
  const API_URL = "http://localhost:8000";

  // Default settings state
  const defaultSettings = {
    theme: "light",
    language: "english",
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      contactNumber: "",
    },
  };

  // State for settings
  const [settings, setSettings] = useState(defaultSettings);

  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for notification on save
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Add these state variables near other state declarations
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add this after your other state declarations
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    contactNumber: "",
    firstName: "",
    lastName: "",
  });

  // Function to load user profile from the API
  const loadUserProfile = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual API URL
      const response = await axios.get(`http://localhost:8000/users/${userId}`);

      // Update the profile settings with data from API
      setSettings((prevSettings) => ({
        ...prevSettings,
        profile: {
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          username: response.data.username,
          contactNumber: response.data.contact_number || "",
        },
      }));

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load profile data. Please try again later.");
      setIsLoading(false);

      // Show error message
      setSnackbarMessage("Failed to load profile data");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Load saved settings from localStorage when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      // Load theme and language preferences from localStorage
      const parsedSettings = JSON.parse(savedSettings);
      setSettings((prevSettings) => ({
        ...prevSettings,
        theme: parsedSettings.theme || defaultSettings.theme,
        language: parsedSettings.language || defaultSettings.language,
      }));
    }

    // Load user profile from API
    // For demo purposes, using user ID 1. In a real app, get this from authentication context
    const userId = localStorage.getItem("userId") || 1;
    loadUserProfile(userId);
  }, []);

  // Handler for settings changes
  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error for the field being edited
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handler for simple settings changes (top level)
  const handleDirectSettingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle saving settings
  const saveSettings = async () => {
    // Validate form data first
    const errors = validateProfileForm();

    // If there are validation errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbarMessage("Please correct the errors in the form");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Save theme and language to localStorage
      localStorage.setItem(
        "userSettings",
        JSON.stringify({
          theme: settings.theme,
          language: settings.language,
        })
      );

      // Save profile data to backend
      const userId = localStorage.getItem("userId") || 1;
      await axios.put(`${API_URL}/users/${userId}`, {
        username: settings.profile.username,
        email: settings.profile.email,
        first_name: settings.profile.firstName,
        last_name: settings.profile.lastName,
        contact_number: settings.profile.contactNumber,
      });

      setSnackbarMessage("Settings saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbarMessage("Failed to save settings.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Available languages
  const languages = ["English", "Chinese"];

  // Replace the empty changePassword function with this implementation
  const changePassword = () => {
    setPasswordDialogOpen(true);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
  };

  const handlePasswordDataChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for the field being edited
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const submitPasswordChange = () => {
    // Validate inputs
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // If there are errors, display them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    // In a real app, you would call an API to change the password
    // For this demo, we'll simulate success

    // Close dialog
    setPasswordDialogOpen(false);

    // Show success message
    setSnackbarMessage("Password changed successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Add this function to validate the form fields
  const validateProfileForm = () => {
    const errors = {};

    // Username validation - no special characters allowed
    if (
      /[`~!@#$%^&*()_.|+\-=?;:'",<>\{\}\[\]\\\/]/g.test(
        settings.profile.username
      )
    ) {
      errors.username = "Username should not contain special characters";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.profile.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Contact number validation - must be exactly 8 digits
    if (
      settings.profile.contactNumber &&
      settings.profile.contactNumber.search(/^[0-9]{8}$/) === -1
    ) {
      errors.contactNumber = "Contact number must be 8 digits";
    }

    // Required field validations
    if (!settings.profile.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!settings.profile.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!settings.profile.username.trim()) {
      errors.username = "Username is required";
    }

    if (!settings.profile.email.trim()) {
      errors.email = "Email is required";
    }

    return errors;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12 }}>
      {/* Profile Settings Card */}
      <Card
        elevation={3}
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile Settings {isLoading && "(Loading...)"}
            </Box>
          }
          sx={{
            backgroundColor: "secondary.light",
            color: "secondary.contrastText",
            py: 1.5,
          }}
          slotProps={{ title: { fontWeight: 500 } }}
        />
        <CardContent sx={{ p: 3 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {/* First Row */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={settings.profile.firstName}
                  onChange={(e) =>
                    handleSettingChange("profile", "firstName", e.target.value)
                  }
                  disabled={isLoading}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={settings.profile.lastName}
                  onChange={(e) =>
                    handleSettingChange("profile", "lastName", e.target.value)
                  }
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
              </Grid>

              {/* Second Row */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.profile.username}
                  onChange={(e) =>
                    handleSettingChange("profile", "username", e.target.value)
                  }
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={settings.profile.contactNumber}
                  onChange={(e) =>
                    handleSettingChange(
                      "profile",
                      "contactNumber",
                      e.target.value
                    )
                  }
                  error={!!formErrors.contactNumber}
                  helperText={formErrors.contactNumber}
                />
              </Grid>

              {/* Third Row */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    handleSettingChange("profile", "email", e.target.value)
                  }
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>

              <Grid size={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                  onClick={changePassword}
                >
                  Change Password
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Theme and Appearance Card */}
      <Card
        elevation={3}
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ColorLensIcon sx={{ mr: 1 }} />
              Theme & Appearance
            </Box>
          }
          sx={{
            backgroundColor: "primary.light",
            color: "primary.contrastText",
            py: 1.5,
          }}
          slotProps={{ title: { fontWeight: 500 } }}
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
                  onChange={(e) =>
                    handleDirectSettingChange("theme", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleDirectSettingChange("language", e.target.value)
                  }
                >
                  {languages.map((lang) => (
                    <MenuItem
                      key={lang.toLowerCase()}
                      value={lang.toLowerCase()}
                    >
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
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
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: "medium",
            boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)",
              transform: "translateY(-2px)",
            },
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To change your password, please enter your current password and your
            new password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={passwordData.currentPassword}
            onChange={(e) =>
              handlePasswordDataChange("currentPassword", e.target.value)
            }
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={passwordData.newPassword}
            onChange={(e) =>
              handlePasswordDataChange("newPassword", e.target.value)
            }
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={passwordData.confirmPassword}
            onChange={(e) =>
              handlePasswordDataChange("confirmPassword", e.target.value)
            }
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={submitPasswordChange} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
