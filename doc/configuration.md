# Backend Configuration Guide

This guide explains how the SETA backend (`seta-api`) manages its configuration, particularly the database connection.

## Configuration Manager

The core logic resides in `seta-api/app/config_manager.py`. This module handles loading and saving configuration settings.

## User Data Location

The backend needs a place to store configuration and potentially the local database file. The location is determined in the following order of priority:

1.  **`SETA_USER_DATA_PATH` Environment Variable:** If this environment variable is set, the backend will use the specified path as the directory for user data.
    *   **This is the recommended method for the packaged Electron application.** The frontend (Electron) should detect the appropriate user data directory (e.g., using `app.getPath('userData')`) and pass this path to the backend process via this environment variable when launching it. This ensures data is stored in a standard, user-writable location.
2.  **Fallback Path (Development/Unpackaged):** If the environment variable is *not* set, a fallback path is used.
    *   If running from source (`python app/main.py`), it defaults to a `seta_user_data` directory *inside* the `seta-api` directory.
    *   If running as a packaged executable (via PyInstaller), it attempts to create `seta_user_data` *next to* the executable. **Warning:** This might fail due to permissions (e.g., if installed in `Program Files` on Windows). **Relying on the fallback in a packaged app is strongly discouraged.**

## Configuration File (`seta_config.json`)

Inside the determined user data directory, the backend looks for a file named `seta_config.json`.

*   **Creation:** If the file doesn't exist, it will be created with default settings upon the first run.
*   **Structure:** The file is in JSON format. The key section related to the database looks like this:

    ```json
    {
      "database": {
        "type": "local", // "local", "cloud", or "custom"
        "url": null      // Only used if type is "custom"
      }
      // ... other future settings might go here
    }
    ```

## Database Connection

The backend can connect to different types of databases based on the configuration:

1.  **`local` (Default):**
    *   Uses a local SQLite database file.
    *   The file path is constructed as `[USER_DATA_PATH]/seta_local.db`.
    *   The connection string is `sqlite:///[USER_DATA_PATH]/seta_local.db` (using POSIX path format).
    *   If the `seta_local.db` file doesn't exist when the application starts, the backend automatically creates the necessary database schema (tables) defined in `app/models.py`.

2.  **`cloud`:**
    *   Uses a predefined PostgreSQL database URL.
    *   The default URL is hardcoded in `config_manager.py` but can be overridden by setting the `DATABASE_URL` environment variable *before* starting the backend.
    *   The primary use case is connecting to a shared cloud database (like the Supabase instance mentioned in the code).

3.  **`custom`:**
    *   Uses a custom database connection URL provided by the user.
    *   The `url` field within the `"database"` section of `seta_config.json` **must** be set to a valid SQLAlchemy connection string (e.g., `postgresql://user:pass@host:port/dbname`).
    *   If `type` is `custom` but `url` is missing or null, the backend will fall back to using the `local` SQLite database.

## Changing Database Configuration

You can change the database configuration using the API:

*   **Endpoint:** `PUT /settings/database`
*   **Payload:**
    ```json
    {
      "db_type": "local" | "cloud" | "custom",
      "db_url": "your_custom_sqlalchemy_connection_string" // Required only if db_type is "custom"
    }
    ```
*   **Action:** This endpoint updates the `seta_config.json` file.
*   **IMPORTANT:** Changes made via this endpoint **require a full application restart** (both frontend and backend processes) to take effect, as the database engine is initialized only once at startup.
*   **NOTE:** While the functionality to switch databases exists, it may not have been extensively tested in all deployment scenarios (especially switching *between* local and cloud after initial setup). Proceed with caution when changing the database type on an existing installation.

## Summary

*   Use the `SETA_USER_DATA_PATH` environment variable in the packaged app.
*   The `seta_config.json` file controls the database type (`local`, `cloud`, `custom`).
*   The `local` type uses an auto-created SQLite DB (`seta_local.db`) in the user data path.
*   The `cloud` type uses a predefined URL (override with `DATABASE_URL` env var).
*   The `custom` type uses the `url` specified in `seta_config.json`.
*   Use the `/settings/database` endpoint to modify the config, but remember to restart the app. Be cautious when switching database types on existing data.


