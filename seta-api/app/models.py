# app/models.py
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Numeric,
    Date,
    ForeignKey,
    Interval,
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import (
    declarative_base,
)  # Use this if you are on older SQLAlchemy, otherwise use DeclarativeBase

# from sqlalchemy.orm import DeclarativeBase # Use this for modern SQLAlchemy
from sqlalchemy.sql import func
import datetime
import enum

# Database connection string
DATABASE_URL = "postgresql://postgres.wuakwojmykjicsgwcwgr:postgres123.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Create engine
engine = create_engine(DATABASE_URL)

# Create base class (adjust import based on your SQLAlchemy version)
# class Base(DeclarativeBase): # Modern SQLAlchemy
#     pass
Base = declarative_base()  # Older SQLAlchemy


# --- New Enum for Frequency ---
class FrequencyEnum(enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"
    one_time = "one_time"


# --- Define Models (Expense, Income, RecurringExpense, Budget, Goal, Account, User) ---
# (Keep all your model definitions exactly as they were in the previous step)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(Numeric)
    date = Column(Date)
    category_name = Column(String)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    account_id = Column(
        Integer, ForeignKey("accounts.id"), nullable=True
    )  # Added account link
    # Relationships defined below after all classes are defined


class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    amount = Column(Numeric, nullable=False)
    date = Column(Date, nullable=False)
    source = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    account_id = Column(
        Integer, ForeignKey("accounts.id"), nullable=True
    )  # Added account link
    # Relationships defined below


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String, nullable=False)
    amount = Column(Numeric, nullable=False)
    category_name = Column(String, nullable=False)
    frequency = Column(SQLAlchemyEnum(FrequencyEnum), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    account_id = Column(
        Integer, ForeignKey("accounts.id"), nullable=True
    )  # Added account link
    # Relationships defined below


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_name = Column(String, nullable=False)
    amount_limit = Column(Numeric, nullable=False)
    period = Column(SQLAlchemyEnum(FrequencyEnum), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships defined below


class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String, nullable=False)
    target_amount = Column(Numeric, nullable=False)
    current_amount = Column(Numeric, default=0.0)
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships defined below


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)
    starting_balance = Column(Numeric, default=0.0)
    balance_date = Column(Date, nullable=False)
    currency = Column(String, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships defined below


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)

    # Unique username for authentication, indexed for fast lookups
    username = Column(
        String, unique=True, index=True, nullable=False
    )  # Added nullable=False for clarity

    # Unique email address, indexed for fast lookups
    email = Column(
        String, unique=True, index=True, nullable=False
    )  # Added nullable=False for clarity

    # Stored password hash (not the actual password)
    password_hash = Column(String, nullable=False)

    # Optional user profile information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)

    # Flag to mark if user account is active - default to False until verified
    is_active = Column(Boolean, default=False)
    # Flag to track if email has been verified
    email_verified = Column(Boolean, default=False)
    # Store the verification token, unique and nullable
    verification_token = Column(String, unique=True, index=True, nullable=True)
    # Timestamp of last user login
    last_login = Column(DateTime(timezone=True), nullable=True)
    # Add these two columns for password reset
    password_reset_token = Column(String, unique=True, index=True, nullable=True)
    password_reset_token_expiry = Column(DateTime(timezone=True), nullable=True)

    licence_key = Column(
        String, nullable=True, index=True
    )  # Placeholder for licence key


# --- Define Relationships After All Classes ---
User.expenses = relationship(
    "Expense", order_by=Expense.id, back_populates="user", cascade="all, delete"
)
User.income = relationship(
    "Income", order_by=Income.id, back_populates="user", cascade="all, delete"
)
User.recurring_expenses = relationship(
    "RecurringExpense",
    order_by=RecurringExpense.id,
    back_populates="user",
    cascade="all, delete",
)
User.budgets = relationship(
    "Budget", order_by=Budget.id, back_populates="user", cascade="all, delete"
)
User.goals = relationship(
    "Goal", order_by=Goal.id, back_populates="user", cascade="all, delete"
)
User.accounts = relationship(
    "Account", order_by=Account.id, back_populates="user", cascade="all, delete"
)

Expense.user = relationship("User", back_populates="expenses")
Expense.account = relationship("Account", back_populates="expenses")

Income.user = relationship("User", back_populates="income")
Income.account = relationship("Account", back_populates="income")

RecurringExpense.user = relationship("User", back_populates="recurring_expenses")
# Note: RecurringExpense doesn't directly back-populate to Account in this simple model

Budget.user = relationship("User", back_populates="budgets")

Goal.user = relationship("User", back_populates="goals")

Account.user = relationship("User", back_populates="accounts")
Account.expenses = relationship(
    "Expense", order_by=Expense.date, back_populates="account"
)
Account.income = relationship("Income", order_by=Income.date, back_populates="account")
# --- End Relationships ---


# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Create Tables ---
# This line should be executed to create the tables in the database
# Run `python app/models.py` from your terminal after defining models
# if __name__ == "__main__":
#     print("Creating database tables...")
#     Base.metadata.create_all(bind=engine)
#     print("Tables created (if they didn't exist).")
