# Build and Release Guide

## Overview

This guide provides instructions for developers to set up the project, build the SETA application natively on their platform (macOS, Windows, or Linux), and outlines the automated release process using GitHub Actions.

The core principle is **native building**: the Python backend (`seta-api`) *must* be packaged using PyInstaller on the target operating system, and the Electron app (`seta-ui`) should ideally be packaged on the target OS as well for maximum compatibility and proper inclusion of the native backend.

GitHub Actions are configured to automate this cross-platform build and release process whenever a version tag (e.g., `v1.2.3`) is pushed to the repository.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Git:** For cloning the repository and managing versions. ([Download Git](https://git-scm.com/downloads))
2.  **Node.js and npm:** For the frontend (`seta-ui`). Use the latest LTS version. ([Download Node.js](https://nodejs.org/))
3.  **Python:** For the backend (`seta-api`). Version 3.9+ recommended. Ensure Python and `pip` are added to your system's PATH. ([Download Python](https://www.python.org/downloads/))
4.  **OS-Specific Build Tools:**
    *   **Windows:**
        *   Python added to PATH during installation.
        *   Consider installing [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (select "Desktop development with C++" workload) if you encounter issues with native Node.js modules during `npm install` (less common for standard React apps but good to have).
    *   **macOS:**
        *   Xcode Command Line Tools: Run `xcode-select --install` in your terminal.
    *   **Linux (Debian/Ubuntu Example):**
        *   `sudo apt update && sudo apt install build-essential python3-dev python3-venv libssl-dev libffi-dev`
        *   Other distributions might require different package names (e.g., `dnf groupinstall "Development Tools"` on Fedora).

## Project Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/YourUsername/YourRepoName.git # Replace with your repo URL
    cd YourRepoName
    ```

2.  **Set Up Backend (`seta-api`):**
    ```bash
    cd seta-api

    # Create a Python virtual environment
    python -m venv venv

    # Activate the virtual environment
    # Windows (Git Bash/PowerShell):
    # source venv/Scripts/activate
    # Windows (Command Prompt):
    # venv\Scripts\activate.bat
    # macOS / Linux:
    source venv/bin/activate

    # Install Python dependencies
    pip install -r requirements.txt

    # Apply database migrations (if applicable, e.g., for PostgreSQL)
    # alembic upgrade head

    # Deactivate environment for now (optional)
    # deactivate
    cd ..
    ```

3.  **Set Up Frontend (`seta-ui`):**
    ```bash
    cd seta-ui

    # Install Node.js dependencies
    npm install

    cd ..
    ```

## Local Build (for Testing)

Before relying on automation, it's useful to know how to build the application locally for your current platform.

1.  **Build Backend (Native):**
    *   Navigate to the backend directory: `cd seta-api`
    *   Activate the virtual environment (see activation commands above).
    *   Run PyInstaller (uses `seta_api_server.spec` by default if present, or run command explicitly):
        ```bash
        # Option 1: Using the spec file (Recommended)
        pyinstaller seta_api_server.spec

        # Option 2: Explicit command (ensure it matches the spec)
        # pyinstaller --name seta_api_server \
        #             --onedir \
        #             --noconsole \
        #             --add-data "app:app" \
        #             --add-data "alembic:alembic" \
        #             --add-data "alembic.ini:." \
        #             app/main.py
        ```
        *   The `--add-data` flags ensure necessary files/folders (like the `app` module, `alembic` scripts, and config) are included in the package. Adjust if your structure differs.
    *   The native backend executable/folder will be in `seta-api/dist/seta_api_server/`.
    *   Deactivate the virtual environment: `deactivate`
    *   Navigate back to the root: `cd ..`

2.  **Build & Package Electron App (Native):**
    *   Navigate to the frontend directory: `cd seta-ui`
    *   Run the Electron build command for your platform:
        *   **macOS:** `npm run electron:build -- --mac` (Note the extra `--` if passing args)
        *   **Windows:** `npm run electron:build -- --win`
        *   **Linux:** `npm run electron:build -- --linux`
        *   *(Alternatively, `npm run electron:build` might auto-detect your OS based on `package.json` config)*
    *   This command typically first runs `npm run build` (React build) and then uses `electron-builder`.
    *   **Crucially:** `electron-builder` must be configured (usually in `package.json` or `electron-builder.yml`) to copy the *correct* native backend from `../seta-api/dist/seta_api_server/` into the packaged app's resources directory (e.g., under `extraResources`).
    *   The final packaged application (e.g., `.dmg`, `.exe`, `.AppImage`) will be in `seta-ui/release/`.
    *   Navigate back to the root: `cd ..`

## Automated Release with GitHub Actions

A GitHub Actions workflow is configured in `.github/workflows/release.yml` to automate the native build process for macOS, Windows, and Linux, and then create a GitHub Release with the built artifacts attached.

**Trigger:** This workflow runs automatically whenever a Git tag matching the pattern `v*.*.*` (e.g., `v1.0.0`, `v0.2.1`) is pushed to the repository (typically pushed on the `release` branch as per the [Development Workflow](./development_workflow.md)).

**Process:**

1.  The workflow starts three parallel jobs, one for each OS (`macos-latest`, `windows-latest`, `ubuntu-latest`).
2.  Each job checks out the code corresponding to the pushed tag.
3.  Each job sets up Node.js and Python.
4.  Each job installs backend dependencies (`pip install`) and frontend dependencies (`npm install`).
5.  Each job builds the **backend natively** using PyInstaller *on that specific OS runner*.
6.  Each job builds and packages the **Electron app natively** using `electron-builder` *on that specific OS runner*, ensuring the correct native backend (built in the previous step) is included.
7.  Each job uploads its packaged application files (e.g., `.dmg`, `.exe`, `.AppImage`, `.yml` update files) as build artifacts.
8.  A final job runs *after* all builds succeed. It downloads all the build artifacts.
9.  It then creates (or updates) a GitHub Release associated with the triggering tag.
10. It uploads all the downloaded artifacts (the packaged apps for all platforms) to that GitHub Release.

**(Ensure `.github/workflows/release.yml` exists and reflects this process)**

```yaml
# Example structure for .github/workflows/release.yml
# (Verify this matches your actual file)

name: Build and Release SETA

on:
  push:
    tags:
      - 'v*.*.*' # Trigger on version tags like v1.0.0

jobs:
  # --- Build Jobs (Run in Parallel) ---
  build-macos:
    name: Build macOS
    runs-on: macos-latest
    steps:
      # ... steps to checkout code ...
      # ... setup python, node ...
      # ... install backend deps (pip install) ...
      # ... build backend (pyinstaller) ...
      # ... install frontend deps (npm install in seta-ui) ...
      # ... build electron app (npm run electron:build -- --mac in seta-ui) ...
      # ... upload artifact (e.g., ./seta-ui/release/*.dmg) ...

  build-windows:
    name: Build Windows
    runs-on: windows-latest
    steps:
      # ... steps to checkout code ...
      # ... setup python, node ...
      # ... install backend deps (pip install) ...
      # ... build backend (pyinstaller) ...
      # ... install frontend deps (npm install in seta-ui) ...
      # ... build electron app (npm run electron:build -- --win in seta-ui) ...
      # ... upload artifact (e.g., ./seta-ui/release/*.exe, *.yml) ...

  build-linux:
    name: Build Linux
    runs-on: ubuntu-latest
    steps:
      # ... steps to checkout code ...
      # ... setup python, node ...
      # ... install backend deps (pip install) ...
      # ... build backend (pyinstaller) ...
      # ... install frontend deps (npm install in seta-ui) ...
      # ... build electron app (npm run electron:build -- --linux in seta-ui) ...
      # ... upload artifact (e.g., ./seta-ui/release/*.AppImage, *.yml) ...

  # --- Create Release Job (Runs after builds) ---
  create-release:
    name: Create GitHub Release
    needs: [build-macos, build-windows, build-linux] # Depends on build jobs
    runs-on: ubuntu-latest
    permissions:
      contents: write # Needed to create releases and upload assets
    steps:
      # ... steps to download all artifacts from build jobs ...
      - name: Create Release and Upload Assets
        uses: ncipollo/release-action@v1
        with:
          artifacts: "path/to/downloaded/artifacts/*" # Adjust path as needed
          tag: ${{ github.ref_name }}
          generateReleaseNotes: true # Optional: auto-generate notes
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Release Process (Using GitHub Actions)

To create a new release using the automated workflow:

1.  **Ensure Code Readiness:** Make sure the code on your `main` branch is stable and contains all features/fixes for the release.
2.  **Prepare Release Branch:** Follow the steps in the [Development Workflow](./development_workflow.md) to merge `main` into `release`.
3.  **Update Version:** Increment the `version` number in `seta-ui/package.json` *on the `release` branch*.
4.  **Commit Version Bump:** *On the `release` branch*:
    ```bash
    git add seta-ui/package.json
    git commit -m "Prepare release vX.Y.Z" # Use the actual new version
    # Push the release branch commit
    git push origin release
    ```
5.  **Create and Push Tag:** Create a Git tag *on the release commit* matching the version number.
    ```bash
    git tag vX.Y.Z # Use the same version number
    git push origin vX.Y.Z # Push the tag to GitHub
    ```
6.  **Monitor Action:** Go to the "Actions" tab in your GitHub repository. You should see the "Build and Release SETA" workflow running, triggered by the tag push. Monitor its progress.
7.  **Verify Release:** Once the workflow completes successfully, go to the "Releases" section of your repository. You should find a new release corresponding to your tag, with the `.dmg`, `.exe`, `.AppImage`, and `.yml` files attached.
8.  **Sync Back:** Merge the `release` branch (with the version bump) back into `main` as described in the [Development Workflow](./development_workflow.md).

## Manual Release (Fallback)

If the GitHub Actions workflow fails or is not configured, you can perform a manual release:

1.  Perform the "Local Build" steps on macOS, Windows, and Linux machines/VMs separately.
2.  Gather the built application files (`.dmg`, `.exe`, `.AppImage`) and the corresponding `.yml` update files from the `seta-ui/release/` directory on each platform.
3.  Ensure your code is committed and pushed, and the `release` branch reflects the final state.
4.  Create and push the Git tag manually (`git checkout release`, `git tag vX.Y.Z`, `git push origin vX.Y.Z`).
5.  Go to your GitHub repository -> Releases -> "Draft a new release".
6.  Select the tag you pushed.
7.  Write release notes.
8.  Manually upload all the gathered application files and `.yml` files as release assets.
9.  Publish the release.

## Important Notes

*   **Packaged Backend Data Path:** As mentioned in the [Backend README](../seta-api/README.md), the packaged Python backend relies on the `SETA_USER_DATA_PATH` environment variable being set by the Electron frontend at runtime. This ensures the config and local DB are stored correctly. Verify your Electron code (`electron.js`) sets this when spawning the backend process.
*   **Code Signing:** For the automated release (and professional distribution), **code signing is crucial**, especially for macOS and Windows. Unsigned apps will face significant warnings or blocks during installation and auto-update. You will need to:
    *   Obtain Apple Developer ID and Windows Code Signing certificates.
    *   Configure **Secrets** in your GitHub repository settings (e.g., `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_ID_PASSWORD`, etc. - refer to `electron-builder` docs).
    *   Modify the GitHub Actions workflow (`release.yml`) and `electron-builder` configuration to use these secrets during the build step.
*   **Backend System Dependencies:** If `seta-api` relies on system libraries beyond standard Python packages (e.g., specific database drivers needing system installation like `libpq-dev`), you may need to add steps to the GitHub Actions workflow (`release.yml`) to install those dependencies on the runners (e.g., using `apt-get install` on Linux, `brew install` on macOS).
*   **Testing:** Always test your local builds thoroughly before tagging and pushing to trigger a release.
*   **`GITHUB_TOKEN`:** The default token used in Actions has limitations. If you need the release workflow to trigger *other* workflows, you might need to use a Personal Access Token (PAT) stored as a repository secret.
```
