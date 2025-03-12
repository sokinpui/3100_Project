from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from models import get_db, User, Expense
from datetime import date, datetime
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import hashlib
import secrets
import string
from babel.dates import format_date, format_datetime
from babel import Locale

from fastapi.responses import FileResponse
import io
import pandas as pd
from PyPDF2 import PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Create a FastAPI application instance
app = FastAPI(title="SETA API", description="Backend API for Smart Expense Tracker Application")

# Configure CORS to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to SETA API", "version": "1.0"}

# --------- Pydantic Models ---------

class ExpenseBase(BaseModel):
    """Base expense model with common attributes."""
    amount: float
    date: str  # Change to str for localized date
    category_name: str
    description: Optional[str] = None

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat()  # Fallback in case date isn't converted
        }

class CreateExpense(ExpenseBase):
    """Model for validating expense creation requests."""
    user_id: int
    date: date  # Keep as date for input validation

class ExpenseResponse(ExpenseBase):
    """Response model for expenses."""
    id: int
    user_id: int
    created_at: str  # Change to str for localized datetime
    updated_at: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
        }

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
    last_login: Optional[str] = None  # Change to str for localized datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

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

def format_localized_date(dt, language: str, format: str = "medium"):
    """Format a date or datetime object based on the user's language."""
    if dt is None:
        return None
    locale = Locale.parse(language)
    if isinstance(dt, datetime):
        return format_datetime(dt, format=format, locale=locale)
    return format_date(dt, format=format, locale=locale)

# --------- Dependency to Extract Language ---------

async def get_user_language(accept_language: Optional[str] = Header(default="en")):
    """Extract the user's language from the Accept-Language header."""
    # Map frontend language codes to Babel locale codes
    language_map = {
        "en": "en_US",
        "zh": "zh_CN",
    }
    # Default to English if language not supported
    return language_map.get(accept_language, "en_US")

# --------- User Authentication Endpoints ---------

@app.post("/login", response_model=UserResponse)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
    """Login a user and return user information."""
    user = get_user_by_username(db, user_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )

    elif not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    user.last_login = func.now()
    db.commit()

    # Localize the last_login field
    user_dict = user.__dict__.copy()
    user_dict["last_login"] = format_localized_date(user.last_login, language)
    return user_dict

@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
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

    # Localize the last_login field
    user_dict = db_user.__dict__.copy()
    user_dict["last_login"] = format_localized_date(db_user.last_login, language)
    return user_dict

# --------- Expense Endpoints ---------

@app.get("/expenses/{user_id}", response_model=List[ExpenseResponse])
async def get_user_expenses(user_id: int, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
    """Get all expenses for a user."""
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    # Localize dates in each expense
    return [
        {
            **expense.__dict__,
            "date": format_localized_date(expense.date, language),
            "created_at": format_localized_date(expense.created_at, language),
            "updated_at": format_localized_date(expense.updated_at, language),
        }
        for expense in expenses
    ]

@app.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense_data: CreateExpense, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
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

    # Localize dates
    expense_dict = db_expense.__dict__.copy()
    expense_dict["date"] = format_localized_date(db_expense.date, language)
    expense_dict["created_at"] = format_localized_date(db_expense.created_at, language)
    expense_dict["updated_at"] = format_localized_date(db_expense.updated_at, language)
    return expense_dict

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
    """Delete multiple expenses by their IDs."""
    expenses_to_delete = db.query(models.Expense).filter(models.Expense.id.in_(request.expense_ids)).all()
    if not expenses_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No expenses found to delete")
    if len(expenses_to_delete) != len(request.expense_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Some expenses not found")
    for expense in expenses_to_delete:
        db.delete(expense)
    db.commit()
    return None

@app.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense_data: CreateExpense, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
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

    # Localize dates
    expense_dict = expense.__dict__.copy()
    expense_dict["date"] = format_localized_date(expense.date, language)
    expense_dict["created_at"] = format_localized_date(expense.created_at, language)
    expense_dict["updated_at"] = format_localized_date(expense.updated_at, language)
    return expense_dict

@app.get("/expenses/{user_id}/report")
async def generate_expense_report(user_id: int, format: str = "json", db: Session = Depends(get_db), language: str = Depends(get_user_language)):
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

    # Localize dates in the expense data
    expense_data = [{
        "date": format_localized_date(exp.date, language),
        "category_name": exp.category_name,
        "amount": float(exp.amount),
        "description": exp.description,
        "created_at": format_localized_date(exp.created_at, language)
    } for exp in expenses]

    if format.lower() == "json":
        return {
            "expenses": expense_data,
            "summary": {
                "total_amount": total_amount,
                "expense_count": expense_count,
                "generated_at": format_localized_date(datetime.now(), language),
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
        c.drawString(30, height - 80, f"Generated: {format_localized_date(datetime.now(), language)}")

        y = height - 120
        c.drawString(30, y, "Date    Category    Amount    Description    Created At")
        y -= 20

        for exp in expense_data:
            if y < 50:  # New page if near bottom
                c.showPage()
                y = height - 40
            line = f"{exp['date']}  {exp['category_name']}  ${exp['amount']}  {exp['description'] or '-'}  {exp['created_at']}"
            c.drawString(30, y, line[:100])  # Truncate if too long
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
async def get_user_profile(user_id: int, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
    """Get user profile."""
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user_dict = user.__dict__.copy()
    user_dict["last_login"] = format_localized_date(user.last_login, language)
    return user_dict

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), language: str = Depends(get_user_language)):
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

    user_dict = user.__dict__.copy()
    user_dict["last_login"] = format_localized_date(user.last_login, language)
    return user_dict

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
