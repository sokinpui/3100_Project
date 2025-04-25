# SETA - User Manual

Welcome to SETA (Smart Expense Tracker Application)! This guide will help you get started with installing, setting up, and using the application to manage your personal finances.

## 1. What is SETA?

SETA is your personal desktop assistant for tracking money going in (Income) and money going out (Expenses). It helps you:

*   **See where your money goes:** Track spending by category.
*   **Understand your income:** Monitor different income sources.
*   **Manage Accounts:** Keep track of balances across checking, savings, cash, etc.
*   **Stay on top of bills:** Define recurring expenses and income.
*   **Plan your finances:** Set budgets for spending categories and track savings goals.
*   **Visualize your data:** Use a customizable dashboard with charts and summaries.
*   **Import/Export:** Bring in existing data or back up your SETA data.

The goal is to give you a clear picture of your financial situation, empowering you to make better decisions.

## 2. Getting SETA on Your Computer

You have a few options to get SETA running:

### Option A: Download from GitHub Releases (Recommended for Most Users)

This is the easiest way. We build ready-to-use versions for Windows, macOS, and Linux whenever we release a new update.

1.  Go to the **[SETA GitHub Releases Page](https://github.com/sokinpui/3100_project/releases)** (Replace with your actual repo URL!).
2.  Find the latest release (usually at the top).
3.  Look for the "Assets" section.
4.  Download the file appropriate for your operating system:
    *   **Windows:** Download the `.exe` file (e.g., `SETA-Setup-1.2.3.exe`). Double-click to install like any other Windows application.
    *   **macOS:** Download the `.dmg` file (e.g., `SETA-1.2.3.dmg`).
        *   Double-click the `.dmg` file to open it.
        *   Drag the `SETA.app` icon into your `Applications` folder.
        *   **🚨 The macOS "Unsigned App" Adventure! 🚨**
            *   Okay, real talk: As an student development team, we haven't enrolled in the Apple Developer Program ($99/year!). This means our macOS app isn't officially "signed."
            *   When you first try to open SETA, macOS might show a scary warning like "`SETA.app` can't be opened because it is from an unidentified developer." or "damaged and can’t be opened." Don't panic! This is macOS being cautious about unsigned apps.
            *   **The Workaround (At Your Own Risk!):** You can tell macOS, "Hey, I trust this app." To do this, you'll need to use the Terminal. It sounds geeky, but it's just one command:
                1.  **Open Terminal:** Press `Cmd + Space`, type `Terminal`, and press Enter.
                2.  **Enter the Command:** Enter this command if you trust our app:
                    ```bash
                    xattr -cr /Applications/SETA.app
                    ```
                3.  **Done!** Close the Terminal. Now you should be able to open SETA from your Applications folder without the warning (though you might still get a one-time "Are you sure?" prompt from macOS, which you can approve).
            *   **What did that command do?** `xattr -cr` simply removes the extended quarantine attributes that macOS adds to downloaded applications from unidentified developers. It doesn't change the app itself. This is a common workaround for unsigned apps from trusted sources. *However, only do this for applications you trust!*
    *   **Linux:** Download the `.AppImage` file (e.g., `SETA-1.2.3.AppImage`).
        *   Make the file executable: Right-click -> Properties -> Permissions -> Check "Allow executing file as program", OR run `chmod +x SETA-1.2.3.AppImage` in your terminal.
        *   Double-click the `.AppImage` file to run it.

### Option B: Build From Source (For Developers / Tech-Savvy Users)

If you're comfortable with development tools, you can build the application yourself.

1.  **Prerequisites:** Make sure you have Git, Node.js (LTS), Python (3.9+), and OS-specific build tools installed. See the [Build and Release Guide](./build_and_release.md#prerequisites) for details.
2.  **Clone:** `git clone https://github.com/sokinpui/3100_project.git`
3.  **Follow Build Steps:** Follow the "Local Build" instructions in the [Build and Release Guide](./build_and_release.md#local-build-for-testing). This involves setting up the backend, building it with PyInstaller, setting up the frontend, and packaging it with Electron.

### Option C: Run Locally in Development Mode (For Developers)

If you want to run the very latest code or contribute to development:

1.  **Prerequisites:** Git, Node.js, Python.
2.  **Clone:** `git clone https://github.com/sokinpui/3100_project.git`
3.  **Backend Setup:**
    *   `cd 3100_project/seta-api`
    *   Set up a Python virtual environment (`python -m venv venv`, activate it).
    *   Install dependencies (`pip install -r requirements.txt`).
    *   Run the backend server: `uvicorn app.main:app --reload --port 8000`
4.  **Frontend Setup:**
    *   Open a *new* terminal window.
    *   `cd 3100_project/seta-ui`
    *   Install dependencies (`npm install`).
    *   Run the frontend dev server: `npm start`
5.  Access the app in your browser (usually `http://localhost:3000`). Note: This runs the UI in a browser, not as a packaged desktop app.

## 3. First Steps: Logging In & The Interface

*   **Login/Signup:** When you first launch SETA, you'll see the Login screen. If you're new, click "Sign Up" to create an account. You'll need to verify your email address (check your inbox!) before you can log in for the first time. You should open verify link in your device that running SETA, will improve in the future.
*   **The Interface:** Once logged in, you'll see the main interface:
    *   **Sidebar (Left):** Your main navigation menu. Click items like "Expenses," "Income," "Dashboard," "Settings," etc., to access different sections.
    *   **Content Area (Right):** This is where the main content for the selected module is displayed.

## 4. Core Concepts: Managing Your Finances

SETA helps you organize your finances by tracking different types of data. Here's what they are and how to manage them:

### Expenses

*   **What:** Money you spend (e.g., groceries, rent, coffee, movie tickets).
*   **Why Track:** Understand your spending habits, see where your money goes, identify areas to save.
*   **How:**
    1.  Click **"Expenses"** in the sidebar.
    2.  Use the **"Add New Expense"** form at the top to enter the Amount, Date, Category (select from the list or type your own if you choose "Others"), and an optional Description.
    3.  Click "Add Expense."
    4.  Your added expenses appear in the **"Expense History"** table below. You can sort, search (using browser find), and delete expenses from the table.

### Income

*   **What:** Money you receive (e.g., salary, freelance payments, gifts).
*   **Why Track:** See how much money is coming in, from which sources, and track its frequency.
*   **How:**
    1.  Click **"Income"** in the sidebar.
    2.  Use the **"Add New Income"** form to enter the Amount, Date, Source (where the money came from), optional Description, and optionally link it to an Account.
    3.  Click "Add Income."
    4.  View your income history in the table.

### Accounts

*   **What:** Places where you hold your money (e.g., Checking Account, Savings Account, Wallet Cash, Credit Card).
*   **Why Track:** Get a better picture of your overall net worth, track balances, and link specific income/expenses to accounts (optional).
*   **How:**
    1.  Click **"Accounts"** in the sidebar.
    2.  Use the **"Add New Account"** form to enter the Account Name, Type, Starting Balance, and the Date that balance was correct ("Balance As Of Date").
    3.  Click "Add Account."
    4.  View your accounts in the list. You can link Income and Recurring items to accounts when adding/editing them.

### Recurring Items (Bills & Subscriptions)

*   **What:** Expenses (or income) that happen regularly (e.g., monthly rent, weekly salary, yearly subscription).
*   **Why Track:** Predict future expenses/income, avoid missed payments, see upcoming bills on the dashboard.
*   **How:**
    1.  Click **"Recurring Items"** in the sidebar.
    2.  Use the **"Add New Recurring Item"** form to enter the Name, Amount, Category, Frequency (Daily, Weekly, Monthly, etc.), Start Date, optional End Date, Description, and linked Account.
    3.  Click "Add Recurring Item."
    4.  View your defined recurring items in the list. The "Upcoming Bills" widget on the dashboard uses this data.

### Planning (Budgets & Goals)

*   **What:** Setting financial targets.
    *   **Budgets:** Limits on how much you want to spend in specific categories per period (e.g., $300/month for Food).
    *   **Goals:** Savings targets you want to achieve (e.g., $5000 for a vacation by next year).
*   **Why Track:** Helps you control spending, save effectively, and achieve your financial objectives.
*   **How:**
    1.  Click **"Planning"** in the sidebar.
    2.  Use the **"Budgets"** tab to define spending limits per category and period.
    3.  Use the **"Goals"** tab to define savings goals, including target amount, current amount saved, and optional target date.
    4.  The dashboard has widgets ("Budget Overview," "Goal Progress," "Goal Estimate") that use this data.

## 5. Using the Dynamic Dashboard

The Dashboard is your customizable financial command center. It displays various "widgets" showing charts, summaries, lists, and tools related to your financial data. For a detailed description of what each available widget does, please refer to the **[Dashboard Widget Documentation](./dashboard_module.md)**.

*   **Overview:** Mix and match widgets to create the view that makes the most sense for you.
*   **Adding/Removing Widgets:**
    *   Click the **"Manage Widgets"** button (usually found at the top right of the dashboard page).
    *   A dialog box will appear listing all available widgets (see the [Widget Documentation](./dashboard_module.md) for details on each).
    *   Check the boxes next to the widgets you want to display. Uncheck the ones you want to hide.
    *   Click "Apply Changes."
*   **Moving & Resizing:**
    *   **Move:** Click and hold the **header/title bar** of any widget. Drag it to a new position on the grid and release. Other widgets will automatically shift to accommodate.
    *   **Resize:** Move your mouse cursor to the bottom-right corner of a widget until it changes into a resize arrow (it might look like a diagonal double-arrow). Click and drag to make the widget larger or smaller.
*   **Time Period Selector:** Use the dropdown/buttons (usually near the top left) to select the time frame for the data shown in most widgets (e.g., "Last 30 Days," "Current Month," "All Time," or a Custom Range using date pickers). This is a powerful way to analyze trends over different periods.
*   **Filtering Data:** If you've added the "Data Filters" widget (highly recommended!), you can use it to narrow down the data shown in *other* widgets even further:
    *   **By Category/Source:** Select one or more specific categories (for expenses) or sources (for income) from the dropdown. Only transactions matching these will be included in calculations and charts (like the Category Breakdown pie chart or the Trend charts).
    *   **By Amount:** Use the slider to set a minimum and maximum transaction amount. This is useful for focusing on large transactions or excluding small miscellaneous ones.
    *   **Clearing Filters:** To see all data within the selected time period again, simply clear the selections in the filter widget (e.g., ensure no specific categories/sources are checked and reset the amount slider to cover the full range from $0 to the maximum shown).
## 6. Importing & Exporting Data

### Importing Expenses/Income from CSV

If you have expense or income data from another app or spreadsheet, you can import it into SETA.

1.  Click **"Import Expenses"** in the sidebar.
2.  You'll see separate sections for importing Expenses and Income.
3.  **Prepare your CSV file:** Make sure it has columns matching the required headers shown on the import page (e.g., `date`, `amount`, `category_name` for expenses; `date`, `amount`, `source` for income). The date format should be `YYYY-MM-DD`.
4.  Click **"Select CSV File"** in the relevant section and choose your file.
5.  Click **"Upload and Process."**
6.  SETA will attempt to import the data and show you a summary of how many rows were imported successfully and if any were skipped due to errors.

### Exporting Full Data Backup (JSON)

It's a good idea to back up your SETA data periodically.

1.  Click **"Settings"** in the sidebar.
2.  Scroll down to the **"Data Management"** section.
3.  Under **"Export Data,"** click the **"Export All Data"** button.
4.  Your browser (or the app) will download a `.json` file containing all your expenses, income, accounts, budgets, goals, and recurring items. Keep this file safe!

### Importing Full Data Backup (JSON) - Use With Caution!

You can restore your data from a previously exported `.json` file. This is useful if you're moving SETA to a new computer or need to recover after an issue.

1.  Click **"Settings"** in the sidebar.
2.  Scroll down to the **"Data Management"** section.
3.  Under **"Import Data,"** read the **WARNING** carefully.
    *   **🚨 VERY IMPORTANT WARNING! 🚨 Importing a JSON backup will DELETE ALL the data currently in the SETA application and replace it entirely with the data from the file you upload. This cannot be undone! Only proceed if you are absolutely sure.**
4.  Click **"Select Backup File (.json)"** and choose your previously exported `.json` file.
5.  Click **"Import Data."**
6.  A confirmation dialog will appear asking you to confirm the data replacement. Read it again!
7.  If you are certain, click **"Yes, Replace Data"** (or similar confirm button).
8.  SETA will process the file and replace your current data. You might need to reload or restart the application afterwards to see the changes everywhere.

## 7. Troubleshooting & Tips

*   **"Where's my data?" / "Data looks wrong!"**
    *   **Check the Filters!** This is the most common reason. The widgets on the dashboard only show data matching the **Time Period Selector** *and* the selections in the **Data Filters** widget (if added).
    *   **Troubleshooting Steps:**
        1.  Set the **Time Period Selector** to **"All Time."**
        2.  If you have the **"Data Filters"** widget, ensure no specific categories are selected and the amount slider covers the full range (e.g., $0 to the maximum).
        3.  Go to the specific module (e.g., "Expenses," "Income") - does your data appear in the table there? The tables usually show all data for that type, unfiltered by the dashboard selectors.
*   **Data Not Updating Immediately After Import/Add:** Sometimes, especially after large imports or adding data quickly, the dashboard widgets might not refresh instantly. Try a simple page refresh (`Ctrl+R` or `Cmd+R` if running in dev mode) or, if needed, close and reopen the SETA application.
*   **Found a Bug or Have an Idea?** Please report issues or suggest features on the **[SETA GitHub Issues Page](https://github.com/sokinpui/3100_project/issues)** (Replace with your actual repo URL!).

## 8. Conclusion

Thanks for using SETA! We hope it helps you gain control and insights into your personal finances. Explore the different modules, customize your dashboard, and make informed financial decisions!

---

## 9. Managing Your Licence Key

Certain advanced features, like generating Custom Reports, may require an active licence key.

1.  Click **"Settings"** in the sidebar.
2.  Scroll down to the **"Licence Management"** section.
3.  **View Status:** You can see your current licence status (e.g., "Active", "Inactive", "Not Set") and a partially masked version of your key if one is entered.
4.  **Update Key:**
    *   Enter your full licence key into the "Enter Licence Key" field. The format is typically XXXX-XXXX-XXXX-XXXX (using letters and numbers).
    *   Click the **"Update Licence"** button.
    *   The application will verify the key with the backend.
    *   You will see a success or error message, and the status display will update accordingly.
    *   An application restart might be required for licence changes to fully take effect everywhere.

**Available Licence Keys:**
```
0IH9-YJ2D-74IE-TJCH
0VEZ-UZVC-NPVW-EPHE
2XJB-M1SE-FDIE-55ST
3AJM-WX1M-886P-KVSW
6D4K-MP88-8HP1-HZ3Y
9VJ8-8DQ0-MKUD-UKO1
F2SV-I38E-EROW-9REZ
FBQT-HJVQ-QM2M-OPPW
IARV-E6SJ-03UB-UCH4
IDKC-7A36-WE4F-300S
IK4G-7CZJ-DFZI-9WE7
M7NI-QGLO-D55P-VWGN
PM0Y-9U9F-FKTP-HJ2O
R06P-T2RJ-QN1F-5E4X
UMBJ-PR19-XA4B-TBN8
W2FV-0GN0-FJ3D-I541
W35K-GQ7G-320V-T8GQ
WIC5-JM9W-T3F4-H2CN
YR1X-PLGN-G9C6-4DCF
YYNW-CGCU-MPHL-308J
```

## 10. Generating Custom Reports (Licence Required)

SETA allows you to generate highly customized reports if you have an active licence key. This provides more flexibility than the standard "Generate Reports" feature.

1.  **Navigate:** Click **"Custom Reports"** in the sidebar. You may see a lock icon next to it if your licence is not active.
2.  **Select Data Types:** Check the boxes next to the data types you want to include in your report (e.g., Expenses, Income, Accounts).
3.  **Configure Options:**
    *   **Time Period:** Use the "Time Period Selector" at the top (similar to the Dashboard) to filter the data by a specific date range (e.g., Last 30 Days, Custom Range).
    *   **Output Format:** Choose the desired file format (CSV, Excel, or PDF) from the dropdown menu.
    *   **(Future Feature):** Column Selection - *Currently, all default columns for the selected data types are included. Future versions might allow choosing specific columns.*
4.  **Generate:** Click the **"Generate Report"** button.
5.  **Download:** The application will process your request and initiate a file download in the selected format.

This feature is useful for creating targeted reports for specific analysis needs (e.g., only income and expenses for the last quarter in Excel format).
