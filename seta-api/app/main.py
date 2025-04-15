from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
import models
from models import get_db, User, Expense
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
import hashlib
import secrets
import string

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
    allow_origins=["*"],  # React dev server
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
    db.refresh(user) # Refresh to get updated last_login if needed by response

    # Pydantic will now correctly serialize the 'user' ORM object
    # into a UserResponse model because from_attributes=True is set.
    return user # No need for UserResponse.from_orm(user) explicitly here

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

    # Pydantic will correctly serialize db_user here too
    return db_user


# --------- Expense Endpoints ---------

@app.get("/expenses/{user_id}", response_model=List[ExpenseResponse])
async def get_user_expenses(user_id: int, db: Session = Depends(get_db)):
    """Get all expenses for a user."""
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    # Pydantic will correctly serialize the list of ORM objects
    # because ExpenseResponse has from_attributes=True
    return expenses # No need for list comprehension with .from_orm()

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
        # Handle empty list case if necessary, maybe return early or raise 400
        return None # Or raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No expense IDs provided")

    # Construct the delete query directly
    delete_query = db.query(models.Expense).filter(models.Expense.id.in_(request.expense_ids))

    # Execute the bulk delete operation
    # synchronize_session=False is generally faster for bulk deletes.
    # It tells SQLAlchemy not to try and reconcile the session state with the deleted rows.
    # Use 'fetch' if you need to access attributes of deleted objects *after* delete,
    # or None/False if you don't. False is usually the most performant.
    try:
        deleted_count = delete_query.delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback() # Rollback on error
        print(f"Error during bulk delete: {e}") # Log the error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete expenses due to a database error."
        )

    # Optional: Check if the number of deleted rows matches the input count
    # This might be useful for verification but adds complexity if partial success is okay
    # if deleted_count != len(request.expense_ids):
    #     print(f"Warning: Expected to delete {len(request.expense_ids)} expenses, but deleted {deleted_count}.")
        # Decide how to handle this: maybe log, maybe raise a specific error if needed.
        # For now, we'll assume success if no exception occurred.

    return None # Return 204 No Content on success

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

