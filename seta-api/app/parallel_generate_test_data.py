import requests
import random
import datetime
import json
import os
import signal
import sys
from dateutil.relativedelta import relativedelta
import concurrent.futures

# API base URL
BASE_URL = "http://localhost:8000"

# Sample categories and descriptions (unchanged)
CATEGORIES = [
    "Food", "Transport", "Entertainment", "Housing", "Utilities",
    "Healthcare", "Shopping", "Travel", "Education", "Subscriptions"
]

DESCRIPTIONS = {
    "Food": ["Grocery shopping", "Restaurant dinner", "Lunch with colleagues", "Coffee", "Take-out food"],
    "Transport": ["Fuel", "Public transport", "Taxi", "Car maintenance", "Parking fees"],
    "Entertainment": ["Movie tickets", "Concert", "Video games", "Streaming services", "Books"],
    "Housing": ["Rent", "Mortgage payment", "Home repairs", "Furniture", "Home decor"],
    "Utilities": ["Electricity bill", "Water bill", "Internet bill", "Gas bill", "Phone bill"],
    "Healthcare": ["Doctor visit", "Medication", "Health insurance", "Dental care", "Eye care"],
    "Shopping": ["Clothing", "Electronics", "Personal care items", "Gifts", "Home appliances"],
    "Travel": ["Flight tickets", "Hotel stay", "Car rental", "Travel insurance", "Souvenirs"],
    "Education": ["Tuition fees", "Textbooks", "Online courses", "School supplies", "Tutoring"],
    "Subscriptions": ["Netflix", "Spotify", "Gym membership", "Magazine subscription", "Software licenses"]
}

RECURRING_EXPENSES = [
    {"category": "Housing", "description": "Rent payment", "amount": 1200, "day_of_month": 1},
    {"category": "Utilities", "description": "Electricity bill", "amount": 85, "day_of_month": 15},
    {"category": "Subscriptions", "description": "Netflix subscription", "amount": 15.99, "day_of_month": 10},
    {"category": "Subscriptions", "description": "Gym membership", "amount": 49.99, "day_of_month": 5},
    {"category": "Transport", "description": "Monthly transit pass", "amount": 75, "day_of_month": 25}
]

TEST_USERNAME = "test"
TEST_PASSWORD = "Password123."

# Global variables to track created expenses
created_expenses = []
created_recurring_expenses = []
created_monthly_expenses = []
user_info = None

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "test_user_info.json")

def login():
    login_data = {"username": TEST_USERNAME, "password": TEST_PASSWORD}
    response = requests.post(f"{BASE_URL}/login", json=login_data)
    if response.status_code == 200:
        print(f"Logged in as: {TEST_USERNAME}")
        return response.json()
    else:
        print(f"Failed to log in: {response.text}")
        return None

def generate_expenses(user_id, start, end):
    end_date = datetime.date.today()
    start_date = end_date - relativedelta(months=6)
    for i in range(start, end):
        random_days = random.randint(0, (end_date - start_date).days)
        expense_date = start_date + datetime.timedelta(days=random_days)
        category = random.choice(CATEGORIES)
        amount = round(random.uniform(1, 500), 2)
        description = random.choice(DESCRIPTIONS[category])
        expense_data = {
            "user_id": user_id, "amount": amount, "date": expense_date.isoformat(),
            "category_name": category, "description": description
        }
        response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
        if response.status_code == 201:
            print(f"Created expense {i+1}/{end}: {amount} - {category} - {expense_date}")
            created_expenses.append(response.json())
        else:
            print(f"Failed to create expense {i+1}/{end}: {response.text}")
    return created_expenses

def generate_recurring_expenses(user_id, start, end):
    today = datetime.date.today()
    total_recurring = len(RECURRING_EXPENSES) * (end - start)
    current = 0
    for recurring in RECURRING_EXPENSES:
        for month_offset in range(start, end):
            current += 1
            expense_date = today.replace(day=1) - relativedelta(months=month_offset)
            day = min(recurring["day_of_month"], 28 if expense_date.month == 2 else 30)
            expense_date = expense_date.replace(day=day)
            amount = recurring["amount"]
            if random.random() < 0.3:
                amount = round(amount * random.uniform(0.95, 1.05), 2)
            expense_data = {
                "user_id": user_id, "amount": amount, "date": expense_date.isoformat(),
                "category_name": recurring["category"], "description": recurring["description"]
            }
            response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
            if response.status_code == 201:
                print(f"Created recurring expense {current}/{total_recurring}: {amount} - {recurring['category']} - {expense_date}")
                created_recurring_expenses.append(response.json())
            else:
                print(f"Failed to create recurring expense {current}/{total_recurring}: {response.text}")
    return created_recurring_expenses

def generate_monthly_comparison_data(user_id, start, end, expenses_per_month=20):
    today = datetime.date.today()
    total_expenses = (end - start) * expenses_per_month
    current = 0
    for month_offset in range(start, end):
        month_date = today.replace(day=1) - relativedelta(months=month_offset)
        month_end = (month_date + relativedelta(months=1) - datetime.timedelta(days=1))
        monthly_total = 2000 + (month_offset * 200)
        expense_count = expenses_per_month
        amounts = [round(random.uniform(1, 500), 2) for _ in range(expense_count)]
        total_amount = sum(amounts)
        scaling_factor = monthly_total / total_amount
        amounts = [round(amount * scaling_factor, 2) for amount in amounts]
        for amount in amounts:
            current += 1
            category = random.choice(CATEGORIES)
            description = random.choice(DESCRIPTIONS[category])
            expense_date = month_date + datetime.timedelta(days=random.randint(0, (month_end - month_date).days))
            expense_data = {
                "user_id": user_id, "amount": amount, "date": expense_date.isoformat(),
                "category_name": category, "description": description
            }
            response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
            if response.status_code == 201:
                print(f"Created monthly expense {current}/{total_expenses}: {amount} - {category} - {expense_date}")
                created_monthly_expenses.append(response.json())
            else:
                print(f"Failed to create monthly expense {current}/{total_expenses}: {response.text}")
    return created_monthly_expenses

def save_to_json():
    global user_info, created_expenses, created_recurring_expenses, created_monthly_expenses
    if user_info:
        data = {
            "user": user_info,
            "expense_count": len(created_expenses),
            "recurring_expense_count": len(created_recurring_expenses),
            "monthly_expense_count": len(created_monthly_expenses)
        }
        with open(JSON_FILE, "w") as f:
            json.dump(data, f, indent=2)
        print(f"User info saved to {JSON_FILE} with counts: {len(created_expenses)} random, "
              f"{len(created_recurring_expenses)} recurring, {len(created_monthly_expenses)} monthly")

def signal_handler(sig, frame):
    print("\nInterrupt received, saving current state and exiting...")
    save_to_json()
    sys.exit(0)

def main():
    global user_info
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    user = login()
    if not user:
        print("Failed to log in. Exiting.")
        return

    user_id = user["id"]
    user_info = user
    print(f"Generating expenses for user ID: {user_id}")

    print("You can interrupt the script at any time to save the current state.")

    num_random_expenses = 100
    num_months_for_recurring = 12
    num_months_for_comparison = 12
    expenses_per_month = 10

    try:
        # Parallelize random expense generation
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = []
            chunk_size = num_random_expenses // 4
            for i in range(0, num_random_expenses, chunk_size):
                start = i
                end = min(i + chunk_size, num_random_expenses)
                futures.append(executor.submit(generate_expenses, user_id, start, end))
            concurrent.futures.wait(futures)

        # Parallelize recurring expense generation
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = []
            chunk_size = num_months_for_recurring // 4
            for i in range(0, num_months_for_recurring, chunk_size):
                start = i
                end = min(i + chunk_size, num_months_for_recurring)
                futures.append(executor.submit(generate_recurring_expenses, user_id, start, end))
            concurrent.futures.wait(futures)

        # Parallelize monthly comparison data generation
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = []
            chunk_size = num_months_for_comparison // 4
            for i in range(0, num_months_for_comparison, chunk_size):
                start = i
                end = min(i + chunk_size, num_months_for_comparison)
                futures.append(executor.submit(generate_monthly_comparison_data, user_id, start, end, expenses_per_month))
            concurrent.futures.wait(futures)

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        save_to_json()

    print(f"Generated {len(created_expenses)} random expenses for user ID: {user_id}")
    print(f"Generated {len(created_recurring_expenses)} recurring expenses for user ID: {user_id}")
    print(f"Generated {len(created_monthly_expenses)} monthly comparison expenses for user ID: {user_id}")

if __name__ == "__main__":
    main()
