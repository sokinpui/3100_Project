import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BackupIcon from '@mui/icons-material/Backup';
import DangerousIcon from '@mui/icons-material/Dangerous';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const API_URL = "http://localhost:8000";
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const userId = localStorage.getItem("userId") || 1;

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
    if (userId) {
        loadUserProfile(userId);
    } else {
        setError("User ID not found. Please log in again.");
        setIsLoading(false);
    }
  }, [userId]);

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

  const validateProfileForm = () => {
    const errors = {};
    if (/[`~!@#$%^&*()_.|+\-=?;:'",<>{}[]\\\/]/g.test(settings.profile.username)) errors.username = "Username should not contain special characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.profile.email)) errors.email = "Please enter a valid email address";
    if (settings.profile.contactNumber && settings.profile.contactNumber.search(/^[0-9]{8}$/) === -1) errors.contactNumber = "Contact number must be 8 digits";
    if (!settings.profile.firstName.trim()) errors.firstName = "First name is required";
    if (!settings.profile.lastName.trim()) errors.lastName = "Last name is required";
    if (!settings.profile.username.trim()) errors.username = "Username is required";
    if (!settings.profile.email.trim()) errors.email = "Email is required";
    return errors;
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

  const handleExport = async () => {
    setIsExporting(true);
    setSnackbarMessage(t('settings.exportStarting'));
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

        setSnackbarMessage(t('settings.exportSuccess'));
        setSnackbarSeverity('success');
    } catch (error) {
        console.error("Export error:", error);
        setSnackbarMessage(t('settings.exportFailed'));
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
      setImportError(t('settings.importInvalidFile'));
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
      setSnackbarMessage(t('settings.importSuccess'));
      setSnackbarSeverity('success');
    } catch (err) {
      console.error("Import API error:", err.response?.data || err.message);
      const apiError = err.response?.data?.detail || t('settings.importFailed');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={t('settings.firstName')} value={settings.profile.firstName} onChange={(e) => handleSettingChange("profile", "firstName", e.target.value)} disabled={isLoading} error={!!formErrors.firstName} helperText={formErrors.firstName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={t('settings.lastName')} value={settings.profile.lastName} onChange={(e) => handleSettingChange("profile", "lastName", e.target.value)} error={!!formErrors.lastName} helperText={formErrors.lastName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={t('settings.username')} value={settings.profile.username} onChange={(e) => handleSettingChange("profile", "username", e.target.value)} error={!!formErrors.username} helperText={formErrors.username} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={t('settings.contactNumber')} value={settings.profile.contactNumber} onChange={(e) => handleSettingChange("profile", "contactNumber", e.target.value)} error={!!formErrors.contactNumber} helperText={formErrors.contactNumber} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={t('settings.email')} type="email" value={settings.profile.email} onChange={(e) => handleSettingChange("profile", "email", e.target.value)} error={!!formErrors.email} helperText={formErrors.email} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" color="primary" sx={{ mt: 1, borderRadius: 2, textTransform: "none" }} onClick={openPasswordDialog}>
                  {t('settings.changePassword')}
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

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
              startIcon={isExporting ? <CircularProgress size={20} color="inherit"/> : <DownloadIcon />}
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
              type="file" accept=".json" ref={importFileInputRef}
              onChange={handleImportFileChange} style={{ display: 'none' }}
              id="import-json-input"
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleImportButtonClick} disabled={isImporting || isLoading}>
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
              startIcon={isImporting ? <CircularProgress size={20} color="inherit"/> : <UploadFileIcon />}
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
                    <Typography variant="caption" fontWeight="bold">Errors encountered:</Typography>
                    <ul style={{ margin: '0', paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto' }}>
                      {importResult.errors.slice(0, 5).map((err, index) => (
                        <li key={index}><Typography variant="caption">{err}</Typography></li>
                      ))}
                      {importResult.errors.length > 5 && <li><Typography variant="caption">...and more.</Typography></li>}
                    </ul>
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={isLoading}
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

      <Dialog
        open={confirmImportDialogOpen}
        onClose={handleCloseImportConfirmDialog}
        aria-labelledby="confirm-import-dialog-title"
        aria-describedby="confirm-import-dialog-description"
      >
        <DialogTitle id="confirm-import-dialog-title" sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <DangerousIcon sx={{ mr: 1 }}/> {t('settings.importConfirmTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-import-dialog-description">
            <Typography fontWeight="bold" paragraph>{t('settings.importConfirmWarning')}</Typography>
            <Typography paragraph>{t('settings.importConfirmConsequence')}</Typography>
            <Typography>{t('settings.importConfirmProceed')}</Typography>
          </DialogContentText>
          {selectedImportFile && <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>File: {selectedImportFile.name}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportConfirmDialog} variant="outlined">
            {t('settings.cancelImport')}
          </Button>
          <Button onClick={handleConfirmImport} color="error" variant="contained" autoFocus>
            {t('settings.confirmImport')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
