# SETA - Smart Expense Tracker Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Optional license badge -->

SETA is a desktop application designed to help users manage their personal finances effectively. It features a Python backend powered by FastAPI and a user-friendly frontend built with React, Material UI, and packaged with Electron.

## Features

*   Secure User Authentication (Signup, Login, Email Verification, Password Reset).
*   CRUD Operations for Expenses, Income, Accounts, Recurring Items (Bills/Subscriptions), Budgets, and Goals.
*   Dynamic, Customizable Dashboard with draggable/resizable widgets for data visualization (Charts, Summaries, Lists).
*   Data Import/Export:
    *   Import Expenses and Income from CSV files.
    *   Full Application Data Backup & Restore via JSON files.
*   Reporting: Download comprehensive financial history as Excel, PDF, or individual CSV files.
*   Configurable Backend Database (Local SQLite or Cloud/Custom PostgreSQL - *Note: Cloud/Custom options are experimental*).
*   User Profile Management.
*   Application Settings: Theme (Light/Dark/System) and Language (English/Chinese) preferences.
*   Cross-Platform Desktop Application (Windows, macOS, Linux).

## Project Structure

*   `seta-api/`: Contains the FastAPI backend application. See [seta-api/README.md](./seta-api/README.md).
*   `seta-ui/`: Contains the React/Electron frontend application. See [seta-ui/README.md](./seta-ui/README.md).
*   `doc/`: Contains all project documentation (User Manual, Development Guides, API Reference, Module Details). See the **[Documentation Index](./doc/README.md)**.
*   `script/`: Utility scripts (e.g., test data generation).

## Documentation

Detailed guides are available in the `/doc` directory.

*   **Users:** Please start with the **[User Manual](./doc/user_manual.md)** for installation, setup, and how-to-use instructions for all features.
*   **Developers:** Refer to the **[Development Workflow](./doc/development_workflow.md)** for contribution guidelines and the **[Build and Release Guide](./doc/build_and_release.md)** for environment setup, local builds, and the release process.
*   **[Documentation Index](./doc/README.md):** Provides links to all documents, including backend API references, frontend module details, and widget descriptions.

## Getting Started

1.  **Installation & Usage:** Please refer to the **[User Manual](./doc/user_manual.md)** for instructions on downloading from **[GitHub Releases](https://github.com/sokinpui/3100_Project/releases)** (Recommended), installing (including the macOS unsigned app workaround), and using the application.
2.  **Development Setup:** If you want to contribute or run from source, follow the setup instructions in the README files within the `seta-api/` and `seta-ui/` directories, and consult the [Build and Release Guide](./doc/build_and_release.md).

## Development Quick Start

*   Ensure prerequisites from the Build Guide are met.
*   Run the backend development server (`uvicorn app.main:app --reload ...` inside the activated venv in `seta-api/`).
*   Run the frontend development server (`npm start` in `seta-ui/`).
*   Access in browser at `http://localhost:3000`.

## Contributing

Please read the [Development Workflow](./doc/development_workflow.md) guide for details on our branching strategy and contribution process. Bug reports and feature requests are welcome on the **[GitHub Issues Page](https://github.com/sokinpui/3100_Project/issues)**.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if you add one).
