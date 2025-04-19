// seta-ui/public/electron.js

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const { autoUpdater } = require('electron-updater');

let backendProcess = null;
let mainWindow;

// --- Function to get the path to the backend executable ---
function getBackendPath() {
    const platform = process.platform;
    let executableName;

    if (platform === 'win32') {
        executableName = 'seta_api_server.exe';
    } else if (platform === 'darwin' || platform === 'linux') {
        executableName = 'seta_api_server';
    } else {
        console.error('Unsupported platform:', platform);
        return null;
    }

    if (!app.isPackaged) {
        // DEVELOPMENT PATH
        const devPath = path.join(__dirname, '..', '..', 'seta-api', 'dist', 'seta_api_server', executableName);
        console.log(`[Dev Mode (!app.isPackaged)] Calculated backend path: ${devPath}`);
        return devPath;
    } else {
        // PRODUCTION PATH
        const prodPath = path.join(process.resourcesPath, 'app', 'backend', executableName);
        console.log(`[Prod Mode (app.isPackaged)] Calculated backend path: ${prodPath}`);
        return prodPath;
    }
}

// --- Function to Start Python Backend ---
function startBackend() {
    return new Promise((resolve, reject) => {
        const backendPath = getBackendPath();
        if (!backendPath) {
            return reject(new Error('Backend executable path could not be determined for this platform/mode.'));
        }

        if (!fs.existsSync(backendPath)) {
            console.error(`Backend executable not found at expected path: ${backendPath}`);
            return reject(new Error(`Backend executable not found at: ${backendPath}`));
        }

        // --- Get user data path ---
        const userDataPath = app.getPath('userData');
        console.log(`User Data Path: ${userDataPath}`);
        // Ensure the directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        // ---

        console.log(`Attempting to start backend executable: ${backendPath}`);

        try {
            // --- Pass user data path as environment variable ---
            const env = {
                ...process.env,
                SETA_USER_DATA_PATH: userDataPath
            };
            backendProcess = spawn(backendPath, [], { stdio: 'pipe', env: env });
            // ---

            let outputBuffer = '';
            const startupTimeout = setTimeout(() => {
                console.error('Backend startup timed out.');
                if (backendProcess) backendProcess.kill();
                reject(new Error('Backend startup timeout. Output:\n' + outputBuffer));
            }, 30000);

            backendProcess.stdout.on('data', (data) => {
                const stdoutOutput = data.toString();
                outputBuffer += stdoutOutput;
                console.log(`Backend STDOUT: ${stdoutOutput.trim()}`);
            });

            backendProcess.stderr.on('data', (data) => {
                const stderrOutput = data.toString();
                outputBuffer += stderrOutput;
                console.error(`Backend STDERR: ${stderrOutput.trim()}`);

                if (stderrOutput.includes('Application startup complete')) {
                    console.log('Backend started successfully (detected via stderr).');
                    clearTimeout(startupTimeout);
                    resolve();
                }
            });

            backendProcess.on('close', (code) => {
                console.log(`Backend process exited with code ${code}`);
                backendProcess = null;
                if (!app.isQuitting) {
                    console.error('Backend process closed unexpectedly.');
                }
            });

            backendProcess.on('error', (err) => {
                console.error('Failed to start backend process:', err);
                clearTimeout(startupTimeout);
                reject(err);
            });

        } catch (error) {
            console.error('Error spawning backend process:', error);
            reject(error);
        }
    });
}

// --- Function to Create the Electron Window ---
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
            // preload: path.join(__dirname, 'preload.js')
        },
        show: false
    });

    const startUrl = !app.isPackaged
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'index.html')}`;

    console.log(`Loading URL: ${startUrl}`);
    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (!app.isPackaged) {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
}

// --- Electron App Lifecycle ---
app.on('ready', async () => {
    console.log('Electron app ready.');

    try {
        await startBackend();
        console.log('Backend start confirmed, creating window...');
        createWindow();

        // --- Check for Updates After Window is Ready ---
        mainWindow.webContents.once('did-finish-load', () => {
            if (!app.isPackaged) {
                return;
            }
            setTimeout(checkForUpdates, 5000);
        });

    } catch (error) {
        console.error("FATAL: Failed to start backend. Application cannot continue.", error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        if (backendProcess) {
            createWindow();
        } else {
            console.warn("Cannot reactivate: Backend process not running. Attempting restart...");
            startBackend()
                .then(createWindow)
                .catch(error => {
                    console.error("FATAL: Failed to restart backend on activate.", error);
                    app.quit();
                });
        }
    }
});

app.on('will-quit', () => {
    app.isQuitting = true;
    if (backendProcess) {
        console.log('Terminating backend process...');
        backendProcess.kill();
        backendProcess = null;
    }
});
