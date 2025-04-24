// seta-ui/src/modules/Settings.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Typography,
  Divider,
  CircularProgress,
  LinearProgress,
  InputAdornment,
  IconButton
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BackupIcon from '@mui/icons-material/Backup';
import DangerousIcon from '@mui/icons-material/Dangerous';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility'; // Added
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import T from "../utils/T"; // Assuming T is a translation component

import { useTranslation } from 'react-i18next';

const validatePasswordComplexity = (password) => {
    // Basic check: At least 8 chars, 1 upper, 1 lower, 1 number, 1 symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
    return passwordRegex.test(password);
};

export default function Settings() {
  const API_URL = "http://localhost:8000";
  const { t } = useTranslation();
  const importFileInputRef = useRef(null);

  const defaultSettings = {
    profile: { firstName: "", lastName: "", email: "", username: "", contactNumber: "" },
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
  const [formErrors, setFormErrors] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [confirmImportDialogOpen, setConfirmImportDialogOpen] = useState(false);

  // Licence Management State
  const [licenceKeyInput, setLicenceKeyInput] = useState('');
  const [currentLicenceStatus, setCurrentLicenceStatus] = useState('loading...');
  const [currentLicenceKeyPrefix, setCurrentLicenceKeyPrefix] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState('');

  // password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState(''); // Error specific to the dialog
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userId = localStorage.getItem("userId");

  // Fetch User Profile and Licence Status
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setError(t('settings.userIdNotFound') || "User ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setActivationError('');

    try {
      const [profileResponse, licenceResponse] = await Promise.all([
        axios.get(`${API_URL}/users/${userId}`),
        axios.get(`${API_URL}/users/${userId}/licence`)
      ]);

      setSettings((prevSettings) => ({
        ...prevSettings,
        profile: {
          firstName: profileResponse.data.first_name,
          lastName: profileResponse.data.last_name,
          email: profileResponse.data.email,
          username: profileResponse.data.username,
          contactNumber: profileResponse.data.contact_number || "",
        },
      }));

      setCurrentLicenceStatus(licenceResponse.data.status);
      setCurrentLicenceKeyPrefix(licenceResponse.data.key_prefix || '');

    } catch (err) {
      console.error("Error loading user data:", err);
      const message = t('settings.loadDataFailed') || "Failed to load user data. Please try again later.";
      setError(message);
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Profile Setting Change Handler
  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Profile Validation
  const validateProfileForm = () => {
    const errors = {};
    if (/[`~!@#$%^&*()_.|+\-=?;:'",<>{}[]\\\/]/.test(settings.profile.username)) {
      errors.username = t('settings.usernameSpecialChars') || "Username should not contain special characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.profile.email)) {
      errors.email = t('settings.invalidEmail') || "Please enter a valid email address";
    }
    if (settings.profile.contactNumber && settings.profile.contactNumber.search(/^[0-9]{8}$/) === -1) {
      errors.contactNumber = t('settings.invalidContactNumber') || "Contact number must be 8 digits";
    }
    if (!settings.profile.firstName.trim()) {
      errors.firstName = t('settings.firstNameRequired') || "First name is required";
    }
    if (!settings.profile.lastName.trim()) {
      errors.lastName = t('settings.lastNameRequired') || "Last name is required";
    }
    if (!settings.profile.username.trim()) {
      errors.username = t('settings.usernameRequired') || "Username is required";
    }
    if (!settings.profile.email.trim()) {
      errors.email = t('settings.emailRequired') || "Email is required";
    }
    return errors;
  };

  // Save Profile Settings
  const saveSettings = async () => {
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbarMessage(t('settings.formErrors') || "Please correct the errors in the form");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.put(`${API_URL}/users/${userId}`, {
        username: settings.profile.username,
        email: settings.profile.email,
        first_name: settings.profile.firstName,
        last_name: settings.profile.lastName,
        contact_number: settings.profile.contactNumber,
      });
      setSnackbarMessage(t('settings.saveSuccess') || "Settings saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      const apiError = error.response?.data?.detail || t('settings.saveFailed') || "Failed to save settings.";
      setSnackbarMessage(apiError);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Snackbar Handler
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Password Dialog Handlers
    const openPasswordDialog = () => {
        // Reset state specific to the password change dialog
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordChangeError('');
        setPasswordChangeLoading(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordDialogOpen(true); // Open the dialog
    };

    const handleClosePasswordDialog = () => {
        if (passwordChangeLoading) return; // Prevent closing while loading
        setPasswordDialogOpen(false);
    };

    // Client-side validation before submitting
    const validatePasswordChangeForm = () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordChangeError(t('settings.passwordDialog.errorFieldsRequired') || 'All password fields are required.'); // Add key
            return false;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordChangeError(t('settings.passwordDialog.errorNewPasswordMismatch'));
            return false;
        }
        if (!validatePasswordComplexity(newPassword)) {
            setPasswordChangeError(t('settings.passwordDialog.errorPasswordStrength'));
            return false;
        }
        setPasswordChangeError(''); // Clear error if validation passes
        return true;
    };

    const handleConfirmPasswordChange = async () => {
        if (!validatePasswordChangeForm()) {
            return; // Stop if validation fails
        }

        setPasswordChangeLoading(true);
        setPasswordChangeError('');

        try {
            await axios.put(`${API_URL}/users/${userId}/password`, {
                current_password: currentPassword,
                new_password: newPassword,
            });

            setSnackbarMessage(t('settings.passwordDialog.success'));
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            handleClosePasswordDialog(); // Close dialog on success

        } catch (error) {
            console.error("Error changing password:", error);
            let message = t('settings.passwordDialog.errorUpdateFailed'); // Default error
            if (error.response) {
                if (error.response.status === 401) {
                    message = t('settings.passwordDialog.errorCurrentMismatch'); // Specific error for wrong current password
                } else if (error.response.data?.detail) {
                    // Use backend detail if available (e.g., if backend adds more validation)
                    message = error.response.data.detail;
                }
            }
            setPasswordChangeError(message); // Show error within the dialog
            // Optionally show snackbar error too, but dialog error is often better UX here
            // setSnackbarMessage(message);
            // setSnackbarSeverity('error');
            // setSnackbarOpen(true);
        } finally {
            setPasswordChangeLoading(false);
        }
    };

  // Data Export/Import Handlers
  const handleExport = async () => {
    setIsExporting(true);
    setSnackbarMessage(t('settings.exportStarting') || "Export starting...");
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    try {
      const response = await axios.get(`${API_URL}/export/all/${userId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `seta_backup_${userId}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage(t('settings.exportSuccess') || "Data exported successfully!");
      setSnackbarSeverity('success');
    } catch (error) {
      console.error("Export error:", error);
      setSnackbarMessage(t('settings.exportFailed') || "Failed to export data.");
      setSnackbarSeverity('error');
    } finally {
      setIsExporting(false);
      setSnackbarOpen(true);
    }
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedImportFile(file);
      setImportError(null);
      setImportResult(null);
    } else {
      setSelectedImportFile(null);
      setImportError(t('settings.importInvalidFile') || "Please select a valid JSON file.");
      setImportResult(null);
    }
  };

  const handleImportButtonClick = () => {
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
    importFileInputRef.current?.click();
  };

  const handleOpenImportConfirmDialog = () => {
    if (!selectedImportFile) return;
    setImportError(null);
    setImportResult(null);
    setConfirmImportDialogOpen(true);
  };

  const handleCloseImportConfirmDialog = () => {
    setConfirmImportDialogOpen(false);
  };

  const handleConfirmImport = async () => {
    handleCloseImportConfirmDialog();
    if (!selectedImportFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', selectedImportFile);

    try {
      const response = await axios.post(`${API_URL}/import/all/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data);
      setSnackbarMessage(t('settings.importSuccess') || "Data imported successfully!");
      setSnackbarSeverity('success');
    } catch (err) {
      console.error("Import API error:", err.response?.data || err.message);
      const apiError = err.response?.data?.detail || t('settings.importFailed') || "Failed to import data.";
      setImportError(apiError);
      setSnackbarMessage(apiError);
      setSnackbarSeverity('error');
    } finally {
      setIsImporting(false);
      setSelectedImportFile(null);
      if (importFileInputRef.current) importFileInputRef.current.value = '';
      setSnackbarOpen(true);
    }
  };

  // Licence Handlers
    // --- Licence Handlers (Keep as is, backend handles validation) ---
    const handleLicenceKeyInputChange = (event) => {
        setLicenceKeyInput(event.target.value);
        if (activationError) setActivationError('');
    };

    const handleActivateLicence = async () => {
        if (!licenceKeyInput.trim()) {
            // Use a more specific key if desired
            setActivationError(t('settings.licenceKeyRequiredError') || 'Please enter a licence key.');
            return;
        }
        setIsActivating(true);
        setActivationError('');
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/licence`, {
                licence_key: licenceKeyInput.trim(), // Send raw key
            });
            // Update status display from response
            if (response.data.licence_status) {
                setCurrentLicenceStatus(response.data.licence_status.status);
                setCurrentLicenceKeyPrefix(response.data.licence_status.key_prefix || '');
            }
            setSnackbarMessage(response.data.message || t('settings.licenceUpdateSuccess'));
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setLicenceKeyInput(''); // Clear input field on success

            window.location.reload();
        } catch (error) {
            console.error("Error activating licence:", error);
            const message = t('settings.licenceUpdateFailed');
            setActivationError(message); // Display backend error (e.g., format error)
            setSnackbarMessage(message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setIsActivating(false);
        }
    };
    // ---

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Card */}
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonIcon sx={{ mr: 1 }} />
              {t('settings.profile')} {isLoading && "(Loading...)"}
            </Box>
          }
          sx={{ backgroundColor: "secondary.light", color: "secondary.contrastText", py: 1.5 }}
          slotProps={{ title: { fontWeight: 500 } }}
        />
        <CardContent sx={{ p: 3 }}>
          {error && !isLoading ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('settings.lastName')}
                  value={settings.profile.lastName}
                  onChange={(e) => handleSettingChange("profile", "lastName", e.target.value)}
                  disabled={isLoading}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('settings.username')}
                  value={settings.profile.username}
                  onChange={(e) => handleSettingChange("profile", "username", e.target.value)}
                  disabled={isLoading}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('settings.contactNumber')}
                  value={settings.profile.contactNumber}
                  onChange={(e) => handleSettingChange("profile", "contactNumber", e.target.value)}
                  disabled={isLoading}
                  error={!!formErrors.contactNumber}
                  helperText={formErrors.contactNumber}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t('settings.email')}
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleSettingChange("profile", "email", e.target.value)}
                  disabled={isLoading}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1, borderRadius: 2, textTransform: "none" }}
                  onClick={openPasswordDialog}
                  disabled={isLoading}
                >
                  {t('settings.changePassword')}
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Licence Management Card */}
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VpnKeyIcon sx={{ mr: 1 }} />
              <T>settings.licenceManagementTitle</T>
            </Box>
          }
          sx={{ backgroundColor: "grey.200", py: 1.5 }}
          titleTypographyProps={{ fontWeight: 500 }}
        />
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <T>settings.licenceDescription</T>
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
             <Typography variant="body1">
                 <T>settings.currentStatus</T>
             </Typography>
             <Typography variant="body1" fontWeight="bold">
                 {isLoading ? <CircularProgress size={20} /> : t(`settings.licenceStatus_${currentLicenceStatus}`)}
             </Typography>
             {currentLicenceKeyPrefix && !isLoading && ( // Only show prefix if not loading
                <Typography variant="caption" color="text.secondary">({currentLicenceKeyPrefix})</Typography>
             )}
          </Box>

          <TextField
            fullWidth
            label={t('settings.licenceKeyLabel')}
            placeholder="AAAA-BBBB-CCCC-DDDD"
            value={licenceKeyInput}
            onChange={handleLicenceKeyInputChange}
            disabled={isActivating || isLoading}
            error={!!activationError}
            helperText={activationError || t('settings.licenceFormatHelper') || 'Format: XXXX-XXXX-XXXX-XXXX (Alphanumeric)'} // Add helper text key
            InputProps={{
              startAdornment: ( <InputAdornment position="start"> <VpnKeyIcon fontSize="small" color="action"/> </InputAdornment> ),
            }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="secondary"
            onClick={handleActivateLicence}
            disabled={isActivating || isLoading || !licenceKeyInput.trim()}
            startIcon={isActivating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            <T>settings.activateLicenceButton</T>
          </Button>
           <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
             {/* Update placeholder note */}
             <T>settings.licenceNoteV2</T>
           </Typography>
        </CardContent>
      </Card>

      {/* Data Management Card */}
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <BackupIcon sx={{ mr: 1 }} />
              {t('settings.dataManagementTitle')}
            </Box>
          }
          sx={{ backgroundColor: "grey.200", py: 1.5 }}
          titleTypographyProps={{ fontWeight: 500 }}
        />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>{t('settings.exportDataTitle')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('settings.exportDataDescription')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting || isLoading}
            >
              {t('settings.exportButton')}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>{t('settings.importDataTitle')}</Typography>
            <Alert severity="warning" icon={<DangerousIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">{t('settings.importWarningTitle')}</Typography>
              <Typography variant="body2">{t('settings.importWarningDescription')}</Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('settings.importDataDescription')}
            </Typography>

            <input
              type="file"
              accept=".json"
              ref={importFileInputRef}
              onChange={handleImportFileChange}
              style={{ display: 'none' }}
              id="import-json-input"
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={handleImportButtonClick}
                disabled={isImporting || isLoading}
              >
                {t('settings.selectImportFile')}
              </Button>
              {selectedImportFile && (
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {selectedImportFile.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="secondary"
              startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
              onClick={handleOpenImportConfirmDialog}
              disabled={!selectedImportFile || isImporting || isLoading}
            >
              {t('settings.importButton')}
            </Button>

            {isImporting && <LinearProgress sx={{ mt: 2 }} />}
            {importError && <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>}
            {importResult && (
              <Alert severity={importResult.errors?.length > 0 ? "warning" : "success"} sx={{ mt: 2 }}>
                <Typography fontWeight="bold">{importResult.message}</Typography>
                {importResult.errors?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" fontWeight="bold">{t('settings.importErrors') || "Errors encountered:"}</Typography>
                    <ul style={{ margin: '0', paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto' }}>
                      {importResult.errors.slice(0, 5).map((err, index) => (
                        <li key={index}><Typography variant="caption">{err}</Typography></li>
                      ))}
                      {importResult.errors.length > 5 && <li><Typography variant="caption">{t('settings.moreErrors') || "...and more."}</Typography></li>}
                    </ul>
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={isLoading || isActivating}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle><T>settings.passwordDialog.title</T></DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <T>settings.passwordDialog.description</T>
          </DialogContentText>
          {passwordChangeError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordChangeError}</Alert>
          )}
          <TextField
            margin="dense"
            required
            fullWidth
            name="currentPassword"
            label={t('settings.passwordDialog.currentPassword')}
            type={showCurrentPassword ? "text" : "password"}
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={passwordChangeLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            name="newPassword"
            label={t('settings.passwordDialog.newPassword')}
            type={showNewPassword ? "text" : "password"}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={passwordChangeLoading}
             InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            name="confirmNewPassword"
            label={t('settings.passwordDialog.confirmPassword')}
            type={showConfirmPassword ? "text" : "password"}
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={passwordChangeLoading}
             InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={passwordChangeLoading}>
            <T>settings.passwordDialog.cancel</T>
          </Button>
          <Button
             onClick={handleConfirmPasswordChange}
             variant="contained"
             disabled={passwordChangeLoading}
             sx={{ minWidth: 100 }} // Give space for spinner
          >
            {passwordChangeLoading ? <CircularProgress size={24} color="inherit" /> : <T>settings.passwordDialog.change</T>}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Confirm Dialog */}
      <Dialog
        open={confirmImportDialogOpen}
        onClose={handleCloseImportConfirmDialog}
        aria-labelledby="confirm-import-dialog-title"
        aria-describedby="confirm-import-dialog-description"
      >
        <DialogTitle id="confirm-import-dialog-title" sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <DangerousIcon sx={{ mr: 1 }} /> {t('settings.importConfirmTitle') || "Confirm Data Import"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-import-dialog-description">
            <Typography fontWeight="bold" paragraph>
              {t('settings.importConfirmWarning') || "Warning: Importing data will overwrite existing data."}
            </Typography>
            <Typography paragraph>
              {t('settings.importConfirmConsequence') || "This action cannot be undone. All current data will be replaced with the data from the imported file."}
            </Typography>
            <Typography>
              {t('settings.importConfirmProceed') || "Do you want to proceed?"}
            </Typography>
          </DialogContentText>
          {selectedImportFile && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              {t('settings.importFile', { file: selectedImportFile.name }) || `File: ${selectedImportFile.name}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportConfirmDialog} variant="outlined">
            {t('settings.cancelImport') || "Cancel"}
          </Button>
          <Button onClick={handleConfirmImport} color="error" variant="contained" autoFocus>
            {t('settings.confirmImport') || "Import"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
