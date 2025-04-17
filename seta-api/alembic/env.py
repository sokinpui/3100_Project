# alembic/env.py

from logging.config import fileConfig
import os # Add os import
import sys # Add sys import

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- Add this section to import your models ---
# Construct the path to your project's root directory (assuming alembic/ is in the root)
# Adjust the number of '..' if your alembic directory is nested differently
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now import your Base object from your models file
from app.models import Base # Adjust 'app.models' if your models file is elsewhere

# --- End of added section ---


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line reads the section named [loggers] from alembic.ini file.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# --- Modify this line ---
target_metadata = Base.metadata # Use the imported Base.metadata
# --- End of modification ---

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    # ... (rest of the offline function remains the same) ...
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    # ... (rest of the online function remains the same) ...
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
