import requests
import random
import datetime
import json
import os
import signal
import sys
from dateutil.relativedelta import relativedelta
import concurrent.futures
import threading
import time # For potential delays

# --- Configuration ---
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "test"
TEST_PASSWORD = "Password123."

NUM_ACCOUNTS = 4
NUM_INCOME_RECORDS = 150
NUM_RANDOM_EXPENSES = 300
NUM_GOALS = 3
NUM_BUDGETS = 4 # e.g., Food, Transport, Entertainment, Shopping
NUM_RECURRING_RULES = 5

# Date range for expenses/income (relative to today)
DATA_START_MONTHS_AGO = 6
DATA_END_MONTHS_AGO = 0 # 0 means up to today

# --- End Configuration ---

# --- Sample Data Definitions ---
ACCOUNT_TYPES = ["Checking", "Savings", "Credit Card", "Cash", "Investment"]
INCOME_SOURCES = ["Salary", "Freelance Project", "Bonus", "Investment Dividend", "Gift", "Side Hustle"]
EXPENSE_CATEGORIES = [ # Use categories defined in your constants.js/models
    "Food & Dining", "Transportation", "Housing", "Entertainment", "Healthcare",
    "Shopping", "Education", "Utilities", "Travel", "Personal Care", "Subscriptions"
]
# Ensure DESCRIPTIONS keys match EXPENSE_CATEGORIES exactly
DESCRIPTIONS = {
    "Food & Dining": ["Grocery shopping", "Restaurant dinner", "Lunch", "Coffee", "Take-out"],
    "Transportation": ["Fuel", "Public transport", "Taxi/Uber", "Car maintenance", "Parking"],
    "Housing": ["Rent/Mortgage", "Home repairs", "Furniture", "HOA Fees", "Property Tax"],
    "Entertainment": ["Movie tickets", "Concert", "Video games", "Streaming services", "Books/Magazines"],
    "Healthcare": ["Doctor visit", "Medication", "Health insurance premium", "Dental checkup", "Vision care"],
    "Shopping": ["Clothing", "Electronics", "Personal care items", "Gifts", "Home goods"],
    "Education": ["Tuition fees", "Textbooks", "Online course", "Workshop", "School supplies"],
    "Utilities": ["Electricity bill", "Water bill", "Internet/Cable bill", "Gas bill", "Phone bill"],
    "Travel": ["Flight tickets", "Hotel stay", "Train ticket", "Vacation rental", "Souvenirs"],
    "Personal Care": ["Haircut", "Toiletries", "Cosmetics", "Spa/Massage", "Pharmacy items"],
    "Subscriptions": ["Netflix", "Spotify", "Gym membership", "Software license", "Cloud storage"]
}
GOAL_NAMES = ["Vacation Fund", "Emergency Savings", "New Car Down Payment", "Home Renovation", "Retirement Top-up"]
BUDGET_CATEGORIES = ["Food & Dining", "Transportation", "Entertainment", "Shopping", "Utilities"] # Categories to create budgets for
RECURRING_ITEMS = [
    {"name": "Rent/Mortgage", "category": "Housing", "amount": 1500, "frequency": "monthly"},
    {"name": "Internet Bill", "category": "Utilities", "amount": 65, "frequency": "monthly"},
    {"name": "Netflix", "category": "Subscriptions", "amount": 15.99, "frequency": "monthly"},
    {"name": "Gym Membership", "category": "Subscriptions", "amount": 45, "frequency": "monthly"},
    {"name": "Phone Bill", "category": "Utilities", "amount": 80, "frequency": "monthly"},
    {"name": "Car Insurance", "category": "Transportation", "amount": 120, "frequency": "monthly"}, # Example semi-annual might be harder to script simply
    {"name": "Cloud Storage", "category": "Subscriptions", "amount": 9.99, "frequency": "monthly"},
]
# --- End Sample Data Definitions ---


# --- Global State ---
user_info = None
created_accounts = []
created_income = []
created_expenses = []
created_recurring_rules = []
created_budgets = []
created_goals = []

# Thread-safe locks
accounts_lock = threading.Lock()
income_lock = threading.Lock()
expenses_lock = threading.Lock()
recurring_rules_lock = threading.Lock()
budgets_lock = threading.Lock()
goals_lock = threading.Lock()

# Stop flag
stop_flag = threading.Event() # Use Event for better thread signaling

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "test_user_data_summary.json")
# --- End Global State ---


# --- API Interaction Functions ---

def login():
    """Logs in the test user and returns user data."""
    login_data = {"username": TEST_USERNAME, "password": TEST_PASSWORD}
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data, timeout=10)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        print(f"Successfully logged in as: {TEST_USERNAME}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Login failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response body: {e.response.text}")
        return None

def post_data(endpoint, data, item_type, item_desc):
    """Generic function to POST data to an endpoint."""
    if stop_flag.is_set():
        return None
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=10)
        if response.status_code == 201:
            print(f"Successfully created {item_type}: {item_desc}")
            return response.json()
        else:
            print(f"Failed to create {item_type} ({item_desc}): {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error creating {item_type} ({item_desc}): {e}")
        return None

# --- Data Generation Functions ---

def generate_accounts(user_id, num_accounts):
    """Generates sample accounts."""
    print(f"\n--- Generating {num_accounts} Accounts ---")
    created_count = 0
    temp_accounts = []
    account_names = set() # Ensure unique names

    # Try to create common account types first
    common_types = ["Checking", "Savings", "Credit Card"]
    for acc_type in common_types:
         if stop_flag.is_set() or created_count >= num_accounts: break
         name = f"Primary {acc_type}"
         if name in account_names: continue

         balance_date = (datetime.date.today() - relativedelta(months=DATA_START_MONTHS_AGO)).isoformat()
         start_balance = round(random.uniform(500, 5000), 2) if acc_type != "Credit Card" else round(random.uniform(-1000, 0), 2)

         payload = {
             "user_id": user_id, "name": name, "account_type": acc_type,
             "starting_balance": start_balance, "balance_date": balance_date
         }
         result = post_data("/accounts", payload, "Account", name)
         if result:
             temp_accounts.append(result)
             account_names.add(name)
             created_count += 1

    # Create remaining accounts randomly
    while created_count < num_accounts and not stop_flag.is_set():
        acc_type = random.choice(ACCOUNT_TYPES)
        name_suffix = random.randint(1000, 9999)
        name = f"{acc_type} ****{name_suffix}"
        if name in account_names: continue # Skip duplicate names

        balance_date = (datetime.date.today() - relativedelta(months=DATA_START_MONTHS_AGO)).isoformat()
        start_balance = round(random.uniform(-1000, 10000), 2)

        payload = {
            "user_id": user_id, "name": name, "account_type": acc_type,
            "starting_balance": start_balance, "balance_date": balance_date
        }
        result = post_data("/accounts", payload, "Account", name)
        if result:
             temp_accounts.append(result)
             account_names.add(name)
             created_count += 1

    with accounts_lock:
        created_accounts.extend(temp_accounts)
    print(f"--- Finished generating {created_count} accounts ---")


def generate_single_income(user_id, start_date, end_date, account_ids):
    """Generates a single income record."""
    if stop_flag.is_set(): return
    source = random.choice(INCOME_SOURCES)
    if source == "Salary":
        amount = round(random.uniform(2000, 6000), 2)
    elif source == "Bonus":
         amount = round(random.uniform(500, 3000), 2)
    else:
        amount = round(random.uniform(50, 1000), 2)

    random_days = random.randint(0, (end_date - start_date).days)
    income_date = start_date + datetime.timedelta(days=random_days)
    # Ensure date doesn't exceed today
    income_date = min(income_date, datetime.date.today())

    description = f"{source} deposit"
    account_id = random.choice(account_ids) if account_ids and random.random() < 0.7 else None # 70% chance to link

    payload = {
        "user_id": user_id, "amount": amount, "date": income_date.isoformat(),
        "source": source, "description": description, "account_id": account_id
    }
    result = post_data("/income", payload, "Income", f"{source} ${amount}")
    if result:
        with income_lock:
            created_income.append(result)

def generate_income_records_concurrently(user_id, num_records, start_date, end_date, account_ids):
    """Generates income records using a thread pool."""
    print(f"\n--- Generating {num_records} Income Records ---")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(generate_single_income, user_id, start_date, end_date, account_ids) for _ in range(num_records)]
        # Wait for completion (optional, can let it run in background)
        concurrent.futures.wait(futures)
    print(f"--- Finished generating income (attempted {num_records}) ---")


def generate_single_expense(user_id, start_date, end_date, account_ids):
     """Generates a single random expense record."""
     if stop_flag.is_set(): return
     category = random.choice(EXPENSE_CATEGORIES)
     description = random.choice(DESCRIPTIONS[category])
     amount = round(random.uniform(1, 400), 2) # Adjust range as needed

     random_days = random.randint(0, (end_date - start_date).days)
     expense_date = start_date + datetime.timedelta(days=random_days)
     # Ensure date doesn't exceed today
     expense_date = min(expense_date, datetime.date.today())

     account_id = random.choice(account_ids) if account_ids and random.random() < 0.5 else None # 50% chance to link

     payload = {
         "user_id": user_id, "amount": amount, "date": expense_date.isoformat(),
         "category_name": category, "description": description, "account_id": account_id
     }
     result = post_data("/expenses", payload, "Expense", f"{category} ${amount}")
     if result:
         with expenses_lock:
             created_expenses.append(result)

def generate_expenses_concurrently(user_id, num_records, start_date, end_date, account_ids):
    """Generates expense records using a thread pool."""
    print(f"\n--- Generating {num_records} Random Expenses ---")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor: # More workers for expenses
        futures = [executor.submit(generate_single_expense, user_id, start_date, end_date, account_ids) for _ in range(num_records)]
        concurrent.futures.wait(futures)
    print(f"--- Finished generating expenses (attempted {num_records}) ---")


def generate_recurring_rules(user_id, num_rules, account_ids):
    """Generates recurring expense rules."""
    print(f"\n--- Generating {num_rules} Recurring Expense Rules ---")
    created_count = 0
    temp_rules = []
    items_to_use = random.sample(RECURRING_ITEMS, min(num_rules, len(RECURRING_ITEMS)))

    for item in items_to_use:
         if stop_flag.is_set(): break
         start_date = (datetime.date.today() - relativedelta(months=random.randint(6, 18))).replace(day=random.randint(1, 15))
         end_date = start_date + relativedelta(years=random.randint(1, 3)) if random.random() < 0.3 else None # 30% have end dates
         account_id = random.choice(account_ids) if account_ids and random.random() < 0.8 else None

         payload = {
             "user_id": user_id,
             "name": item["name"],
             "amount": round(item["amount"] * random.uniform(0.9, 1.1), 2), # Slight variation
             "category_name": item["category"],
             "frequency": item["frequency"],
             "start_date": start_date.isoformat(),
             "end_date": end_date.isoformat() if end_date else None,
             "description": f"Recurring: {item['name']}",
             "account_id": account_id
         }
         result = post_data("/recurring", payload, "Recurring Rule", item["name"])
         if result:
             temp_rules.append(result)
             created_count += 1

    with recurring_rules_lock:
        created_recurring_rules.extend(temp_rules)
    print(f"--- Finished generating {created_count} recurring rules ---")


def generate_budgets(user_id, num_budgets):
    """Generates budget rules."""
    print(f"\n--- Generating {num_budgets} Budgets ---")
    created_count = 0
    temp_budgets = []
    categories_to_use = random.sample(BUDGET_CATEGORIES, min(num_budgets, len(BUDGET_CATEGORIES)))

    for category in categories_to_use:
         if stop_flag.is_set(): break
         amount_limit = round(random.uniform(100, 1000), 2)
         period = "monthly" # Keep it simple for generation
         start_date = (datetime.date.today() - relativedelta(months=random.randint(1, 3))).replace(day=1)

         payload = {
             "user_id": user_id,
             "category_name": category,
             "amount_limit": amount_limit,
             "period": period,
             "start_date": start_date.isoformat(),
             "end_date": None # Usually ongoing
         }
         result = post_data("/budgets", payload, "Budget", f"{category} ${amount_limit}/{period}")
         if result:
             temp_budgets.append(result)
             created_count += 1

    with budgets_lock:
        created_budgets.extend(temp_budgets)
    print(f"--- Finished generating {created_count} budgets ---")


def generate_goals(user_id, num_goals):
    """Generates financial goals."""
    print(f"\n--- Generating {num_goals} Goals ---")
    created_count = 0
    temp_goals = []
    goals_to_use = random.sample(GOAL_NAMES, min(num_goals, len(GOAL_NAMES)))

    for name in goals_to_use:
        if stop_flag.is_set(): break
        target_amount = round(random.uniform(1000, 20000), 2)
        current_amount = round(target_amount * random.uniform(0.1, 0.8), 2) # Partially funded
        target_date = datetime.date.today() + relativedelta(months=random.randint(6, 24)) if random.random() < 0.8 else None

        payload = {
             "user_id": user_id,
             "name": name,
             "target_amount": target_amount,
             "current_amount": current_amount,
             "target_date": target_date.isoformat() if target_date else None,
        }
        result = post_data("/goals", payload, "Goal", f"{name} (${current_amount}/${target_amount})")
        if result:
            temp_goals.append(result)
            created_count += 1

    with goals_lock:
        created_goals.extend(temp_goals)
    print(f"--- Finished generating {created_count} goals ---")


# --- Utility Functions ---

def save_to_json():
    """Saves summary information to a JSON file."""
    global user_info, created_accounts, created_income, created_expenses, created_recurring_rules, created_budgets, created_goals
    if user_info:
        data = {
            "user": { # Save only non-sensitive info
                "id": user_info.get("id"),
                "username": user_info.get("username"),
                "email": user_info.get("email"),
                "first_name": user_info.get("first_name"),
                "last_name": user_info.get("last_name"),
            },
            "generation_summary": {
                "accounts_generated": len(created_accounts),
                "income_records_generated": len(created_income),
                "random_expenses_generated": len(created_expenses),
                "recurring_rules_generated": len(created_recurring_rules),
                "budgets_generated": len(created_budgets),
                "goals_generated": len(created_goals),
                "timestamp": datetime.datetime.now().isoformat()
            }
        }
        try:
            with open(JSON_FILE, "w") as f:
                json.dump(data, f, indent=2)
            print(f"\nSummary data saved to {JSON_FILE}")
        except IOError as e:
            print(f"\nError saving summary data to {JSON_FILE}: {e}")
    else:
        print("\nNo user info available, cannot save summary.")


def signal_handler(sig, frame):
    """Handles Ctrl+C interruption."""
    print("\nInterrupt received, signaling threads to stop...")
    stop_flag.set() # Signal threads to stop
    # Give threads a moment to finish current task if possible
    time.sleep(1)
    print("Attempting to save summary data...")
    save_to_json()
    print("Exiting.")
    sys.exit(0)

# --- Main Execution ---

def main():
    global user_info
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("Attempting to log in...")
    user = login()
    if not user:
        print("Exiting due to login failure.")
        return

    user_id = user.get("id")
    if not user_id:
         print("Could not get user ID from login response. Exiting.")
         return

    user_info = user # Store logged-in user info
    print(f"--- Logged in as user ID: {user_id} ({user.get('username')}) ---")
    print("Starting data generation. Press Ctrl+C to interrupt and save summary.")

    # --- Determine Date Range ---
    end_date = datetime.date.today() - relativedelta(months=DATA_END_MONTHS_AGO)
    start_date = datetime.date.today() - relativedelta(months=DATA_START_MONTHS_AGO)
    print(f"Data generation date range: {start_date.isoformat()} to {end_date.isoformat()}")

    try:
        # 1. Generate Accounts (Synchronously, needed for IDs)
        generate_accounts(user_id, NUM_ACCOUNTS)
        # Get account IDs for linking
        account_ids = [acc['id'] for acc in created_accounts if acc and 'id' in acc]

        # 2. Generate other data types (some concurrently)
        # Use ThreadPoolExecutor for I/O bound tasks (API calls)
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            # Submit concurrent tasks
            futures.append(executor.submit(generate_income_records_concurrently, user_id, NUM_INCOME_RECORDS, start_date, end_date, account_ids))
            futures.append(executor.submit(generate_expenses_concurrently, user_id, NUM_RANDOM_EXPENSES, start_date, end_date, account_ids))

            # Submit synchronous tasks (fewer items, less benefit from concurrency)
            futures.append(executor.submit(generate_recurring_rules, user_id, NUM_RECURRING_RULES, account_ids))
            futures.append(executor.submit(generate_budgets, user_id, NUM_BUDGETS))
            futures.append(executor.submit(generate_goals, user_id, NUM_GOALS))

            # Wait for all submitted tasks to complete
            print("\nWaiting for generation tasks to complete...")
            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result() # Check for exceptions raised in threads
                except Exception as exc:
                    print(f'A generation task raised an exception: {exc}')

        print("\n--- All data generation tasks finished ---")

    except Exception as e:
        print(f"\nAn unexpected error occurred during generation: {e}")
    finally:
        # Always try to save summary at the end
        save_to_json()

if __name__ == "__main__":
    main()
