# seta-api/app/config_manager.py
import json
import os
import sys
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Determine the base path based on whether the app is frozen (packaged by PyInstaller)
if getattr(sys, 'frozen', False):
    # If the application is run as a bundle, the PyInstaller bootloader
    # extends the sys module by a flag frozen=True and sets the app
    # path into variable _MEIPASS'.
    application_path = Path(sys._MEIPASS) # type: ignore
else:
    # application_path = os.path.dirname(os.path.abspath(__file__))
    # Go up two levels from config_manager.py (app/ -> seta-api/)
    application_path = Path(__file__).resolve().parent.parent


# --- Get User Data Path ---
# Priority: Environment variable (set by Electron) > Fallback (less reliable in packaged app)
USER_DATA_PATH_STR = os.environ.get('SETA_USER_DATA_PATH')

if USER_DATA_PATH_STR:
    USER_DATA_PATH = Path(USER_DATA_PATH_STR)
else:
    # Fallback: Use a path relative to the executable/script - less ideal for user data
    # This might end up inside Program Files on Windows if not careful
    logger.warning("SETA_USER_DATA_PATH environment variable not set. Falling back to relative path.")
    # Place it alongside the executable/script directory - adjust if needed
    if getattr(sys, 'frozen', False):
         executable_dir = Path(sys.executable).parent
    else:
         executable_dir = application_path # Or Path.cwd()
    USER_DATA_PATH = executable_dir / "seta_user_data"

CONFIG_FILE_PATH = USER_DATA_PATH / "seta_config.json"
LOCAL_DB_PATH = USER_DATA_PATH / "seta_local.db" # Define local DB path

# Ensure user data directory exists
try:
    USER_DATA_PATH.mkdir(parents=True, exist_ok=True)
    logger.info(f"User data directory ensured at: {USER_DATA_PATH}")
except Exception as e:
    logger.error(f"Failed to create user data directory at {USER_DATA_PATH}: {e}", exc_info=True)
    # Handle this critical error appropriately, maybe exit or use a default in-memory DB

# --- Default Cloud URL (from environment or hardcoded fallback) ---
DEFAULT_CLOUD_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.wuakwojmykjicsgwcwgr:postgres123.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres")
LOCAL_SQLITE_URL = f"sqlite:///{LOCAL_DB_PATH.as_posix()}" # Use as_posix() for cross-platform path


DEFAULT_CONFIG = {
    "database": {
        "type": "local", # Default to local for desktop app
        "url": None
    }
}

def load_config():
    """Loads the configuration from the JSON file."""
    if not CONFIG_FILE_PATH.exists():
        logger.warning(f"Config file not found at {CONFIG_FILE_PATH}. Creating default.")
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE_PATH, 'r') as f:
            config = json.load(f)
            # Basic validation/migration if needed in future
            if "database" not in config or "type" not in config["database"]:
                logger.warning("Invalid config structure found. Resetting to default.")
                save_config(DEFAULT_CONFIG)
                return DEFAULT_CONFIG
            return config
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error loading config file {CONFIG_FILE_PATH}: {e}. Using default.", exc_info=True)
        return DEFAULT_CONFIG # Return default on error

def save_config(config_data):
    """Saves the configuration to the JSON file."""
    try:
        with open(CONFIG_FILE_PATH, 'w') as f:
            json.dump(config_data, f, indent=2)
        logger.info(f"Configuration saved to {CONFIG_FILE_PATH}")
    except IOError as e:
        logger.error(f"Error saving config file {CONFIG_FILE_PATH}: {e}", exc_info=True)

def get_database_url():
    """Determines the correct DATABASE_URL based on the config."""
    config = load_config()
    db_config = config.get("database", DEFAULT_CONFIG["database"])
    db_type = db_config.get("type", "local")

    if db_type == "cloud":
        logger.info("Using Cloud Database URL.")
        return DEFAULT_CLOUD_DATABASE_URL
    elif db_type == "custom":
        custom_url = db_config.get("url")
        if custom_url:
            logger.info(f"Using Custom Database URL: {custom_url[:10]}...") # Log prefix only
            return custom_url
        else:
            logger.warning("Custom database type selected but no URL provided. Falling back to Local.")
            # Fall through to local
    # Default to local if type is 'local' or custom URL is missing
    logger.info(f"Using Local SQLite Database: {LOCAL_DB_PATH}")
    return LOCAL_SQLITE_URL

def update_database_config(db_type: str, custom_url: Optional[str] = None):
    """Updates the database configuration in the file."""
    if db_type not in ["local", "cloud", "custom"]:
        raise ValueError("Invalid database type specified.")
    if db_type == "custom" and not custom_url:
         raise ValueError("Custom URL must be provided for 'custom' database type.")

    config = load_config()
    config["database"] = {
        "type": db_type,
        "url": custom_url if db_type == "custom" else None
    }
    save_config(config)
    return config["database"] # Return the saved config part

def is_local_db_configured():
    """Checks if the current configuration points to the local SQLite DB."""
    config = load_config()
    return config.get("database", {}).get("type") == "local"

def get_local_db_path():
    """Returns the path to the local SQLite database file."""
    return LOCAL_DB_PATH
