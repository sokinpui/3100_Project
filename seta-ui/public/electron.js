// seta-ui/public/electron.js

const { app, BrowserWindow, dialog, protocol } = require("electron"); // Added protocol
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const urlNode = require("url"); // Node.js URL module, for parsing and formatting

let backendProcess = null;
let mainWindow;

// --- Custom Protocol Definition ---
const APP_PROTOCOL = "setaapp"; // Make sure this matches the one in app/main.py
let deeplinkUrlOnStartup = null; // To store URL if app launched via protocol on Win/Linux

// --- Function to get the path to the backend executable ---
function getBackendPath() {
  const platform = process.platform;
  let executableName;

  if (platform === "win32") {
    executableName = "seta_api_server.exe";
  } else if (platform === "darwin" || platform === "linux") {
    executableName = "seta_api_server";
  } else {
    console.error("Unsupported platform:", platform);
    return null;
  }

  if (!app.isPackaged) {
    // DEVELOPMENT PATH
    const devPath = path.join(
      __dirname,
      "..",
      "..",
      "seta-api",
      "dist",
      "seta_api_server",
      executableName,
    );
    console.log(
      `[Dev Mode (!app.isPackaged)] Calculated backend path: ${devPath}`,
    );
    return devPath;
  } else {
    // PRODUCTION PATH
    // The backend executable should be in a 'backend' subdirectory relative to resourcesPath
    const prodPath = path.join(
      process.resourcesPath,
      "backend",
      executableName,
    );
    console.log(
      `[Prod Mode (app.isPackaged)] Calculated backend path: ${prodPath}`,
    );
    return prodPath;
  }
}

// --- Function to Start Python Backend ---
function startBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    if (!backendPath) {
      return reject(
        new Error(
          "Backend executable path could not be determined for this platform/mode.",
        ),
      );
    }

    if (!fs.existsSync(backendPath)) {
      console.error(
        `Backend executable not found at expected path: ${backendPath}`,
      );
      return reject(
        new Error(`Backend executable not found at: ${backendPath}`),
      );
    }

    const userDataPath = app.getPath("userData");
    console.log(`User Data Path: ${userDataPath}`);
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    console.log(`Attempting to start backend executable: ${backendPath}`);

    try {
      const env = {
        ...process.env,
        SETA_USER_DATA_PATH: userDataPath,
        // --- NEW: Pass APP_PROTOCOL to backend if it needs it for constructing links ---
        // (Though for redirects, backend usually knows its own protocol)
        // SETA_APP_PROTOCOL: APP_PROTOCOL,
      };
      backendProcess = spawn(backendPath, [], { stdio: "pipe", env: env });

      let outputBuffer = "";
      const startupTimeout = setTimeout(() => {
        console.error("Backend startup timed out.");
        if (backendProcess) backendProcess.kill();
        reject(new Error("Backend startup timeout. Output:\n" + outputBuffer));
      }, 30000); // 30 seconds timeout

      backendProcess.stdout.on("data", (data) => {
        const stdoutOutput = data.toString();
        outputBuffer += stdoutOutput;
        console.log(`Backend STDOUT: ${stdoutOutput.trim()}`);
        // More robust check: wait for FastAPI's "Application startup complete"
        if (stdoutOutput.includes("Application startup complete")) {
          console.log(
            'Backend started successfully (detected via stdout "Application startup complete").',
          );
          clearTimeout(startupTimeout);
          resolve();
        }
      });

      backendProcess.stderr.on("data", (data) => {
        const stderrOutput = data.toString();
        outputBuffer += stderrOutput;
        console.error(`Backend STDERR: ${stderrOutput.trim()}`);
        // Some apps log startup messages to stderr
        if (stderrOutput.includes("Application startup complete")) {
          console.log(
            'Backend started successfully (detected via stderr "Application startup complete").',
          );
          clearTimeout(startupTimeout);
          resolve();
        }
      });

      backendProcess.on("close", (code) => {
        console.log(`Backend process exited with code ${code}`);
        backendProcess = null;
        if (!app.isQuitting) {
          // Check if quitting intentionally
          console.error("Backend process closed unexpectedly.");
          // Optionally, attempt to restart or notify the user
        }
      });

      backendProcess.on("error", (err) => {
        console.error("Failed to start backend process:", err);
        clearTimeout(startupTimeout);
        reject(err);
      });
    } catch (error) {
      console.error("Error spawning backend process:", error);
      reject(error);
    }
  });
}

// --- Function to Handle Deeplink URLs ---
function handleDeeplink(url) {
  console.log("Electron received deeplink URL:", url);
  if (!url || !url.startsWith(`${APP_PROTOCOL}://`)) {
    console.warn("Ignoring non-app protocol URL or empty URL:", url);
    return;
  }

  const parsedUrl = new URL(url);
  const internalRoutePath = parsedUrl.hostname; // e.g., "verify-result"
  const queryParams = parsedUrl.search; // e.g., "?status=success&code=invalid_token"

  const targetPath = `#/${internalRoutePath}${queryParams}`; // Path for HashRouter

  if (mainWindow && mainWindow.webContents) {
    // If window exists, navigate it
    const currentURL = mainWindow.webContents.getURL();
    console.log("Current main window URL:", currentURL);

    // Construct the full URL to load for the renderer
    // In development, this might be localhost:3000/#/verify-result...
    // In production, this will be file:///.../index.html#/verify-result...
    const startUrl = !app.isPackaged
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "index.html")}`;

    const navigationUrl = `${startUrl}${targetPath}`;

    console.log("Navigating main window to:", navigationUrl);
    mainWindow.loadURL(navigationUrl);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else {
    // If window isn't created yet, store it to be opened by createWindow
    console.log("Main window not ready, storing deeplink for startup:", url);
    // Store the target path, not the full custom protocol URL
    deeplinkUrlOnStartup = targetPath;
  }
}

// --- Function to Create the Electron Window ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Consider security implications if changing
      // preload: path.join(__dirname, 'preload.js') // Uncomment if you use a preload script
    },
    show: false,
  });

  const baseUrl = !app.isPackaged
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "index.html")}`; // Correct path for packaged app

  let startUrlToLoad = baseUrl;

  if (deeplinkUrlOnStartup) {
    console.log(`Applying deeplink on startup: ${deeplinkUrlOnStartup}`);
    startUrlToLoad = `${baseUrl}${deeplinkUrlOnStartup}`;
    deeplinkUrlOnStartup = null; // Consume it
  }

  console.log(`Loading URL: ${startUrlToLoad}`);
  mainWindow.loadURL(startUrlToLoad);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --- Protocol Registration and Single Instance Lock ---
// This must be called before app is ready for Windows and Linux
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(APP_PROTOCOL);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Handle deeplink if passed via command line to second instance
    const urlFromCmd = commandLine.find((arg) =>
      arg.startsWith(`${APP_PROTOCOL}://`),
    );
    if (urlFromCmd) {
      handleDeeplink(urlFromCmd);
    }
  });

  // Store the initial deep link if the app is opened via one on Windows/Linux (before 'ready')
  if (process.platform !== "darwin" && process.argv.length > 1) {
    const initialLink = process.argv.find((arg) =>
      arg.startsWith(`${APP_PROTOCOL}://`),
    );
    if (initialLink) {
      const parsed = new URL(initialLink);
      deeplinkUrlOnStartup = `#/${parsed.hostname}${parsed.search}`;
      console.log(
        `Deeplink found at app launch (Win/Linux): ${deeplinkUrlOnStartup}`,
      );
    }
  }

  // --- Electron App Lifecycle ---
  app.on("ready", async () => {
    console.log("Electron app ready.");

    // For macOS, 'open-url' is the primary way to handle protocol links.
    app.on("open-url", (event, url) => {
      event.preventDefault(); // Important for macOS
      handleDeeplink(url);
    });

    try {
      await startBackend();
      console.log("Backend start confirmed, creating window...");
      createWindow(); // createWindow will now handle deeplinkUrlOnStartup

      // --- Check for Updates After Window is Ready ---
      // No changes needed here for protocol handling
      if (mainWindow && mainWindow.webContents) {
        // Ensure mainWindow exists
        mainWindow.webContents.once("did-finish-load", () => {
          if (!app.isPackaged) {
            return;
          }
          // Your auto-updater logic (if any)
        });
      }
    } catch (error) {
      console.error(
        "FATAL: Failed to start backend. Application cannot continue.",
        error,
      );
      dialog.showErrorBox(
        "Backend Error",
        `Failed to start the backend server: ${error.message}\nThe application will now close.`,
      );
      app.quit();
    }
  });
} // End of else block for gotTheLock

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // For macOS
  if (BrowserWindow.getAllWindows().length === 0) {
    if (backendProcess) {
      createWindow();
    } else {
      console.warn(
        "Cannot reactivate: Backend process not running. Attempting restart...",
      );
      startBackend()
        .then(createWindow)
        .catch((error) => {
          console.error("FATAL: Failed to restart backend on activate.", error);
          dialog.showErrorBox(
            "Backend Error",
            `Failed to restart the backend server on activate: ${error.message}\nThe application will now close.`,
          );
          app.quit();
        });
    }
  }
});

app.on("will-quit", () => {
  app.isQuitting = true; // Set a flag
  if (backendProcess) {
    console.log("Terminating backend process...");
    backendProcess.kill(); // Send SIGTERM
    backendProcess = null;
  }
});
