import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";

import { useTranslation } from 'react-i18next';

export default function Settings() {
  const API_URL = "http://localhost:8000";
  const { t } = useTranslation();

  const defaultSettings = {
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      contactNumber: "",
    },
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    contactNumber: "",
    firstName: "",
    lastName: "",
  });

  const fallbackTranslations = {
    'settings.profile': 'Profile Settings',
    'settings.firstName': 'First Name',
    'settings.lastName': 'Last Name',
    'settings.username': 'Username',
    'settings.contactNumber': 'Contact Number',
    'settings.email': 'Email',
    'settings.changePassword': 'Change Password',
    'settings.saveSettings': 'Save Settings',
    'settings.passwordDialog.title': 'Change Password',
    'settings.passwordDialog.description': 'To change your password, please enter your current password and your new password.',
    'settings.passwordDialog.currentPassword': 'Current Password',
    'settings.passwordDialog.newPassword': 'New Password',
    'settings.passwordDialog.confirmPassword': 'Confirm New Password',
    'settings.passwordDialog.cancel': 'Cancel',
    'settings.passwordDialog.change': 'Change Password',
  };

  const translate = (key) => {
    try {
      const translation = t(key);
      return translation !== key ? translation : fallbackTranslations[key] || key;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return fallbackTranslations[key] || key;
    }
  };

  const loadUserProfile = async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
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
      setSnackbarMessage("Failed to load profile data");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId") || 1;
    loadUserProfile(userId);
  }, []);

  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const saveSettings = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbarMessage("Please correct the errors in the form");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
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

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const changePassword = () => {
    setPasswordDialogOpen(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleClosePasswordDialog = () => setPasswordDialogOpen(false);

  const handlePasswordDataChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const submitPasswordChange = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
    if (!passwordData.confirmPassword) newErrors.confirmPassword = "Please confirm your new password";
    else if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setPasswordDialogOpen(false);
    setSnackbarMessage("Password changed successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const validateProfileForm = () => {
    const errors = {};
    if (/[`~!@#$%^&*()_.|+\-=?;:'",<>\{\}\[\]\\\/]/g.test(settings.profile.username)) errors.username = "Username should not contain special characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.profile.email)) errors.email = "Please enter a valid email address";
    if (settings.profile.contactNumber && settings.profile.contactNumber.search(/^[0-9]{8}$/) === -1) errors.contactNumber = "Contact number must be 8 digits";
    if (!settings.profile.firstName.trim()) errors.firstName = "First name is required";
    if (!settings.profile.lastName.trim()) errors.lastName = "Last name is required";
    if (!settings.profile.username.trim()) errors.username = "Username is required";
    if (!settings.profile.email.trim()) errors.email = "Email is required";
    return errors;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12 }}>
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonIcon sx={{ mr: 1 }} />
              {translate('settings.profile')} {isLoading && "(Loading...)"}
            </Box>
          }
          sx={{ backgroundColor: "secondary.light", color: "secondary.contrastText", py: 1.5 }}
          slotProps={{ title: { fontWeight: 500 } }}
        />
        <CardContent sx={{ p: 3 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={t('settings.firstName')}
                  value={settings.profile.firstName}
                  onChange={(e) => handleSettingChange("profile", "firstName", e.target.value)}
                  disabled={isLoading}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={t('settings.lastName')}
                  value={settings.profile.lastName}
                  onChange={(e) => handleSettingChange("profile", "lastName", e.target.value)}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={t('settings.username')}
                  value={settings.profile.username}
                  onChange={(e) => handleSettingChange("profile", "username", e.target.value)}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label={t('settings.contactNumber')}
                  value={settings.profile.contactNumber}
                  onChange={(e) => handleSettingChange("profile", "contactNumber", e.target.value)}
                  error={!!formErrors.contactNumber}
                  helperText={formErrors.contactNumber}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('settings.email')}
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleSettingChange("profile", "email", e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid size={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1, borderRadius: 2, textTransform: "none" }}
                  onClick={changePassword}
                >
                  {t('settings.changePassword')}
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

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
            "&:hover": { boxShadow: "0 6px 15px rgba(25, 118, 210, 0.4)", transform: "translateY(-2px)" },
          }}
        >
          {t('settings.saveSettings')}
        </Button>
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>{snackbarMessage}</Alert>
      </Snackbar>

      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog}>
        <DialogTitle>{t('settings.passwordDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('settings.passwordDialog.description')}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t('settings.passwordDialog.currentPassword')}
            type="password"
            fullWidth
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordDataChange("currentPassword", e.target.value)}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
          />
          <TextField
            margin="dense"
            label={t('settings.passwordDialog.newPassword')}
            type="password"
            fullWidth
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordDataChange("newPassword", e.target.value)}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword}
          />
          <TextField
            margin="dense"
            label={t('settings.passwordDialog.confirmPassword')}
            type="password"
            fullWidth
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordDataChange("confirmPassword", e.target.value)}
            error={!!passwordErrors.confirmPassword}
            helperText={passwordErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">{t('settings.passwordDialog.cancel')}</Button>
          <Button onClick={submitPasswordChange} color="primary">{t('settings.passwordDialog.change')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
