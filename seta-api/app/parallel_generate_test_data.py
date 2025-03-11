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

# Thread-safe locks for data collection
expense_lock = threading.Lock()
recurring_lock = threading.Lock()
monthly_lock = threading.Lock()

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "test_user_info.json")

interrupt_flag = False

def signal_handler(sig, frame):
    global interrupt_flag
    print("\nInterrupt received. Preparing to save data...")
    interrupt_flag = True

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
    local_expenses = []
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
            local_expenses.append(response.json())
        else:
            print(f"Failed to create expense {i+1}/{end}: {response.text}")
    return local_expenses

def generate_recurring_expenses(user_id, start, end):
    local_recurring_expenses = []
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
                local_recurring_expenses.append(response.json())
            else:
                print(f"Failed to create recurring expense {current}/{total_recurring}: {response.text}")
    return local_recurring_expenses

def generate_monthly_comparison_data(user_id, start, end, expenses_per_month=20):
    local_monthly_expenses = []
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
                local_monthly_expenses.append(response.json())
            else:
                print(f"Failed to create monthly expense {current}/{total_expenses}: {response.text}")
    return local_monthly_expenses

def save_to_json():
    global created_expenses, created_recurring_expenses, created_monthly_expenses
    data = {
        "expense_count": len(created_expenses),
        "recurring_expense_count": len(created_recurring_expenses),
        "monthly_expense_count": len(created_monthly_expenses),
        "expenses": created_expenses,
        "recurring_expenses": created_recurring_expenses,
        "monthly_expenses": created_monthly_expenses
    }
    with open(JSON_FILE, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Data saved to {JSON_FILE}")

def main():
    global interrupt_flag, created_expenses, created_recurring_expenses, created_monthly_expenses
    signal.signal(signal.SIGINT, signal_handler)
    user = login()
    if not user:
        print("Failed to log in. Exiting.")
        return
    user_id = user["id"]

    executor = concurrent.futures.ThreadPoolExecutor()
    future_to_type = {}

    try:
        # Submit tasks for random expenses
        num_random_expenses = 100
        chunk_size = num_random_expenses // 4
        for i in range(0, num_random_expenses, chunk_size):
            start = i
            end = min(i + chunk_size, num_random_expenses)
            future = executor.submit(generate_expenses, user_id, start, end)
            future_to_type[future] = 'random'

        # Submit tasks for recurring expenses
        num_months_for_recurring = 12
        chunk_size = num_months_for_recurring // 4
        for i in range(0, num_months_for_recurring, chunk_size):
            start = i
            end = min(i + chunk_size, num_months_for_recurring)
            future = executor.submit(generate_recurring_expenses, user_id, start, end)
            future_to_type[future] = 'recurring'

        # Submit tasks for monthly comparison data
        num_months_for_comparison = 12
        expenses_per_month = 10
        chunk_size = num_months_for_comparison // 4
        for i in range(0, num_months_for_comparison, chunk_size):
            start = i
            end = min(i + chunk_size, num_months_for_comparison)
            future = executor.submit(generate_monthly_comparison_data, user_id, start, end, expenses_per_month)
            future_to_type[future] = 'monthly'

        # Process results as they complete
        for future in concurrent.futures.as_completed(future_to_type):
            if interrupt_flag:
                executor.shutdown(wait=False, cancel_futures=True)
                break
            try:
                result = future.result()
                task_type = future_to_type[future]
                if task_type == 'random':
                    with expense_lock:
                        created_expenses.extend(result)
                elif task_type == 'recurring':
                    with recurring_lock:
                        created_recurring_expenses.extend(result)
                elif task_type == 'monthly':
                    with monthly_lock:
                        created_monthly_expenses.extend(result)
            except Exception as e:
                print(f"Error processing future: {e}")

    except KeyboardInterrupt:
        print("Interrupt caught. Shutting down...")
    finally:
        save_to_json()
        executor.shutdown(wait=False, cancel_futures=True)

if __name__ == "__main__":
    main()
