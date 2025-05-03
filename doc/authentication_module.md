
# Frontend Module: Authentication

## Files

*   `src/login/Login.jsx`
*   `src/login/Signup.jsx`
*   `src/login/AuthGuard.jsx`
*   `src/modules/ResetPassword.jsx`
*   `src/login/Login.css`

## Overview

This module handles user authentication, including login, signup, and password reset processes. It also includes an `AuthGuard` component to manage routing based on authentication status.

## Key Components

*   **`Login.jsx`:** Displays the login form, handles user input, interacts with the `/login` API endpoint, manages loading and error states, and stores user session information (`userId`, `username`, etc.) in `localStorage` upon successful login. Includes toggles for theme and language. Handles errors related to inactive or unverified accounts.
*   **`Signup.jsx`:** Displays the registration form, performs client-side validation (password strength, matching, required fields), interacts with the `/signup` API endpoint, and provides feedback on success or failure (e.g., "Check your email for verification"). Includes toggles for theme and language.
*   **`ResetPassword.jsx`:** Component displayed when a user follows a password reset link. Takes the token from the URL, prompts for a new password, validates it, and calls the `/reset-password/{token}` API endpoint.
*   **`AuthGuard.jsx`:** A component that runs on route changes. It checks `localStorage` for authentication status (`userId`) and redirects users accordingly (e.g., non-logged-in users to `/login`, logged-in users away from `/login` or `/signup` towards the dashboard).

## Functionality

*   User Login with username and password. Backend checks if account is active and email is verified.
*   New User Registration with details and **email verification trigger** (backend sends email).
*   Password Reset using a token-based flow initiated via email (request triggered in `Settings.jsx`, reset performed in `ResetPassword.jsx`).
*   Protected Routing: Ensures only authenticated users can access protected modules.
*   Theme and Language selection directly on Login/Signup screens.

## State Management

*   Uses `useState` hooks within each component (`Login`, `Signup`, `ResetPassword`) for form data, loading indicators, error messages, success messages, and password visibility.
*   Relies on `localStorage` to persist authentication status (`userId`, `username`, `email`, `loginTime`) across sessions.
*   Uses `ThemeContext` and `LanguageContext` for managing and persisting theme/language choices.

## API Interaction

*   `POST /login`
*   `POST /signup`
*   `POST /reset-password/{token}`
*   (Password reset *request* is initiated from `Settings.jsx` via `POST /request-password-reset`)

## UI Library

*   Material UI (`Container`, `Paper`, `TextField`, `Button`, `Alert`, `IconButton`, `Avatar`, `CircularProgress`, `Menu`, `MenuItem`, `Tooltip`, `Link`).

