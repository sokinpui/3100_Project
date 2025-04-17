from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
import models
from datetime import date, datetime, timedelta, timezone  # Add timezone here
# from models import get_db, User, Expense
from models import get_db, User, Expense, Income, RecurringExpense, Budget, Goal, Account, FrequencyEnum
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
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
import os  # Ideally use environment variables
import logging

# Configure basic logging (optional but good practice)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Email Configuration ---
# WARNING: Hardcoding credentials is insecure. Use environment variables in production.
conf = ConnectionConfig(
    MAIL_USERNAME="csci3100setaproject@gmail.com",  # os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD="xltj rskt qgxb idsx ",  # os.getenv("MAIL_PASSWORD") # NOTE: Added '.' as per user prompt
    MAIL_FROM="csci3100setaproject@gmail.com",  # os.getenv("MAIL_FROM") # Just use the string directly
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fm = FastMail(conf)

# --- Base URLs ---
API_BASE_URL = "http://localhost:8000"  # Backend URL (used in emails if needed)
# !!! IMPORTANT: Set this to your React app's URL !!!
FRONTEND_BASE_URL = "http://localhost:3000"  # Or your frontend's actual URL

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

class RecurringExpenseCreate(RecurringExpenseBase):
    user_id: int

class BudgetCreate(BudgetBase):
    user_id: int

class GoalCreate(GoalBase):
    user_id: int

class SignupResponse(BaseModel):
    """Response model for signup."""
    message: str
    user: UserResponse

class RequestPasswordResetPayload(BaseModel):
    """Payload expected when requesting a password reset."""
    email: EmailStr

class ResetPasswordPayload(BaseModel):
    """Payload expected when resetting the password using a token."""
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('new_password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
class AccountCreate(AccountBase):
    user_id: int

class BulkIncomeDeleteRequest(BaseModel):
    """Model for bulk income delete requests."""
    income_ids: List[int]

class BulkRecurringDeleteRequest(BaseModel):
    """Model for bulk recurring expense delete requests."""
    recurring_ids: List[int]

class BulkBudgetDeleteRequest(BaseModel):
    """Model for bulk budget delete requests."""
    budget_ids: List[int]

class BulkGoalDeleteRequest(BaseModel):
    """Model for bulk goal delete requests."""
    goal_ids: List[int]

class BulkAccountDeleteRequest(BaseModel):
    """Model for bulk account delete requests."""
    account_ids: List[int]

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

async def send_verification_email(email_to: str, username: str, token: str):
    """Sends the verification email."""
    verification_link = f"{API_BASE_URL}/verify-email/{token}"
    html_content = f"""
    <html>
        <body>
            <h1>Welcome to SETA, {username}!</h1>
            <p>Thank you for signing up. Please click the link below to activate your account:</p>
            <a href="{verification_link}">Activate Account</a>
            <p>If you did not sign up for this account, you can ignore this email.</p>
        </body>
    </html>
    """
    message = MessageSchema(
        subject="SETA Account Activation",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )
    try:
        await fm.send_message(message)
        logger.info(f"Verification email sent to {email_to}")
    except Exception as e:
        logger.error(f"Error sending verification email to {email_to}: {e}", exc_info=True)

async def send_password_reset_email(email_to: str, username: str, token: str):
    """Sends the password reset email."""
    reset_link = f"{FRONTEND_BASE_URL}/reset-password/{token}"
    html_content = f"""
    <html>
        <body>
            <h1>SETA Password Reset Request</h1>
            <p>Hello {username},</p>
            <p>You requested a password reset. Please click the link below to set a new password:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        </body>
    </html>
    """
    message = MessageSchema(
        subject="SETA Password Reset",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )
    try:
        await fm.send_message(message)
        logger.info(f"Password reset email sent successfully to {email_to}")
    except Exception as e:
        logger.error(f"Error sending password reset email to {email_to}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to send password reset email.")

# --------- User Authentication Endpoints ---------

@app.post("/login", response_model=UserResponse)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login a user and return user information."""
    user = get_user_by_username(db, user_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incorrect username or password"
        )

    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please verify your email or contact support."
        )
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your email for the activation link."
        )

    user.last_login = func.now()
    db.commit()
    db.refresh(user)

    return user

@app.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user and send verification email."""
    if get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    password_hash = hash_password(user_data.password)
    verification_token = secrets.token_urlsafe(32)

    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        contact_number=user_data.contact_number,
        email_verified=False,
        verification_token=verification_token
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user account."
        )

    await send_verification_email(db_user.email, db_user.username, verification_token)

    return SignupResponse(
        message="Signup successful. Please check your email to activate your account.",
        user=UserResponse.model_validate(db_user)
    )

@app.get("/verify-email/{token}", status_code=status.HTTP_200_OK)
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user's email address using the provided token."""
    user = db.query(models.User).filter(models.User.verification_token == token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token."
        )

    if user.email_verified:
        return {"message": "Email already verified. You can now log in."}

    user.email_verified = True
    user.verification_token = None
    user.is_active = True
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify email."
        )

    return {"message": "Email successfully verified. You can now log in."}

@app.post("/request-password-reset", status_code=status.HTTP_200_OK)
async def request_password_reset(payload: RequestPasswordResetPayload, db: Session = Depends(get_db)):
    """Generates a password reset token and sends it via email."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user:
        logger.warning(f"Password reset requested for non-existent email: {payload.email}")
        return {"message": "If an account with this email exists, a password reset link has been sent."}

    token = secrets.token_urlsafe(32)
    # Ensure expiry time is timezone-aware (UTC) when setting it
    expiry_time = datetime.now(timezone.utc) + timedelta(hours=1)  # Use timezone.utc

    user.password_reset_token = token
    user.password_reset_token_expiry = expiry_time

    try:
        db.commit()
        await send_password_reset_email(user.email, user.username, token)
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    except HTTPException as http_exc:
        db.rollback()
        raise http_exc
    except Exception as e:
        db.rollback()
        logger.error(f"Database error during password reset request for {payload.email}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while processing the request.")

@app.post("/reset-password/{token}", status_code=status.HTTP_200_OK)
async def reset_password_with_token(token: str, payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    """Resets the user's password using a valid token."""
    user = db.query(models.User).filter(models.User.password_reset_token == token).first()

    # Compare expiry time with timezone-aware current time (UTC)
    if not user or user.password_reset_token_expiry is None or user.password_reset_token_expiry < datetime.now(timezone.utc):  # Use timezone.utc here
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    user.password_hash = hash_password(payload.new_password)
    user.password_reset_token = None
    user.password_reset_token_expiry = None

    try:
        db.commit()
        return {"message": "Password has been reset successfully. You can now log in with your new password."}
    except Exception as e:
        db.rollback()
        logger.error(f"Database error during password reset confirmation for token {token}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred while resetting the password.")

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
        logger.error(f"Error during bulk delete: {e}", exc_info=True)
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
    income_records = db.query(models.Income).filter(models.Income.user_id == user_id).order_by(models.Income.date.desc()).all() # Keep sorting
    return income_records

@app.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(income_data: IncomeCreate, db: Session = Depends(get_db)):
    """Create a new income record."""
    user = db.query(models.User).filter(models.User.id == income_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optional: Check if account_id exists if provided
    if income_data.account_id:
        account = db.query(models.Account).filter(models.Account.id == income_data.account_id, models.Account.user_id == income_data.user_id).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Account with id {income_data.account_id} not found for this user.")

    # Use model_dump for Pydantic v2+
    try:
        create_data = income_data.model_dump(exclude={'user_id'})
    except AttributeError:
        create_data = income_data.dict(exclude={'user_id'}) # Fallback for Pydantic v1

    db_income = models.Income(user_id=income_data.user_id, **create_data)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@app.delete("/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(income_id: int, db: Session = Depends(get_db)):
    """Delete an income record."""
    income_record = db.query(models.Income).filter(models.Income.id == income_id).first()
    if not income_record:
        raise HTTPException(status_code=404, detail="Income record not found")

    # Optional: Add check if user owns this income record before deleting

    db.delete(income_record)
    db.commit()
    return None

# --- ADD THIS NEW ENDPOINT ---
@app.post("/income/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_income(request: BulkIncomeDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple income records by their IDs efficiently."""
    if not request.income_ids:
        return None # Nothing to delete

    try:
        # Perform the bulk delete operation
        deleted_count = db.query(models.Income).filter(models.Income.id.in_(request.income_ids)).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Bulk deleted {deleted_count} income records.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk income delete: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete income records due to a database error."
        )
    # Optional: Check if deleted_count matches len(request.income_ids) if needed

    return None # Return 204 No Content on success

# --------- New Recurring Expense Endpoints ---------

@app.get("/recurring/{user_id}", response_model=List[RecurringExpenseResponse])
async def get_user_recurring_expenses(user_id: int, db: Session = Depends(get_db)):
    """Get all recurring expense rules for a user."""
    recurring = db.query(models.RecurringExpense).filter(
        models.RecurringExpense.user_id == user_id
    ).order_by(
        models.RecurringExpense.start_date.desc() # Keep sorting
    ).all()
    return recurring

@app.post("/recurring", response_model=RecurringExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_expense(rec_data: RecurringExpenseCreate, db: Session = Depends(get_db)):
    """Create a new recurring expense rule."""
    user = db.query(models.User).filter(models.User.id == rec_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optional: Check if account_id exists if provided
    if rec_data.account_id:
        account = db.query(models.Account).filter(models.Account.id == rec_data.account_id, models.Account.user_id == rec_data.user_id).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Account with id {rec_data.account_id} not found for this user.")

    # Validate frequency enum
    if not isinstance(rec_data.frequency, FrequencyEnum):
         raise HTTPException(status_code=400, detail=f"Invalid frequency value: {rec_data.frequency}")

    # Use model_dump for Pydantic v2+
    try:
        create_data = rec_data.model_dump(exclude={'user_id'})
    except AttributeError:
        create_data = rec_data.dict(exclude={'user_id'}) # Fallback

    db_rec = models.RecurringExpense(user_id=rec_data.user_id, **create_data)
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    return db_rec

@app.delete("/recurring/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_expense(recurring_id: int, db: Session = Depends(get_db)):
    """Delete a recurring expense rule."""
    rec_expense = db.query(models.RecurringExpense).filter(models.RecurringExpense.id == recurring_id).first()
    if not rec_expense:
        raise HTTPException(status_code=404, detail="Recurring expense rule not found")

    # Optional: Add check if user owns this rule

    db.delete(rec_expense)
    db.commit()
    return None

# --- ADD THIS NEW ENDPOINT ---
@app.post("/recurring/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_recurring(request: BulkRecurringDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple recurring expense rules by their IDs efficiently."""
    if not request.recurring_ids:
        return None # Nothing to delete

    try:
        # Perform the bulk delete operation
        deleted_count = db.query(models.RecurringExpense).filter(models.RecurringExpense.id.in_(request.recurring_ids)).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Bulk deleted {deleted_count} recurring expense rules.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk recurring delete: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete recurring rules due to a database error."
        )

    return None # Return 204 No Content on success

# --------- New Budget Endpoints ---------

@app.get("/budgets/{user_id}", response_model=List[BudgetResponse])
async def get_user_budgets(user_id: int, db: Session = Depends(get_db)):
    """Get all budget rules for a user."""
    budgets = db.query(models.Budget).filter(models.Budget.user_id == user_id).order_by(models.Budget.category_name).all()
    return budgets

@app.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(budget_data: BudgetCreate, db: Session = Depends(get_db)):
    """Create a new budget rule."""
    user = db.query(models.User).filter(models.User.id == budget_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Use model_dump for Pydantic v2+
    try:
        create_data = budget_data.model_dump(exclude={'user_id'})
    except AttributeError:
        create_data = budget_data.dict(exclude={'user_id'}) # Fallback

    db_budget = models.Budget(user_id=budget_data.user_id, **create_data)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@app.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    """Delete a budget rule."""
    budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget rule not found")
    # Optional: Check user ownership
    db.delete(budget)
    db.commit()
    return None

# --- ADD THIS NEW ENDPOINT ---
@app.post("/budgets/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_budgets(request: BulkBudgetDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple budget rules by their IDs efficiently."""
    if not request.budget_ids:
        return None # Nothing to delete

    try:
        # Perform the bulk delete operation
        deleted_count = db.query(models.Budget).filter(models.Budget.id.in_(request.budget_ids)).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Bulk deleted {deleted_count} budget rules.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk budget delete: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete budget rules due to a database error."
        )

    return None # Return 204 No Content on success

# --------- New Goal Endpoints ---------

@app.get("/goals/{user_id}", response_model=List[GoalResponse])
async def get_user_goals(user_id: int, db: Session = Depends(get_db)):
    """Get all financial goals for a user."""
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).order_by(models.Goal.target_date.asc().nulls_last(), models.Goal.name).all() # Keep sorting
    return goals

@app.post("/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(goal_data: GoalCreate, db: Session = Depends(get_db)):
    """Create a new financial goal."""
    user = db.query(models.User).filter(models.User.id == goal_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Use model_dump for Pydantic v2+
    try:
        create_data = goal_data.model_dump(exclude={'user_id'})
    except AttributeError:
        create_data = goal_data.dict(exclude={'user_id'}) # Fallback

    db_goal = models.Goal(user_id=goal_data.user_id, **create_data)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a financial goal."""
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    # Optional: Check user ownership
    db.delete(goal)
    db.commit()
    return None

# --- ADD THIS NEW ENDPOINT ---
@app.post("/goals/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_goals(request: BulkGoalDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple financial goals by their IDs efficiently."""
    if not request.goal_ids:
        return None # Nothing to delete

    try:
        # Perform the bulk delete operation
        deleted_count = db.query(models.Goal).filter(models.Goal.id.in_(request.goal_ids)).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Bulk deleted {deleted_count} goals.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk goal delete: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete goals due to a database error."
        )

    return None # Return 204 No Content on success

# --------- New Account Endpoints ---------

@app.get("/accounts/{user_id}", response_model=List[AccountResponse])
async def get_user_accounts(user_id: int, db: Session = Depends(get_db)):
    """Get all accounts for a user."""
    accounts = db.query(models.Account).filter(models.Account.user_id == user_id).all()
    return accounts

@app.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(account_data: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account for a user."""
    user = db.query(models.User).filter(models.User.id == account_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not account_data.balance_date:
         raise HTTPException(status_code=400, detail="Balance date is required")

    try:
        # Use model_dump for Pydantic v2
        create_data = account_data.model_dump(exclude={'user_id'})
    except AttributeError:
        # Fallback for Pydantic v1
        create_data = account_data.dict(exclude={'user_id'})

    db_account = models.Account(user_id=account_data.user_id, **create_data)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

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

# --- ADD THIS NEW ENDPOINT ---
@app.post("/accounts/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bulk_accounts(request: BulkAccountDeleteRequest, db: Session = Depends(get_db)):
    """Delete multiple accounts by their IDs efficiently."""
    if not request.account_ids:
        return None # Nothing to delete

    # --- IMPORTANT: Check for related data before deleting ---
    # Check if any expenses, income, or recurring items are linked to these accounts
    related_expenses = db.query(models.Expense.id).filter(models.Expense.account_id.in_(request.account_ids)).limit(1).first()
    related_income = db.query(models.Income.id).filter(models.Income.account_id.in_(request.account_ids)).limit(1).first()
    related_recurring = db.query(models.RecurringExpense.id).filter(models.RecurringExpense.account_id.in_(request.account_ids)).limit(1).first()

    if related_expenses or related_income or related_recurring:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # 409 Conflict is appropriate here
            detail="Cannot delete account(s) because they are linked to existing expenses, income, or recurring transactions. Please reassign or delete those first."
        )
    # --- End related data check ---

    try:
        # Perform the bulk delete operation
        deleted_count = db.query(models.Account).filter(models.Account.id.in_(request.account_ids)).delete(synchronize_session=False)
        db.commit()
        logger.info(f"Bulk deleted {deleted_count} accounts.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during bulk account delete: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete accounts due to a database error."
        )

    return None # Return 204 No Content on success

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
async def change_user_password_with_current(user_id: int, password_data: PasswordChange, db: Session = Depends(get_db)):
    """Change user password *if* they provide the current password."""
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
