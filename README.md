# SETA - Smart Expense Tracker Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Optional license badge -->

SETA is a desktop application designed to help users manage their personal finances effectively. It features a Python backend powered by FastAPI and a user-friendly frontend built with React and packaged with Electron (details to be added).

## Features (Backend Perspective)

*   Secure User Authentication (Signup, Login, Email Verification, Password Reset)
*   CRUD Operations for:
    *   Expenses
    *   Income
    *   Recurring Expenses (Bills)
    *   Budgets
    *   Savings Goals
    *   Accounts (Bank, Cash, etc.)
*   Bulk Data Management (Deletion)
*   Data Import/Export:
    *   Import Expenses/Income from CSV
    *   Full User Data Backup/Restore via JSON
*   Reporting:
    *   Generate Expense Reports (JSON, CSV, XLSX, PDF)
    *   Comprehensive User Data Summary
*   Configurable Database Backend (Local SQLite or Cloud/Custom PostgreSQL)
*   User Profile & Settings Management

## Project Structure

*   `seta-api/`: Contains the FastAPI backend application. See [seta-api/README.md](./seta-api/README.md).
*   `seta-ui/`: Contains the React/Electron frontend application (details to be added). See `seta-ui/README.md`.
*   `doc/`: Contains detailed documentation:
    *   [Build and Release Guide](./doc/build_and_release.md)
    *   [Development Workflow](./doc/development_workflow.md)
    *   [Backend API Reference](./doc/api_reference.md)
    *   [Configuration Guide](./doc/configuration.md)
*   `script/`: Utility scripts (e.g., test data generation).

## Getting Started

1.  **Prerequisites:** Ensure you have Git, Node.js (LTS), and Python (3.9+) installed. See the [Build and Release Guide](./doc/build_and_release.md) for detailed prerequisites.
2.  **Clone:** `git clone <your-repo-url>`
3.  **Backend Setup:** Follow the instructions in [seta-api/README.md](./seta-api/README.md).
4.  **Frontend Setup:** Follow the instructions in `seta-ui/README.md` (details to be added).

## Building and Releasing

Refer to the [Build and Release Guide](./doc/build_and_release.md) for instructions on local builds and the automated GitHub Actions release process.

## Contributing

Please read the [Development Workflow](./doc/development_workflow.md) guide for details on our branching strategy and contribution process.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if you add one).
