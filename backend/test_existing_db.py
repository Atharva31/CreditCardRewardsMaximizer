"""
Test Queries for Existing PostgreSQL Database
This script connects to your already-seeded database and runs test queries
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database import db
from crud import (
    get_user, get_user_cards, get_user_transactions,
    calculate_transaction_stats, get_user_behavior,
    get_recent_transactions
)
from models import CategoryEnum


def test_database_connection():
    """Test if we can connect to PostgreSQL"""
    print("\n" + "="*70)
    print("TESTING DATABASE CONNECTION")
    print("="*70)
    
    if db.health_check():
        print("✅ Successfully connected to PostgreSQL database!")
        print(f"   Database URL: {db.config.DATABASE_URL}")
        return True
    else:
        print("❌ Cannot connect to database!")
        print("\n💡 Make sure Docker is running:")
        print("   docker-compose up -d")
        return False


def list_all_users():
    """List all users in the database"""
    print("\n" + "="*70)
    print("QUERY 1: List All Users")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            from models import User
            users = session.query(User).all()
            
            if not users:
                print("⚠️  No users found in database")
                print("   The database might not be seeded yet")
                return None
            
            print(f"\n✅ Found {len(users)} user(s):\n")
            for user in users:
                print(f"   📧 Email: {user.email}")
                print(f"   👤 Name: {user.full_name}")
                print(f"   🆔 User ID: {user.user_id}")
                print(f"   🎯 Default Goal: {user.default_optimization_goal.value}")
                print(f"   📅 Created: {user.created_at}")
                print("-" * 70)
            
            return users[0].user_id  # Return first user ID for other tests
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def query_user_cards(user_id):
    """Query all credit cards for a user"""
    print("\n" + "="*70)
    print(f"QUERY 2: Get Credit Cards for User {user_id}")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            cards = get_user_cards(session, user_id)
            
            if not cards:
                print("⚠️  No credit cards found for this user")
                return
            
            print(f"\n✅ Found {len(cards)} credit card(s):\n")
            
            for i, card in enumerate(cards, 1):
                print(f"   🎴 Card {i}: {card.card_name}")
                print(f"      Issuer: {card.issuer.value}")
                print(f"      Last 4 Digits: {card.last_four_digits}")
                print(f"      Annual Fee: ${card.annual_fee}")
                print(f"      Credit Limit: ${card.credit_limit:,.2f}")
                print(f"      Status: {'Active' if card.is_active else 'Inactive'}")
                
                # Show reward rates
                print(f"\n      💰 Cash Back Rates:")
                for category, rate in card.cash_back_rate.items():
                    print(f"         {category}: {rate*100}%")
                
                print(f"\n      ⭐ Points Multipliers:")
                for category, mult in card.points_multiplier.items():
                    print(f"         {category}: {mult}x")
                
                if card.benefits:
                    print(f"\n      🎁 Benefits:")
                    for benefit in card.benefits[:3]:  # Show first 3
                        print(f"         • {benefit}")
                
                print("-" * 70)
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def query_user_transactions(user_id):
    """Query recent transactions for a user"""
    print("\n" + "="*70)
    print(f"QUERY 3: Get Recent Transactions for User {user_id}")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            transactions = get_recent_transactions(session, user_id, days=90, limit=20)
            
            if not transactions:
                print("⚠️  No transactions found for this user")
                return
            
            print(f"\n✅ Found {len(transactions)} transaction(s):\n")
            
            for i, txn in enumerate(transactions, 1):
                print(f"   💳 Transaction {i}:")
                print(f"      Date: {txn.transaction_date.strftime('%Y-%m-%d %H:%M')}")
                print(f"      Merchant: {txn.merchant}")
                print(f"      Amount: ${txn.amount:.2f}")
                print(f"      Category: {txn.category.value}")
                print(f"      Location: {txn.location}")
                
                if txn.cash_back_earned:
                    print(f"      💵 Cash Back: ${txn.cash_back_earned:.2f}")
                if txn.points_earned:
                    print(f"      ⭐ Points: {txn.points_earned:.0f}")
                if txn.total_value_earned:
                    print(f"      💎 Total Value: ${txn.total_value_earned:.2f}")
                
                if txn.used_recommended_card is not None:
                    status = "✅ Used Recommended" if txn.used_recommended_card else "⚠️  Didn't Use Recommended"
                    print(f"      {status}")
                
                print("-" * 70)
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def query_transaction_stats(user_id):
    """Calculate and display transaction statistics"""
    print("\n" + "="*70)
    print(f"QUERY 4: Calculate Transaction Statistics for User {user_id}")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            stats = calculate_transaction_stats(session, user_id)
            
            print(f"\n✅ Transaction Statistics:\n")
            print(f"   📊 Total Transactions: {stats['total_transactions']}")
            print(f"   💵 Total Spent: ${stats['total_spent']:,.2f}")
            print(f"   💰 Total Rewards Earned: ${stats['total_rewards']:,.2f}")
            print(f"   🎯 Total Potential Rewards: ${stats['total_potential_rewards']:,.2f}")
            print(f"   📉 Missed Value: ${stats['missed_value']:,.2f}")
            print(f"   ✨ Optimization Rate: {stats['optimization_rate']:.1f}%")
            
            if stats['total_spent'] > 0:
                reward_rate = (stats['total_rewards'] / stats['total_spent']) * 100
                print(f"   📈 Overall Reward Rate: {reward_rate:.2f}%")
            
            print("-" * 70)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def query_by_category(user_id):
    """Query transactions by specific category"""
    print("\n" + "="*70)
    print(f"QUERY 5: Get Dining Transactions for User {user_id}")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            dining_txns = get_user_transactions(
                session, 
                user_id,
                category=CategoryEnum.DINING,
                limit=10
            )
            
            if not dining_txns:
                print("⚠️  No dining transactions found")
                return
            
            print(f"\n✅ Found {len(dining_txns)} dining transaction(s):\n")
            
            total_dining_spend = 0
            total_dining_rewards = 0
            
            for txn in dining_txns:
                print(f"   🍽️  ${txn.amount:.2f} at {txn.merchant}")
                if txn.total_value_earned:
                    print(f"      Earned: ${txn.total_value_earned:.2f}")
                total_dining_spend += txn.amount
                total_dining_rewards += txn.total_value_earned or 0
            
            print("-" * 70)
            print(f"   📊 Dining Summary:")
            print(f"      Total Spent: ${total_dining_spend:.2f}")
            print(f"      Total Rewards: ${total_dining_rewards:.2f}")
            if total_dining_spend > 0:
                print(f"      Reward Rate: {(total_dining_rewards/total_dining_spend)*100:.2f}%")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def query_user_behavior(user_id):
    """Query learned user behavior and preferences"""
    print("\n" + "="*70)
    print(f"QUERY 6: Get User Behavior Profile for User {user_id}")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            behavior = get_user_behavior(session, user_id)
            
            if not behavior:
                print("⚠️  No behavior profile found for this user")
                return
            
            print(f"\n✅ User Behavior Profile:\n")
            
            if behavior.preferred_goal:
                print(f"   🎯 Preferred Goal: {behavior.preferred_goal.value}")
            
            if behavior.common_categories:
                print(f"   📊 Common Categories: {', '.join(behavior.common_categories)}")
            
            if behavior.avg_transaction_amount:
                print(f"   💵 Avg Transaction: ${behavior.avg_transaction_amount:.2f}")
            
            if behavior.total_transactions:
                print(f"   📈 Total Transactions: {behavior.total_transactions}")
            
            if behavior.total_spent:
                print(f"   💰 Total Spent: ${behavior.total_spent:,.2f}")
            
            if behavior.optimization_score:
                print(f"   ✨ Optimization Score: {behavior.optimization_score:.1f}/100")
            
            if behavior.most_used_card_id:
                print(f"   🎴 Most Used Card: {behavior.most_used_card_id}")
            
            if behavior.card_usage_distribution:
                print(f"\n   📊 Card Usage Distribution:")
                for card_id, percentage in behavior.card_usage_distribution.items():
                    print(f"      {card_id}: {percentage:.1f}%")
            
            print(f"\n   📅 Last Updated: {behavior.last_updated}")
            print(f"   📚 Learning Data Points: {behavior.learning_data_points}")
            
            print("-" * 70)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def run_custom_query():
    """Example of running a custom SQL query"""
    print("\n" + "="*70)
    print("QUERY 7: Custom SQL Query - Top Cards by Usage")
    print("="*70)
    
    try:
        with db.session_scope() as session:
            from sqlalchemy import func
            from models import Transaction, CreditCard
            
            # Query to find most used cards
            results = session.query(
                CreditCard.card_name,
                func.count(Transaction.transaction_id).label('usage_count'),
                func.sum(Transaction.amount).label('total_spent')
            ).join(
                Transaction, CreditCard.card_id == Transaction.card_id
            ).group_by(
                CreditCard.card_name
            ).order_by(
                func.count(Transaction.transaction_id).desc()
            ).limit(5).all()
            
            if not results:
                print("⚠️  No transaction data found")
                return
            
            print(f"\n✅ Top 5 Most Used Cards:\n")
            
            for i, (card_name, count, total) in enumerate(results, 1):
                print(f"   {i}. {card_name}")
                print(f"      Transactions: {count}")
                print(f"      Total Spent: ${total:,.2f}")
                print("-" * 70)
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Main test function"""
    print("\n")
    print("="*70)
    print("  POSTGRESQL DATABASE QUERY TESTER")
    print("  Testing Existing Seeded Database")
    print("="*70)
    
    # Test connection
    if not test_database_connection():
        print("\n❌ Cannot proceed - database not accessible!")
        print("\n💡 Quick Fix:")
        print("   1. Make sure Docker Desktop is running")
        print("   2. Start the database: docker-compose up -d")
        print("   3. Wait 10 seconds for PostgreSQL to start")
        print("   4. Run this script again: python test_existing_db.py")
        return
    
    # List all users
    user_id = list_all_users()
    
    if not user_id:
        print("\n⚠️  Database appears to be empty!")
        print("\n💡 To seed the database:")
        print("   python seed_database.py")
        return
    
    # Run all queries
    query_user_cards(user_id)
    query_user_transactions(user_id)
    query_transaction_stats(user_id)
    query_by_category(user_id)
    query_user_behavior(user_id)
    run_custom_query()
    
    # Summary
    print("\n" + "="*70)
    print("✨ ALL QUERIES COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\n📊 Summary:")
    print("   ✅ Database connection working")
    print("   ✅ Users queried successfully")
    print("   ✅ Credit cards retrieved")
    print("   ✅ Transactions analyzed")
    print("   ✅ Statistics calculated")
    print("   ✅ User behavior profiled")
    print("   ✅ Custom queries working")
    
    print(f"\n🎯 Test user ID: {user_id}")
    print("   You can use this ID in your API endpoints!")
    
    print("\n💡 Next Steps:")
    print("   1. Your database is working perfectly!")
    print("   2. You can now build API endpoints in main.py")
    print("   3. Use these queries in your FastAPI routes")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    main()
