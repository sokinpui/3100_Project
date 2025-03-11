import requests
import random
import datetime
import json
from dateutil.relativedelta import relativedelta

# API base URL
BASE_URL = "http://localhost:8000"  # Change if your API is running elsewhere

# Sample categories
CATEGORIES = [
    "Food", "Transport", "Entertainment", "Housing", "Utilities",
    "Healthcare", "Shopping", "Travel", "Education", "Subscriptions"
]

# Sample descriptions for each category
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

# Define recurring expenses
RECURRING_EXPENSES = [
    {"category": "Housing", "description": "Rent payment", "amount": 1200, "day_of_month": 1},
    {"category": "Utilities", "description": "Electricity bill", "amount": 85, "day_of_month": 15},
    {"category": "Subscriptions", "description": "Netflix subscription", "amount": 15.99, "day_of_month": 10},
    {"category": "Subscriptions", "description": "Gym membership", "amount": 49.99, "day_of_month": 5},
    {"category": "Transport", "description": "Monthly transit pass", "amount": 75, "day_of_month": 25}
]

# Test account credentials
TEST_USERNAME = "test"
TEST_PASSWORD = "Password123."

# Function to log in with the test account
def login():
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }

    response = requests.post(f"{BASE_URL}/login", json=login_data)
    if response.status_code == 200:
        print(f"Logged in as: {TEST_USERNAME}")
        return response.json()  # Assuming the API returns user data including user_id
    else:
        print(f"Failed to log in: {response.text}")
        return None

# Function to generate random expenses for a user
def generate_expenses(user_id, count=50):
    """Generate random expenses for a user.
    :param user_id: The ID of the user.
    :param count: The number of expenses to generate (default: 50).
    """
    # Generate expenses for the last 6 months
    end_date = datetime.date.today()
    start_date = end_date - relativedelta(months=6)

    created_expenses = []

    for _ in range(count):
        # Random date within the last 6 months
        random_days = random.randint(0, (end_date - start_date).days)
        expense_date = start_date + datetime.timedelta(days=random_days)

        # Random category
        category = random.choice(CATEGORIES)

        # Random amount between $1 and $500
        amount = round(random.uniform(1, 500), 2)

        # Random description from the category
        description = random.choice(DESCRIPTIONS[category])

        expense_data = {
            "user_id": user_id,
            "amount": amount,
            "date": expense_date.isoformat(),
            "category_name": category,
            "description": description
        }

        response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
        if response.status_code == 201:
            print(f"Created expense: {amount} - {category} - {expense_date}")
            created_expenses.append(response.json())
        else:
            print(f"Failed to create expense: {response.text}")

    return created_expenses

# Function to generate recurring expenses over multiple months
def generate_recurring_expenses(user_id, months=6):
    """Generate recurring expenses over multiple months.
    :param user_id: The ID of the user.
    :param months: The number of months to generate recurring expenses for (default: 6).
    """
    created_expenses = []
    today = datetime.date.today()

    # For each recurring expense type
    for recurring in RECURRING_EXPENSES:
        # For each month in the past X months
        for month_offset in range(months):
            # Calculate the date for this recurring expense
            expense_date = today.replace(day=1) - relativedelta(months=month_offset)
            # Make sure day is valid for the month
            day = min(recurring["day_of_month"], 28 if expense_date.month == 2 else 30)
            expense_date = expense_date.replace(day=day)

            # Add some slight variation to amounts occasionally
            amount = recurring["amount"]
            if random.random() < 0.3:  # 30% chance of slight variation
                amount = round(amount * random.uniform(0.95, 1.05), 2)

            expense_data = {
                "user_id": user_id,
                "amount": amount,
                "date": expense_date.isoformat(),
                "category_name": recurring["category"],
                "description": recurring["description"]
            }

            response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
            if response.status_code == 201:
                print(f"Created recurring expense: {amount} - {recurring['category']} - {expense_date}")
                created_expenses.append(response.json())
            else:
                print(f"Failed to create expense: {response.text}")

    return created_expenses

# Function to generate enough data for month-to-month comparison
def generate_monthly_comparison_data(user_id, months=6, expenses_per_month=20):
    """Generate enough data for month-to-month comparison.
    :param user_id: The ID of the user.
    :param months: The number of months to generate data for (default: 6).
    :param expenses_per_month: The number of expenses to generate per month (default: 20).
    """
    created_expenses = []
    today = datetime.date.today()

    for month_offset in range(months):
        # Current month being processed
        month_date = today.replace(day=1) - relativedelta(months=month_offset)
        month_end = (month_date + relativedelta(months=1) - datetime.timedelta(days=1))

        # Generate varying expenses for this month
        monthly_total = 2000 + (month_offset * 200)  # More expenses in recent months
        expense_count = expenses_per_month  # Number of expenses per month

        # Distribute the total amount across the expenses
        amounts = [round(random.uniform(1, 500), 2) for _ in range(expense_count)]
        total_amount = sum(amounts)
        scaling_factor = monthly_total / total_amount
        amounts = [round(amount * scaling_factor, 2) for amount in amounts]

        for amount in amounts:
            # Random category
            category = random.choice(CATEGORIES)

            # Random description from the category
            description = random.choice(DESCRIPTIONS[category])

            # Random date within the month
            expense_date = month_date + datetime.timedelta(days=random.randint(0, (month_end - month_date).days))

            expense_data = {
                "user_id": user_id,
                "amount": amount,
                "date": expense_date.isoformat(),
                "category_name": category,
                "description": description
            }

            response = requests.post(f"{BASE_URL}/expenses", json=expense_data)
            if response.status_code == 201:
                print(f"Created expense: {amount} - {category} - {expense_date}")
                created_expenses.append(response.json())
            else:
                print(f"Failed to create expense: {response.text}")

    return created_expenses

# Main function
def main():
    # Log in with the test account
    user = login()
    if not user:
        print("Failed to log in. Exiting.")
        return

    # Generate random expenses for the user
    user_id = user["id"]  # Assuming the login response includes the user_id
    print(f"Generating expenses for user ID: {user_id}")

    # Configure the number of data to generate
    num_random_expenses = 100  # Change this to the desired number of random expenses
    num_months_for_recurring = 12  # Change this to the desired number of months for recurring expenses
    num_months_for_comparison = 12  # Change this to the desired number of months for comparison data
    expenses_per_month = 10  # Change this to the desired number of expenses per month

    # Generate random expenses
    expenses = generate_expenses(user_id, count=num_random_expenses)

    # Generate recurring expenses
    recurring_expenses = generate_recurring_expenses(user_id, months=num_months_for_recurring)

    # Generate monthly comparison data
    monthly_expenses = generate_monthly_comparison_data(user_id, months=num_months_for_comparison, expenses_per_month=expenses_per_month)

    print(f"Generated {len(expenses)} random expenses for user ID: {user_id}")
    print(f"Generated {len(recurring_expenses)} recurring expenses for user ID: {user_id}")
    print(f"Generated {len(monthly_expenses)} monthly comparison expenses for user ID: {user_id}")

    # Save user details to a file for reference
    with open("test_user_info.json", "w") as f:
        json.dump({
            "user": user,
            "expense_count": len(expenses),
            "recurring_expense_count": len(recurring_expenses),
            "monthly_expense_count": len(monthly_expenses)
        }, f, indent=2)

    print(f"User info saved to test_user_info.json")

if __name__ == "__main__":
    main()
