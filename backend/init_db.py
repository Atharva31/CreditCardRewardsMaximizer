"""
Initialize Database - Creates all tables
Run this ONCE to set up your database
"""

from database import db, init_db

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  🚀 INITIALIZING AGENTIC WALLET DATABASE")
    print("="*70)
    
    # Check connection first
    print("\n📡 Testing database connection...")
    if not db.health_check():
        print("\n❌ ERROR: Cannot connect to PostgreSQL!")
        print("\n💡 Troubleshooting Steps:")
        print("   1. Make sure Docker Desktop is running")
        print("   2. Start PostgreSQL container:")
        print("      docker-compose up -d")
        print("   3. Wait 10 seconds for PostgreSQL to start")
        print("   4. Try running this script again")
        print("\n📋 Check Docker status:")
        print("   docker-compose ps")
        exit(1)
    
    print("✅ Database connection successful!")
    print(f"   Connected to: {db.config.DATABASE_URL}")
    
    print("\n📋 Creating database tables...")
    print("   This will create:")
    print("   • users table")
    print("   • credit_cards table")
    print("   • card_benefits table")
    print("   • transactions table")
    print("   • transaction_feedback table")
    print("   • user_behavior table")
    print("   • automation_rules table")
    print("   • merchants table")
    print("   • offers table")
    print("   • ai_model_metrics table")
    
    # Create all tables
    try:
        init_db()
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        print("\n💡 This might be because tables already exist.")
        print("   If you want to recreate them:")
        print("   1. Drop existing database:")
        print("      docker-compose down -v")
        print("   2. Start fresh:")
        print("      docker-compose up -d")
        print("   3. Wait 10 seconds")
        print("   4. Run this script again")
        exit(1)
    
    print("\n" + "="*70)
    print("  ✅ DATABASE INITIALIZATION COMPLETE!")
    print("="*70)
    
    print("\n📊 Database Tables Created:")
    print("   ✅ users                - User accounts")
    print("   ✅ credit_cards         - User's credit cards")
    print("   ✅ card_benefits        - Card benefits & offers")
    print("   ✅ transactions         - Purchase history")
    print("   ✅ transaction_feedback - User feedback")
    print("   ✅ user_behavior        - Learned preferences")
    print("   ✅ automation_rules     - User automation rules")
    print("   ✅ merchants            - Store/merchant database")
    print("   ✅ offers               - Special promotions")
    print("   ✅ ai_model_metrics     - AI performance tracking")
    
    print("\n🎯 Next Steps:")
    print("   1. Seed database with sample data:")
    print("      python seed_database.py")
    print("\n   2. Test database connection:")
    print("      python test_existing_db.py")
    print("\n   3. Start API server:")
    print("      uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print("\n   4. Open Swagger UI:")
    print("      http://localhost:8000/docs")
    
    print("\n" + "="*70)
    print("  🎉 READY TO GO!")
    print("="*70 + "\n")
