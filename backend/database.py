"""
Database Configuration and Connection Management
Handles PostgreSQL connection pooling and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import os
from typing import Generator

from models import Base


class DatabaseConfig:
    """Database configuration settings"""
    
    def __init__(self):
        # Get database URL from environment variable
        self.DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:password@localhost:5432/agentic_wallet"
        )
        
        # Connection pool settings
        self.POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
        self.MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
        self.POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
        self.POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))
        
        # Echo SQL queries (for debugging)
        self.ECHO_SQL = os.getenv("DB_ECHO_SQL", "False").lower() == "true"


class Database:
    """Database manager - handles connections and sessions"""
    
    def __init__(self):
        self.config = DatabaseConfig()
        self.engine = None
        self.SessionLocal = None
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize database engine with connection pooling"""
        self.engine = create_engine(
            self.config.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=self.config.POOL_SIZE,
            max_overflow=self.config.MAX_OVERFLOW,
            pool_timeout=self.config.POOL_TIMEOUT,
            pool_recycle=self.config.POOL_RECYCLE,
            echo=self.config.ECHO_SQL,
            future=True
        )
        
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
    
    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)
        print("✅ All tables created successfully!")
    
    def drop_tables(self):
        """Drop all tables (use with caution!)"""
        Base.metadata.drop_all(bind=self.engine)
        print("⚠️  All tables dropped!")
    
    def get_session(self) -> Session:
        """Get a new database session"""
        return self.SessionLocal()
    
    @contextmanager
    def session_scope(self) -> Generator[Session, None, None]:
        """
        Provide a transactional scope for database operations
        Usage:
            with db.session_scope() as session:
                session.add(user)
                session.commit()
        """
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            from sqlalchemy import text
            with self.session_scope() as session:
                session.execute(text("SELECT 1"))
            return True
        except Exception as e:
            print(f"❌ Database health check failed: {e}")
            return False
    
    def close(self):
        """Close all database connections"""
        if self.engine:
            self.engine.dispose()
            print("🔒 Database connections closed")


# Global database instance
db = Database()


# Dependency for FastAPI
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency to get database session
    Usage in FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()


# Initialize database tables (call this on startup)
def init_db():
    """Initialize database - create all tables"""
    print("🚀 Initializing database...")
    db.create_tables()
    print("✅ Database initialization complete!")


# Reset database (use with caution!)
def reset_db():
    """Drop and recreate all tables - USE WITH CAUTION!"""
    print("⚠️  WARNING: Resetting database - all data will be lost!")
    db.drop_tables()
    db.create_tables()
    print("✅ Database reset complete!")
