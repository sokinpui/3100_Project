from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Numeric, Date, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

# Database connection string (URL) to connect to your PostgreSQL database hosted on Supabase
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL = "postgresql://postgres.wuakwojmykjicsgwcwgr:postgres123.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Create a SQLAlchemy engine instance which manages connections to the database
engine = create_engine(DATABASE_URL)

# Create a base class for declarative class definitions
# This is the foundation for defining SQLAlchemy ORM models
Base = declarative_base()


# Create all tables in the database that don't yet exist
# This runs CREATE TABLE statements for all models defined above
Base.metadata.create_all(bind=engine)

# Create a session factory which will be used to create database sessions
# Sessions are used to interact with the database (add, query, update, delete)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Expense(Base):
    """
    Expense model representing the 'expenses' table in the database.
    Each attribute maps to a column in the table.
    """
    __tablename__ = "expenses"  # Name of the table in the database

    # Primary key column with auto-increment
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to link expenses to a user (not enforced at database level here)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Expense amount stored as a Numeric type (for precise decimal values)
    amount = Column(Numeric)

    # Date of the expense
    date = Column(Date)

    # Category of the expense (e.g., 'Food', 'Transport', etc.)
    category_name = Column(String)

    # Additional details about the expense
    description = Column(String)

    # server_default=func.now() sets the creation time automatically
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # onupdate=func.now() updates this timestamp whenever the record is modified
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Optional: Create a relationship to allow easy access to the user object
    user = relationship("User", back_populates="expenses")

class User(Base):
    """
    User model representing the 'users' table in the database.
    Stores user authentication and profile information.
    """
    __tablename__ = "users"

    # Primary key with auto-increment
    id = Column(Integer, primary_key=True, index=True)

    # Unique username for authentication, indexed for fast lookups
    username = Column(String, unique=True, index=True)

    # Unique email address, indexed for fast lookups
    email = Column(String, unique=True, index=True)
    
    # Stored password hash (not the actual password)
    password_hash = Column(String, nullable=False)
    
    # Optional user profile information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)

    # Flag to mark if user account is active
    is_active = Column(Boolean, default=True)
    # Flag to track if email has been verified
    email_verified = Column(Boolean, default=False)
    # Timestamp of last user login
    last_login = Column(DateTime(timezone=True), nullable=True)     # True for now, will change to False after frontend is developed

    # Optional: Create a relationship to allow easy access to user's expenses
    expenses = relationship("Expense", back_populates="user", cascade="all, delete")

def get_db():
    """
    Dependency function for FastAPI to get a database session.
    Creates a new session for each request and closes it when done.
    
    Yields:
        Session: A SQLAlchemy session object for database operations
    """
    db = SessionLocal()
    try:
        yield db  # The session is used in the FastAPI route handler
    finally:
        db.close()  # Ensures the session is closed even if exceptions occur