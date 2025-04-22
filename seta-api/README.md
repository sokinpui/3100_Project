# SETA API Backend

This directory contains the Python backend for the SETA application, built using the FastAPI framework.

## Overview

The API provides endpoints for user authentication, managing financial data (expenses, income, budgets, goals, accounts), data import/export, reporting, and configuration.

## Key Technologies

*   **FastAPI:** High-performance web framework for building APIs.
*   **SQLAlchemy:** ORM for database interaction.
*   **Pydantic:** Data validation and settings management.
*   **Alembic:** Database schema migrations.
*   **python-dotenv:** Environment variable management.
*   **uvicorn:** ASGI server for running FastAPI.
*   **fastapi-mail:** Sending emails (verification, password reset).
*   **PyInstaller:** Used for packaging the backend into a native executable (see Build Guide).

## Setup and Local Development

1.  **Prerequisites:** Python 3.9+ and `pip`.
2.  **Navigate:** `cd seta-api`
3.  **Create Virtual Environment:**
    ```bash
    python -m venv venv
    ```
4.  **Activate Environment:**
    *   Windows (Git Bash/PowerShell): `source venv/Scripts/activate`
    *   Windows (Command Prompt): `venv\Scripts\activate.bat`
    *   macOS / Linux: `source venv/bin/activate`
5.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
6.  **Configuration:**
    *   The API uses `app/config_manager.py` to handle configuration. See the main [Configuration Guide](../doc/configuration.md) for details.
    *   By default, it uses a local SQLite database (`seta-api/seta_user_data/seta_local.db`). The `seta_user_data` directory will be created automatically if it doesn't exist *relative to where the script/executable runs*.
    *   **IMPORTANT FOR PACKAGED APP:** When packaged (e.g., with PyInstaller), the backend needs to know where to store user data. The Electron frontend *must* set the `SETA_USER_DATA_PATH` environment variable when launching the packaged backend process. This ensures the config file (`seta_config.json`) and local database (`seta_local.db`) are stored in a user-writable location (like the Electron app's user data directory), not inside the read-only application package.
    *   You can configure the database connection via the `seta_config.json` file or the `/settings/database` API endpoint (requires app restart).
7.  **Database Migrations:**
    *   If using a database schema that requires migrations (like PostgreSQL, or evolving SQLite), apply them using Alembic:
        ```bash
        alembic upgrade head
        ```
    *   The initial schema for the local SQLite database is created automatically on first run if the DB file doesn't exist (see `app/main.py`).
8.  **Run Development Server:**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    *   The API will be available at `http://localhost:8000`.
    *   Interactive API documentation (Swagger UI): `http://localhost:8000/docs`
    *   Alternative API documentation (ReDoc): `http://localhost:8000/redoc`
9.  **Deactivate Environment:** `deactivate`

## Packaging (Native Build)

Refer to the main [Build and Release Guide](../doc/build_and_release.md) for instructions on packaging the API using PyInstaller for different operating systems. The `seta_api_server.spec` file is configured for this purpose.

## API Endpoints

See the [Backend API Reference](../doc/api_reference.md) for a summary of available endpoints. For full details and interactive testing, use the Swagger UI (`/docs`) when the server is running.
