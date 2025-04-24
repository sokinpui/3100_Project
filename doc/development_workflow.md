# doc/development_workflow.md

# Development and Release Workflow

## Overview

This document outlines the Git branching strategy and workflow used for developing and releasing the SETA application. Following this process ensures code stability, enables automated builds, and maintains a clear project history.

## Branching Strategy

We use a branching model based on Gitflow principles, adapted for our automated release process:

*   **`main`:**
    *   Represents the primary development line containing stable, reviewed code ready for the *next* release.
    *   **DO NOT** commit directly to `main`. Use Pull Requests.
    *   Feature branches are created *from* `main`.
    *   Completed features/fixes are merged *into* `main`.
*   **`release`:**
    *   Dedicated branch for preparing and tagging official releases.
    *   Receives code merged *from* `main` when preparing a release.
    *   Version bumps (`seta-ui/package.json`) happen *only* on this branch, just before tagging.
    *   Tags (`v*.*.*`) triggering automated builds are created *exclusively* on this branch's commits.
*   **`feature/*`, `fix/*`, `chore/*`, etc.:**
    *   Temporary branches for specific tasks (new features, bug fixes, refactoring).
    *   Created *from* `main`.
    *   Merged *back into* `main` via Pull Requests upon completion.

## Standard Development Cycle

1.  **Sync `main`:** Before starting work, ensure your local `main` is up-to-date:
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Create Feature Branch:** Branch off `main` for your task:
    ```bash
    git checkout -b feature/your-feature-name # Or fix/your-bug-name, etc.
    ```
3.  **Develop:** Write your code, commit changes frequently with clear messages.
    ```bash
    # ... make changes ...
    git add .
    git commit -m "feat: Implement user profile editing" # Example commit message
    ```
4.  **Push Branch:** Push your feature branch to the remote repository:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Create Pull Request (PR):** Go to the GitHub repository and create a Pull Request to merge your `feature/your-feature-name` branch into the `main` branch. Assign reviewers.
6.  **Code Review & Merge:** Address any feedback during the code review. Once approved, the PR is merged into `main` (usually via the GitHub UI "Squash and merge" or "Merge pull request").
7.  **Clean Up (Optional):** Delete your local and remote feature branch after merging.
    ```bash
    git checkout main
    git branch -d feature/your-feature-name
    git push origin --delete feature/your-feature-name
    ```

## Release Cycle (Performed by Maintainer/Release Manager)

1.  **Select Release Commit:** Ensure `main` contains all the code intended for the new release and is stable.
2.  **Prepare `release` Branch:**
    ```bash
    git checkout release
    git pull origin release # Ensure release branch is up-to-date
    git merge main          # Merge latest stable code from main into release
    # Resolve any merge conflicts locally if they occur
    git push origin release # Push the merged release branch (optional pre-tag push)
    ```
3.  **Update Version:** Edit `seta-ui/package.json` on the `release` branch and increment the `version` field according to Semantic Versioning (e.g., `1.1.0`).
4.  **(Optional)** Update `CHANGELOG.md` or other release notes on the `release` branch.
5.  **Commit Release Changes:** *On the `release` branch*:
    ```bash
    git add seta-ui/package.json # Add CHANGELOG.md if changed
    git commit -m "Prepare release vX.Y.Z" # Use the new version number
    ```
6.  **Tag Release:** Create an annotated tag on the commit you just made *on the `release` branch*:
    ```bash
    git tag -a vX.Y.Z -m "Release version X.Y.Z" # Use the exact version number
    ```
7.  **Push to Trigger Build:** Push the `release` branch commit *and* the new tag:
    ```bash
    git push origin release
    git push origin vX.Y.Z
    ```
    *   Pushing the tag `vX.Y.Z` automatically triggers the GitHub Actions workflow (`.github/workflows/release.yml`) which builds the application for all platforms and creates a GitHub Release with the artifacts.
8.  **Monitor Build:** Check the "Actions" tab on GitHub to ensure the release workflow completes successfully.
9.  **Sync Back to `main`:** After successful release and verification:
    ```bash
    git checkout main
    git pull origin main    # Just in case main changed while releasing
    git merge release       # Merge the release branch changes (version bump, notes) back
    # Resolve conflicts if any (should be unlikely for just version bumps)
    git push origin main    # Push the updated main
    ```

## Hotfix Cycle (Urgent Production Fixes)

If a critical bug is found in a released version (e.g., `v1.0.0`) that needs immediate fixing *without* including new features from `main`:

1.  **Create Hotfix Branch:** Branch *from the specific tag* representing the released version:
    ```bash
    git checkout -b hotfix/fix-critical-bug v1.0.0
    ```
2.  **Apply Fix:** Make the necessary code changes and commit them to the `hotfix/*` branch.
3.  **Prepare Hotfix Release:**
    *   Update the version in `seta-ui/package.json` to a patch version (e.g., `1.0.1`) on the `hotfix/*` branch.
    *   Commit the version bump: `git add .; git commit -m "Prepare hotfix release v1.0.1"`
4.  **Tag and Push Hotfix:**
    *   Tag the hotfix commit: `git tag -a v1.0.1 -m "Hotfix release v1.0.1"`
    *   **Merge Hotfix into `release`:**
        ```bash
        git checkout release
        git pull origin release
        git merge hotfix/fix-critical-bug # Merge the completed hotfix branch
        git push origin release
        ```
    *   **Push the Hotfix Tag:**
        ```bash
        git push origin v1.0.1 # Triggers build for the hotfix
        ```
5.  **Merge Hotfix to `main`:** **CRITICAL:** Ensure the hotfix is also applied to the main development line:
    ```bash
    git checkout main
    git pull origin main
    git merge hotfix/fix-critical-bug # Merge the completed hotfix branch
    # Resolve conflicts if needed
    git push origin main
    ```
6.  **Clean Up:** Delete the hotfix branch locally and remotely.

By following this workflow, we maintain separate concerns for ongoing development (`main`) and release preparation (`release`), enabling a smooth, automated release process.

