from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
import models
# from models import get_db, User, Expense
from models import get_db, User, Expense, Income, RecurringExpense, Budget, Goal, Account, FrequencyEnum
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict, validator, Field
from typing import List, Optional
import hashlib
import secrets
import string
import csv
import io
import pandas as pd
from PyPDF2 import PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from fastapi.responses import FileResponse

# Create a FastAPI application instance
app = FastAPI(title="SETA API", description="Backend API for Smart Expense Tracker Application")

# Configure CORS to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to SETA API", "version": "1.0"}

# --------- Pydantic Models ---------

class IncomeBase(BaseModel):
    amount: float
    date: date
    source: str
    description: Optional[str] = None
    account_id: Optional[int] = None

class IncomeCreate(IncomeBase):
    user_id: int

class IncomeResponse(IncomeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: orm_mode = True

class RecurringExpenseBase(BaseModel):
    name: str
    amount: float
    category_name: str
    frequency: FrequencyEnum
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    account_id: Optional[int] = None

class RecurringExpenseResponse(RecurringExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: orm_mode = True

class BudgetBase(BaseModel):
    category_name: str
    amount_limit: float
    period: FrequencyEnum
    start_date: date
    end_date: Optional[date] = None

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: orm_mode = True

class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[date] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: orm_mode = True

class AccountBase(BaseModel):
    name: str
    account_type: str
    starting_balance: float = 0.0
    balance_date: date
    currency: str = 'USD'

class AccountResponse(AccountBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: orm_mode = True

class ExpenseBase(BaseModel):
    """Base expense model with common attributes."""
    amount: float
    date: date
    category_name: str
    description: Optional[str] = None

class CreateExpense(ExpenseBase):
    """Model for validating expense creation requests."""
    user_id: int

class ExpenseResponse(ExpenseBase):
    """Response model for expenses."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    """Base user model with common attributes."""
    username: str
    email: str
    first_name: str
    last_name: str
    contact_number: str

class UserCreate(UserBase):
    """Model for validating user creation requests."""
    password: str

class UserLogin(BaseModel):
    """Model for validating user login requests."""
    username: str
    password: str

class UserResponse(UserBase):
    """Response model for users."""
    id: int
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserSettings(BaseModel):
    """Model for user settings."""
    theme: str = "light"
    language: str = "english"
    currency: str = "USD"

class UserUpdate(BaseModel):
    """Model for updating user data"""
    username: str
    email: str
    first_name: str
    last_name: str
    contact_number: str

class PasswordChange(BaseModel):
    """Model for password change requests."""
    current_password: str
    new_password: str

class BulkDeleteRequest(BaseModel):
    """Model for bulk delete requests."""
    expense_ids: List[int]

class PaginatedExpenseResponse(BaseModel):
    """Response model for paginated expenses."""
    total_count: int
    expenses: List[ExpenseResponse]

class ImportExpenseItem(BaseModel):
    """Model for a single expense item within an import request (without user_id)."""
    amount: float
    date: date
    category_name: str
    description: Optional[str] = None

class ImportResponse(BaseModel):
    """Response model for the import operation."""
    message: str
    imported_count: int
    skipped_rows: List[int] = []
    errors: List[str] = []

class AccountCreate(AccountBase):
    user_id: int

# --------- Helper Functions ---------

def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against a provided password."""
    return hash_password(plain_password) == hashed_password

def get_user_by_username(db: Session, username: str):
    """Get a user by username."""
    return db.query(models.User).filter(models.User.username == username).first()

# --------- User Authentication Endpoints ---------

@app.post("/login", response_model=UserResponse)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login a user and return user information."""
    user = get_user_by_username(db, user_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    user.last_login = func.now()
    db.commit()
    db.refresh(user)

    return user

@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    password_hash = hash_password(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        contact_number=user_data.contact_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# --------- Expense Endpoints ---------

@app.get("/expenses/{user_id}", response_model=List[ExpenseResponse])
async def get_user_expenses(user_id: int, db: Session = Depends(get_db)):
    """Get all expenses for a user."""
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    return expenses

@app.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense_data: CreateExpense, db: Session = Depends(get_db)):
    """Create a new expense."""
    user = db.query(models.User).filter(models.User.id == expense_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db_expense = models.Expense(
        user_id=expense_data.user_id,
        amount=expense_data.amount,
        date=expense_data.date,
        category_name=expense_data.category_name,
        description=expense_data.description
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense

@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense."""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return None

@app.post("/expenses/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_expenses(request: BulkDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple expenses by their IDs efficiently."""
    if not request.expense_ids:
        return None

    try:
        deleted_count = db.query(models.Expense).filter(models.Expense.id.in_(request.expense_ids)).delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during bulk delete: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete expenses due to a database error."
        )

    return None

@app.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense_data: CreateExpense, db: Session = Depends(get_db)):
    """Update an expense."""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    expense.amount = expense_data.amount
    expense.category_name = expense_data.category_name
    expense.date = expense_data.date
    expense.description = expense_data.description
    expense.updated_at = func.now()

    db.commit()
    db.refresh(expense)

    return expense

@app.post("/expenses/import/{user_id}", response_model=ImportResponse)
async def import_expenses_from_csv(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Imports expenses for a user from an uploaded CSV file."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    try:
        contents = await file.read()
        try:
            decoded_content = contents.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8.")
        csv_data = io.StringIO(decoded_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")
    finally:
        await file.close()

    expected_headers = ['date', 'amount', 'category_name', 'description']
    imported_count = 0
    skipped_rows = []
    errors = []
    expenses_to_add = []

    try:
        reader = csv.DictReader(csv_data)
        reader_headers_lower = {h.lower().strip() for h in reader.fieldnames or []}
        required_headers_lower = {'date', 'amount', 'category_name'}
        if not required_headers_lower.issubset(reader_headers_lower):
            missing = required_headers_lower - reader_headers_lower
            raise HTTPException(
                status_code=400,
                detail=f"Missing required CSV columns: {', '.join(missing)}. Required: date, amount, category_name."
            )

        header_map = {
            expected.lower(): actual
            for expected in expected_headers
            for actual in (reader.fieldnames or [])
            if expected.lower() == actual.lower().strip()
        }

        for i, row in enumerate(reader):
            line_number = i + 2
            try:
                mapped_row = {
                    'date': row.get(header_map.get('date')),
                    'amount': row.get(header_map.get('amount')),
                    'category_name': row.get(header_map.get('category_name')),
                    'description': row.get(header_map.get('description'))
                }

                if not mapped_row['date'] or not mapped_row['amount'] or not mapped_row['category_name']:
                    raise ValueError("Missing required value(s) (date, amount, category_name)")

                try:
                    expense_date = datetime.strptime(mapped_row['date'], '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError(f"Invalid date format: '{mapped_row['date']}'. Use YYYY-MM-DD.")

                try:
                    amount = float(mapped_row['amount'])
                    if amount <= 0:
                        raise ValueError("Amount must be positive.")
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid amount value: '{mapped_row['amount']}'. Must be a positive number.")

                category_name = mapped_row['category_name'].strip()
                if not category_name:
                    raise ValueError("Category name cannot be empty.")

                description = mapped_row['description'].strip() if mapped_row['description'] else None

                db_expense = models.Expense(
                    user_id=user_id,
                    amount=amount,
                    date=expense_date,
                    category_name=category_name,
                    description=description
                )
                expenses_to_add.append(db_expense)

            except ValueError as ve:
                errors.append(f"Row {line_number}: {ve}")
                skipped_rows.append(line_number)
            except Exception as e:
                errors.append(f"Row {line_number}: Unexpected error - {e}")
                skipped_rows.append(line_number)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV: {e}")

    if expenses_to_add:
        try:
            db.add_all(expenses_to_add)
            db.commit()
            imported_count = len(expenses_to_add)
        except Exception as e:
            db.rollback()
            errors.append(f"Database commit failed: {e}")
            imported_count = 0

    status_message = "Import completed."
    if errors:
        status_message = "Import completed with errors."
    if imported_count == 0 and errors:
        status_message = "Import failed. See errors."

    return ImportResponse(
        message=status_message,
        imported_count=imported_count,
        skipped_rows=skipped_rows,
        errors=errors
    )

@app.get("/expenses/{user_id}/report")
async def generate_expense_report(user_id: int, format: str = "json", db: Session = Depends(get_db)):
    """Generate a detailed expense report for a user in specified format."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    expenses = db.query(models.Expense)\
        .filter(models.Expense.user_id == user_id)\
        .order_by(models.Expense.date.desc())\
        .all()

    total_amount = sum(float(expense.amount) for expense in expenses)
    expense_count = len(expenses)

    expense_data = [{
        "date": exp.date,
        "category_name": exp.category_name,
        "amount": float(exp.amount),
        "description": exp.description,
        "created_at": exp.created_at
    } for exp in expenses]

    if format.lower() == "json":
        return {
            "expenses": expense_data,
            "summary": {
                "total_amount": total_amount,
                "expense_count": expense_count,
                "generated_at": datetime.now(),
                "user_name": f"{user.first_name} {user.last_name}"
            }
        }

    elif format.lower() == "csv":
        df = pd.DataFrame(expense_data)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return FileResponse(
            buffer,
            media_type="text/csv",
            filename=f"expense_report_{datetime.now().date()}.csv"
        )

    elif format.lower() == "xlsx":
        df = pd.DataFrame(expense_data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        buffer.seek(0)
        return FileResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"expense_report_{datetime.now().date()}.xlsx"
        )

    elif format.lower() == "pdf":
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        c.drawString(30, height - 40, "Expense Report")
        c.drawString(30, height - 60, f"User: {user.first_name} {user.last_name}")
        c.drawString(30, height - 80, f"Generated: {datetime.now()}")

        y = height - 120
        c.drawString(30, y, "Date    Category    Amount    Description    Created At")
        y -= 20

        for exp in expense_data:
            if y < 50:
                c.showPage()
                y = height - 40
            line = f"{exp['date']}  {exp['category_name']}  ${exp['amount']}  {exp['description'] or '-'}  {exp['created_at']}"
            c.drawString(30, y, line[:100])
            y -= 20

        c.showPage()
        c.save()
        buffer.seek(0)

        return FileResponse(
            buffer,
            media_type="application/pdf",
            filename=f"expense_report_{datetime.now().date()}.pdf"
        )

    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use json, csv, xlsx, or pdf")

# --------- New Income Endpoints ---------

@app.get("/income/{user_id}", response_model=List[IncomeResponse])
async def get_user_income(user_id: int, db: Session = Depends(get_db)):
    """Get all income records for a user."""
    income_records = db.query(models.Income).filter(models.Income.user_id == user_id).all()
    return income_records

@app.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(income_data: IncomeCreate, db: Session = Depends(get_db)):
    """Create a new income record."""
    user = db.query(models.User).filter(models.User.id == income_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_income = models.Income(**income_data.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

# --------- New Recurring Expense Endpoints ---------

@app.get("/recurring/{user_id}", response_model=List[RecurringExpenseResponse])
async def get_user_recurring_expenses(user_id: int, db: Session = Depends(get_db)):
    """Get all recurring expense rules for a user."""
    # TODO: Add logic to calculate next due dates based on frequency/start_date
    recurring = db.query(models.RecurringExpense).filter(models.RecurringExpense.user_id == user_id).all()
    return recurring

# --------- New Budget Endpoints ---------

@app.get("/budgets/{user_id}", response_model=List[BudgetResponse])
async def get_user_budgets(user_id: int, db: Session = Depends(get_db)):
    """Get all budget rules for a user."""
    budgets = db.query(models.Budget).filter(models.Budget.user_id == user_id).all()
    return budgets

# --------- New Goal Endpoints ---------

@app.get("/goals/{user_id}", response_model=List[GoalResponse])
async def get_user_goals(user_id: int, db: Session = Depends(get_db)):
    """Get all financial goals for a user."""
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    return goals

# --------- New Account Endpoints ---------

@app.get("/accounts/{user_id}", response_model=List[AccountResponse])
async def get_user_accounts(user_id: int, db: Session = Depends(get_db)):
    """Get all accounts for a user."""
    accounts = db.query(models.Account).filter(models.Account.user_id == user_id).all()
    return accounts

# --------- User Settings Endpoints ---------

@app.get("/users/{user_id}/settings", response_model=UserSettings)
async def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    """Get user settings."""
    return UserSettings()

@app.put("/users/{user_id}/settings", response_model=UserSettings)
async def update_user_settings(user_id: int, settings: UserSettings, db: Session = Depends(get_db)):
    """Update user settings."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return settings

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.username = user_data.username
    user.email = user_data.email
    user.first_name = user_data.first_name
    user.last_name = user_data.last_name
    user.contact_number = user_data.contact_number

    db.commit()
    db.refresh(user)

    return user

@app.put("/users/{user_id}/password", status_code=status.HTTP_200_OK)
async def change_user_password(user_id: int, password_data: PasswordChange, db: Session = Depends(get_db)):
    """Change user password."""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not verify_password(password_data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    user.password_hash = hash_password(password_data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}

# --------- Statistics Endpoints ---------

@app.get("/expenses/{user_id}/total")
async def get_total_expenses(user_id: int, db: Session = Depends(get_db)):
    """Get total expenses for a user."""
    total = db.query(func.sum(models.Expense.amount)).filter(models.Expense.user_id == user_id).scalar() or 0
    return {"total": float(total)}

# --------- New Account Endpoints ---------

@app.get("/accounts/{user_id}", response_model=List[AccountResponse])
async def get_user_accounts(user_id: int, db: Session = Depends(get_db)):
    """Get all accounts for a user."""
    accounts = db.query(models.Account).filter(models.Account.user_id == user_id).all()
    return accounts

# --- ADD THIS ENDPOINT ---
@app.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(account_data: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account for a user."""
    user = db.query(models.User).filter(models.User.id == account_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not account_data.balance_date:
         raise HTTPException(status_code=400, detail="Balance date is required")

    # --- FIX IS HERE ---
    # Create dict excluding user_id for model creation
    # Use model_dump for Pydantic v2+ (which you likely have based on version 2.10.6)
    # If you were on Pydantic v1, you would use .dict()
    try:
        # Use model_dump for Pydantic v2
        create_data = account_data.model_dump(exclude={'user_id'})
    except AttributeError:
        # Fallback for Pydantic v1 if needed, though unlikely based on your requirements
        create_data = account_data.dict(exclude={'user_id'})
    # --- END FIX ---


    # Now create_data contains all fields from AccountBase but not user_id
    db_account = models.Account(user_id=account_data.user_id, **create_data)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

# --- Add Delete Endpoint (Basic) ---
@app.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: int, db: Session = Depends(get_db)):
    """Delete an account."""
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Optional: Add check if user owns this account before deleting

    db.delete(account)
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
