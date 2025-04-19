# app/config_manager.py
import json
from pathlib import Path
import logging
import os

logger = logging.getLogger(__name__)

# --- Configuration Constants ---
CONFIG_FILE_NAME = "db_config.json"
# Place config file in the main project directory (one level up from 'app')
CONFIG_FILE_PATH = Path(__file__).resolve().parent.parent / CONFIG_FILE_NAME

DEFAULT_LOCAL_DB_NAME = "seta_local.db"
# Place the local DB file also in the main project directory
DEFAULT_LOCAL_DB_PATH = Path(__file__).resolve().parent.parent / DEFAULT_LOCAL_DB_NAME
DEFAULT_LOCAL_DB_URL = f"sqlite:///{DEFAULT_LOCAL_DB_PATH.as_posix()}" # Use as_posix() for cross-platform compatibility

# Default cloud URL (can be overridden by environment variable if needed)
DEFAULT_CLOUD_DB_URL = os.getenv(
    "DATABASE_URL_CLOUD", # Allow override via env var
    "postgresql://postgres.wuakwojmykjicsgwcwgr:postgres123.@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
)

DEFAULT_CONFIG = {
    "db_type": "cloud",  # Default to cloud
    "db_url": DEFAULT_CLOUD_DB_URL
}

# --- Helper Functions ---

def _load_config() -> dict:
    """Loads configuration from the JSON file."""
    if not CONFIG_FILE_PATH.exists():
        logger.warning(f"Config file '{CONFIG_FILE_PATH}' not found. Creating default config.")
        _save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE_PATH, 'r') as f:
            config = json.load(f)
            # Basic validation
            if "db_type" not in config or config["db_type"] not in ["local", "cloud", "custom"]:
                 logger.error(f"Invalid 'db_type' in config file. Using default.")
                 return DEFAULT_CONFIG
            return config
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error reading config file '{CONFIG_FILE_PATH}': {e}. Using default config.", exc_info=True)
        return DEFAULT_CONFIG

def _save_config(config: dict):
    """Saves configuration to the JSON file."""
    try:
        with open(CONFIG_FILE_PATH, 'w') as f:
            json.dump(config, f, indent=4)
        logger.info(f"Configuration saved to '{CONFIG_FILE_PATH}'")
    except IOError as e:
        logger.error(f"Error writing config file '{CONFIG_FILE_PATH}': {e}", exc_info=True)

# --- Public Functions ---

def get_database_url() -> str:
    """Gets the database URL based on the current configuration."""
    config = _load_config()
    db_type = config.get("db_type", "cloud") # Default to cloud if missing

    if db_type == "local":
        logger.info(f"Using local SQLite database: {DEFAULT_LOCAL_DB_URL}")
        return DEFAULT_LOCAL_DB_URL
    elif db_type == "cloud":
        cloud_url = config.get("db_url", DEFAULT_CLOUD_DB_URL) # Get URL from config or default
        logger.info(f"Using cloud database: {cloud_url[:cloud_url.find('@')]}...") # Log safely
        return cloud_url
    elif db_type == "custom":
        custom_url = config.get("db_url")
        if not custom_url:
            logger.error("Database type is 'custom' but no 'db_url' provided in config. Falling back to cloud.")
            return DEFAULT_CLOUD_DB_URL
        logger.info(f"Using custom database: {custom_url[:custom_url.find('@')]}...") # Log safely
        return custom_url
    else:
        logger.warning(f"Unknown db_type '{db_type}' in config. Falling back to cloud.")
        return DEFAULT_CLOUD_DB_URL

def is_local_db_configured() -> bool:
    """Checks if the configuration is set to use the local database."""
    config = _load_config()
    return config.get("db_type") == "local"

def get_local_db_path() -> Path:
    """Returns the Path object for the configured local database file."""
    # For simplicity, we always use the default path, but you could make this configurable too
    return DEFAULT_LOCAL_DB_PATH

def update_database_config(db_type: str, db_url: str | None = None) -> dict:
    """Updates the database configuration file."""
    if db_type not in ["local", "cloud", "custom"]:
        raise ValueError("Invalid db_type. Must be 'local', 'cloud', or 'custom'.")

    if db_type == "custom" and not db_url:
        raise ValueError("db_url must be provided when db_type is 'custom'.")

    new_config = {"db_type": db_type}

    if db_type == "local":
        # No specific URL needed in config for local, we derive it
        pass
    elif db_type == "cloud":
        # Store the default cloud URL or the one provided (if any)
        new_config["db_url"] = db_url if db_url else DEFAULT_CLOUD_DB_URL
    elif db_type == "custom":
        new_config["db_url"] = db_url # Store the provided custom URL

    _save_config(new_config)
    return new_config

# Example of how to initialize if needed (optional)
# if __name__ == "__main__":
#     print(f"Default config file path: {CONFIG_FILE_PATH}")
#     print(f"Default local DB path: {DEFAULT_LOCAL_DB_PATH}")
#     print(f"Current DB URL: {get_database_url()}")
#     # Uncomment to force creation of default config if it doesn't exist
#     # _load_config()
