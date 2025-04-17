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
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const API_URL = "http://localhost:8000";
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetRequestLoading, setResetRequestLoading] = useState(false);
  const [resetRequestError, setResetRequestError] = useState("");

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

  const openPasswordDialog = () => {
    setResetEmailSent(false);
    setResetRequestError('');
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => setPasswordDialogOpen(false);

  const handleRequestPasswordReset = async () => {
    setResetRequestLoading(true);
    setResetRequestError('');
    setResetEmailSent(false);

    const userEmail = settings.profile.email;
    if (!userEmail) {
      setResetRequestError('User email not found. Cannot send reset link.');
      setResetRequestLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/request-password-reset`, {
        email: userEmail
      });
      setSnackbarMessage(response.data.message || "Password reset email request sent.");
      setSnackbarSeverity("success");
      setResetEmailSent(true);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      const message = error.response?.data?.detail || "Failed to send password reset email. Please try again.";
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setResetRequestError(message);
    } finally {
      setResetRequestLoading(false);
      setSnackbarOpen(true);
    }
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
                  onClick={openPasswordDialog}
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

      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('settings.passwordDialog.title')}</DialogTitle>
        <DialogContent>
          {!resetEmailSent ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Click the button below to send a password reset link to your registered email address ({settings.profile.email || 'loading...'}).
              </DialogContentText>
              {resetRequestError && (
                <Alert severity="error" sx={{ mb: 2 }}>{resetRequestError}</Alert>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  onClick={handleRequestPasswordReset}
                  color="primary"
                  variant="contained"
                  disabled={resetRequestLoading || !settings.profile.email}
                >
                  {resetRequestLoading ? "Sending..." : "Send Password Reset Email"}
                </Button>
              </Box>
            </>
          ) : (
            <DialogContentText sx={{ textAlign: 'center' }}>
              <Alert severity="success">
                Password reset instructions have been sent to your email. Please check your inbox (and spam folder).
              </Alert>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            {resetEmailSent ? "Close" : t('settings.passwordDialog.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
