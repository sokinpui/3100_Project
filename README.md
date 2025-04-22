# SETA - Smart Expense Tracker Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Optional license badge -->

SETA is a desktop application designed to help users manage their personal finances effectively. It features a Python backend powered by FastAPI and a user-friendly frontend built with React, Material UI, and packaged with Electron.

## Features (Combined Perspective)

*   Secure User Authentication (Signup, Login, Email Verification, Password Reset)
*   CRUD Operations for Expenses, Income, Recurring Items, Budgets, Goals, Accounts.
*   Dynamic, Customizable Dashboard with various visualization widgets.
*   Data Import/Export (CSV for transactions, JSON for full backup/restore).
*   Reporting (Excel, PDF, CSV).
*   Configurable Backend (Local/Cloud Database).
*   User Profile & Application Settings (Theme, Language).
*   Cross-Platform Desktop Application (Windows, macOS, Linux).

## Project Structure

*   `seta-api/`: Contains the FastAPI backend application. See [seta-api/README.md](./seta-api/README.md).
*   `seta-ui/`: Contains the React/Electron frontend application. See [seta-ui/README.md](./seta-ui/README.md).
*   `doc/`: Contains detailed documentation:
    *   **[User Manual](./doc/user_manual.md)** <--- ADDED LINK
    *   [Build and Release Guide](./doc/build_and_release.md)
    *   [Development Workflow](./doc/development_workflow.md)
    *   [Backend API Reference](./doc/api_reference.md)
    *   [Configuration Guide](./doc/configuration.md)
    *   [Frontend Module Documentation](./doc/frontend_modules.md) <!-- Optional: Add if you create this -->
    *   [Dashboard Widget Documentation](./doc/dashboard_widgets.md) <!-- Optional: Add if you create this -->
*   `script/`: Utility scripts (e.g., test data generation).

## Getting Started

1.  **Installation:** For most users, download the latest version from the **[GitHub Releases Page](https://github.com/YourUsername/YourRepoName/releases)**. For detailed installation instructions, including the macOS workaround for unsigned apps, please see the **[User Manual](./doc/user_manual.md)**.
2.  **Developers:** See the [Build and Release Guide](./doc/build_and_release.md) for building from source or the README files in `seta-api/` and `seta-ui/` for running in development mode.
3.  **Usage:** Launch the application and refer to the **[User Manual](./doc/user_manual.md)** for guidance on using SETA's features.

## Development

*   Run the backend development server (`uvicorn app.main:app --reload ...` in `seta-api/`).
*   Run the frontend development server (`npm start` in `seta-ui/`).
*   See the [Development Workflow](./doc/development_workflow.md) guide.

## Contributing

Please read the [Development Workflow](./doc/development_workflow.md) guide for details on our branching strategy and contribution process. Bug reports and feature requests are welcome on the [GitHub Issues Page](https://github.com/YourUsername/YourRepoName/issues).

## License

This project is licensed under the MIT License - see the LICENSE file for details (if you add one).
