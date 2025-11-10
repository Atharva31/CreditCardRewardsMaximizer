"""
Database Migration Setup using Alembic
Run this script to initialize Alembic for database migrations
"""

import os
import subprocess


def setup_alembic():
    """Initialize Alembic for database migrations"""
    
    print("🚀 Setting up Alembic for database migrations...")
    
    # Initialize Alembic
    print("\n📦 Initializing Alembic...")
    subprocess.run(["alembic", "init", "alembic"], check=True)
    
    print("\n✅ Alembic initialized!")
    print("\n📝 Next steps:")
    print("1. Update alembic.ini with your database URL")
    print("2. Update alembic/env.py to import your models")
    print("3. Create your first migration: alembic revision --autogenerate -m 'Initial migration'")
    print("4. Apply migration: alembic upgrade head")


def create_alembic_env():
    """Create custom alembic/env.py with our models"""
    
    env_content = '''"""
Alembic Environment Configuration
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add parent directory to path to import models
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import models and Base
from models import Base
from database import DatabaseConfig

# this is the Alembic Config object
config = context.config

# Set database URL from environment
db_config = DatabaseConfig()
config.set_main_option("sqlalchemy.url", db_config.DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
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
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
'''
    
    # Create alembic directory if it doesn't exist
    os.makedirs("alembic", exist_ok=True)
    
    # Write env.py
    with open("alembic/env.py", "w") as f:
        f.write(env_content)
    
    print("✅ Created custom alembic/env.py")


if __name__ == "__main__":
    setup_alembic()
    create_alembic_env()
