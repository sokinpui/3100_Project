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

    # Apply database migrations (if applicable, assumes Alembic setup)
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
    *   Run PyInstaller:
        ```bash
        pyinstaller --name seta_api_server \
                    --onedir \
                    --noconsole \
                    --add-data "app:app" \
                    --add-data "alembic:alembic" \
                    --add-data "alembic.ini:." \
                    app/main.py
        ```
    *   The native backend executable will be in `seta-api/dist/seta_api_server/`.
    *   Deactivate the virtual environment: `deactivate`
    *   Navigate back to the root: `cd ..`

2.  **Build & Package Electron App (Native):**
    *   Navigate to the frontend directory: `cd seta-ui`
    *   Run the Electron build command for your platform:
        *   **macOS:** `npm run electron:build --mac`
        *   **Windows:** `npm run electron:build --win`
        *   **Linux:** `npm run electron:build --linux`
        *   *(Alternatively, `npm run electron:build` might auto-detect your OS)*
    *   This command first runs `npm run build` (React build) and then uses `electron-builder`. Because you built the backend natively in the previous step, `electron-builder` will copy the *correct* native backend from `../seta-api/dist/seta_api_server/` into the packaged app's resources.
    *   The final packaged application (e.g., `.dmg`, `.exe`, `.AppImage`) will be in `seta-ui/release/`.
    *   Navigate back to the root: `cd ..`

## Automated Release with GitHub Actions

A GitHub Actions workflow is configured in `.github/workflows/release.yml` to automate the native build process for macOS, Windows, and Linux, and then create a GitHub Release with the built artifacts attached.

**Trigger:** This workflow runs automatically whenever a Git tag matching the pattern `v*.*.*` (e.g., `v1.0.0`, `v0.2.1`) is pushed to the repository.

**Process:**

1.  The workflow starts three parallel jobs, one for each OS (`macos-latest`, `windows-latest`, `ubuntu-latest`).
2.  Each job checks out the code corresponding to the pushed tag.
3.  Each job sets up Node.js and Python.
4.  Each job builds the **backend natively** using PyInstaller *on that specific OS runner*.
5.  Each job builds and packages the **Electron app natively** using `electron-builder` *on that specific OS runner*, ensuring the correct native backend is included.
6.  Each job uploads its packaged application files (e.g., `.dmg`, `.exe`, `.AppImage`, `.yml` update files) as build artifacts.
7.  A final job runs *after* all builds succeed. It downloads all the build artifacts.
8.  It then creates (or updates) a GitHub Release associated with the triggering tag.
9.  It uploads all the downloaded artifacts (the packaged apps for all platforms) to that GitHub Release.

**(Optional: Add the content of `.github/workflows/release.yml` here or reference it)**

```yaml
# Example structure for .github/workflows/release.yml
# (Ensure this file exists in your repository)

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
      # ... steps to checkout, setup node/python, build backend, build electron (--mac), upload artifact ...

  build-windows:
    name: Build Windows
    runs-on: windows-latest
    steps:
      # ... steps to checkout, setup node/python, build backend, build electron (--win), upload artifact ...

  build-linux:
    name: Build Linux
    runs-on: ubuntu-latest
    steps:
      # ... steps to checkout, setup node/python, build backend, build electron (--linux), upload artifact ...

  # --- Create Release Job (Runs after builds) ---
  create-release:
    name: Create GitHub Release
    needs: [build-macos, build-windows, build-linux] # Depends on build jobs
    runs-on: ubuntu-latest
    permissions:
      contents: write # Needed to create releases and upload assets
    steps:
      # ... steps to download all artifacts ...
      - name: Create Release and Upload Assets
        uses: ncipollo/release-action@v1 # Or another release action
        with:
          artifacts: "path/to/downloaded/artifacts/*" # Adjust path as needed
          tag: ${{ github.ref_name }}
          generateReleaseNotes: true # Optional: auto-generate notes
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Release Process (Using GitHub Actions)

To create a new release using the automated workflow:

1.  **Ensure Code Readiness:** Make sure the code on your main branch (or designated release branch) is stable and contains all features/fixes for the release.
2.  **Update Version:** Increment the `version` number in `seta-ui/package.json`.
3.  **Commit Version Bump:**
    ```bash
    git add seta-ui/package.json
    git commit -m "Bump version to vX.Y.Z" # Use the actual new version
    git push origin main # Or your release branch
    ```
4.  **Create and Push Tag:** Create a Git tag matching the version number you just set.
    ```bash
    git tag vX.Y.Z # Use the same version number
    git push origin vX.Y.Z # Push the tag to GitHub
    ```
5.  **Monitor Action:** Go to the "Actions" tab in your GitHub repository. You should see the "Build and Release SETA" workflow running, triggered by the tag push. Monitor its progress.
6.  **Verify Release:** Once the workflow completes successfully, go to the "Releases" section of your repository. You should find a new release corresponding to your tag, with the `.dmg`, `.exe`, `.AppImage`, and `.yml` files attached.

## Manual Release (Fallback)

If the GitHub Actions workflow fails or is not configured, you can perform a manual release:

1.  Perform the "Local Build" steps on macOS, Windows, and Linux machines/VMs separately.
2.  Gather the built application files (`.dmg`, `.exe`, `.AppImage`) and the corresponding `.yml` update files from the `seta-ui/release/` directory on each platform.
3.  Ensure your code is committed and pushed.
4.  Create and push the Git tag manually (`git tag vX.Y.Z`, `git push origin vX.Y.Z`).
5.  Go to your GitHub repository -> Releases -> "Draft a new release".
6.  Select the tag you pushed.
7.  Write release notes.
8.  Manually upload all the gathered application files and `.yml` files as release assets.
9.  Publish the release.

## Important Notes

*   **Code Signing:** For the automated release (and professional distribution), **code signing is crucial**, especially for macOS and Windows. You will need to:
    *   Obtain Apple Developer ID and Windows Code Signing certificates.
    *   Configure **Secrets** in your GitHub repository settings (e.g., `CSC_LINK`, `CSC_KEY_PASSWORD`, `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`).
    *   Modify the GitHub Actions workflow (`release.yml`) to use these secrets during the `electron-builder` step. Refer to the `electron-builder` documentation on code signing and CI configuration. Unsigned apps will face significant warnings or blocks during installation and auto-update.
*   **Backend System Dependencies:** If `seta-api` relies on system libraries beyond standard Python packages (e.g., database drivers needing system installation), you may need to add steps to the GitHub Actions workflow (`release.yml`) to install those dependencies on the runners (e.g., using `apt-get install` on Linux).
*   **Testing:** Always test your local builds thoroughly before tagging and pushing to trigger a release.
*   **`GITHUB_TOKEN`:** The default token used in Actions has limitations. If you need the release workflow to trigger *other* workflows, you might need to use a Personal Access Token (PAT) stored as a repository secret.
