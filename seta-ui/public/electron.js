// Inside seta-ui/public/electron.js

const { app, BrowserWindow } = require('electron');
const path = require('path');
// const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

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

  // --- Use app.isPackaged ---
  if (!app.isPackaged) { // <--- CHANGE HERE (Checks if NOT packaged == development)
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
  // --- End Change ---
}

// --- Function to Start Python Backend (keep the rest of the function as is) ---
function startBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    if (!backendPath) {
        return reject(new Error('Backend executable path could not be determined for this platform/mode.'));
    }

    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
        console.error(`Backend executable not found at expected path: ${backendPath}`);
        return reject(new Error(`Backend executable not found at: ${backendPath}`));
    }

    console.log(`Attempting to start backend executable: ${backendPath}`);

    try {
      backendProcess = spawn(backendPath, [], { stdio: 'pipe' });

      let outputBuffer = ''; // Buffer for potential timeout error message
      const startupTimeout = setTimeout(() => {
        console.error('Backend startup timed out.');
        if (backendProcess) backendProcess.kill();
        reject(new Error('Backend startup timeout. Output:\n' + outputBuffer));
      }, 30000); // Keep 30-second timeout for now

      // --- Handle STDOUT (just log it) ---
      backendProcess.stdout.on('data', (data) => {
        const stdoutOutput = data.toString();
        outputBuffer += stdoutOutput; // Add to buffer
        console.log(`Backend STDOUT: ${stdoutOutput.trim()}`);
        // NO check for success here anymore
      });

      // --- Handle STDERR (log it AND check for success message) ---
      backendProcess.stderr.on('data', (data) => {
        const stderrOutput = data.toString();
        outputBuffer += stderrOutput; // Add to buffer
        console.error(`Backend STDERR: ${stderrOutput.trim()}`); // Log as error (as it's stderr stream)

        // <<< --- MOVE THE SUCCESS CHECK HERE --- >>>
        if (stderrOutput.includes('Application startup complete')) {
          console.log('Backend started successfully (detected via stderr).');
          clearTimeout(startupTimeout); // Clear timeout on success
          resolve(); // Resolve the promise
        }
        // <<< --- END OF MOVED CHECK --- >>>
      });

      backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        backendProcess = null;
        if (!app.isQuitting) {
            console.error('Backend process closed unexpectedly.');
            // If the promise hasn't resolved/rejected yet, reject it here
            // reject(new Error(`Backend process exited unexpectedly with code ${code}`));
        }
      });

      backendProcess.on('error', (err) => {
        console.error('Failed to start backend process:', err);
        clearTimeout(startupTimeout); // Clear timeout on error
        reject(err);
      });

    } catch (error) {
        console.error('Error spawning backend process:', error);
        reject(error);
    }
  });
}

// --- Function to Create the Electron Window (keep as is) ---
function createWindow() {
  // ... (window creation logic remains the same) ...
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  const startUrl = !app.isPackaged // <--- CHANGE HERE
      ? 'http://localhost:3000' // Dev URL
      : `file://${path.join(__dirname, '../build/index.html')}`;

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

// --- Electron App Lifecycle (keep as is) ---
app.on('ready', async () => {
  console.log('Electron app ready.');
  try {
    await startBackend();
    console.log('Backend start confirmed, creating window...');
    createWindow();
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
