"""
Seed Database with Initial Data
Populates the database with sample users, cards, and data for testing
"""

from database import db
from crud import (
    create_user, create_credit_card, create_transaction,
    create_merchant, get_or_create_merchant
)
from models import OptimizationGoalEnum, CategoryEnum, CardIssuerEnum
from datetime import datetime, timedelta
import random


def seed_database():
    """Populate database with sample data"""
    
    print("🌱 Seeding database with sample data...")
    
    with db.session_scope() as session:
        
        # ============================================================
        # CREATE SAMPLE USERS
        # ============================================================
        print("\n👤 Creating sample users...")
        
        user1 = create_user(
            session,
            email="john.doe@example.com",
            full_name="John Doe",
            phone="+1234567890",
            default_optimization_goal=OptimizationGoalEnum.CASH_BACK
        )
        print(f"   ✅ Created user: {user1.email}")
        
        user2 = create_user(
            session,
            email="jane.smith@example.com",
            full_name="Jane Smith",
            phone="+1987654321",
            default_optimization_goal=OptimizationGoalEnum.TRAVEL_POINTS
        )
        print(f"   ✅ Created user: {user2.email}")
        
        # ============================================================
        # CREATE CREDIT CARDS FOR USER 1
        # ============================================================
        print(f"\n💳 Creating credit cards for {user1.full_name}...")
        
        chase_sapphire = create_credit_card(
            session,
            user_id=user1.user_id,
            card_name="Chase Sapphire Reserve",
            issuer=CardIssuerEnum.CHASE,
            cash_back_rate={
                "dining": 0.03,
                "travel": 0.03,
                "other": 0.01
            },
            points_multiplier={
                "dining": 3.0,
                "travel": 3.0,
                "other": 1.0
            },
            annual_fee=550.0,
            benefits=[
                "Airport Lounge Access",
                "Travel Insurance",
                "$300 Travel Credit",
                "Priority Pass",
                "No Foreign Transaction Fees"
            ],
            last_four_digits="4123",
            credit_limit=20000.0,
            sign_up_bonus=60000.0
        )
        print(f"   ✅ Created card: {chase_sapphire.card_name}")
        
        citi_double = create_credit_card(
            session,
            user_id=user1.user_id,
            card_name="Citi Double Cash",
            issuer=CardIssuerEnum.CITI,
            cash_back_rate={
                "dining": 0.02,
                "travel": 0.02,
                "groceries": 0.02,
                "gas": 0.02,
                "entertainment": 0.02,
                "shopping": 0.02,
                "other": 0.02
            },
            points_multiplier={
                "dining": 0.0,
                "travel": 0.0,
                "other": 0.0
            },
            annual_fee=0.0,
            benefits=[
                "No Annual Fee",
                "Extended Warranty",
                "2% Cash Back on Everything"
            ],
            last_four_digits="8765",
            credit_limit=15000.0
        )
        print(f"   ✅ Created card: {citi_double.card_name}")
        
        amex_gold = create_credit_card(
            session,
            user_id=user1.user_id,
            card_name="American Express Gold",
            issuer=CardIssuerEnum.AMEX,
            cash_back_rate={
                "dining": 0.04,
                "groceries": 0.04,
                "other": 0.01
            },
            points_multiplier={
                "dining": 4.0,
                "groceries": 4.0,
                "other": 1.0
            },
            annual_fee=250.0,
            benefits=[
                "$120 Dining Credits",
                "$120 Uber Credits",
                "Travel Insurance",
                "Purchase Protection"
            ],
            last_four_digits="3456",
            credit_limit=25000.0,
            sign_up_bonus=50000.0
        )
        print(f"   ✅ Created card: {amex_gold.card_name}")
        
        # ============================================================
        # CREATE CREDIT CARDS FOR USER 2
        # ============================================================
        print(f"\n💳 Creating credit cards for {user2.full_name}...")
        
        chase_freedom = create_credit_card(
            session,
            user_id=user2.user_id,
            card_name="Chase Freedom Unlimited",
            issuer=CardIssuerEnum.CHASE,
            cash_back_rate={
                "dining": 0.03,
                "travel": 0.05,
                "other": 0.015
            },
            points_multiplier={
                "dining": 3.0,
                "travel": 5.0,
                "other": 1.5
            },
            annual_fee=0.0,
            benefits=[
                "No Annual Fee",
                "Cell Phone Protection",
                "Purchase Protection"
            ],
            last_four_digits="7890",
            credit_limit=10000.0,
            sign_up_bonus=20000.0
        )
        print(f"   ✅ Created card: {chase_freedom.card_name}")
        
        discover_it = create_credit_card(
            session,
            user_id=user2.user_id,
            card_name="Discover it Cash Back",
            issuer=CardIssuerEnum.DISCOVER,
            cash_back_rate={
                "gas": 0.05,
                "groceries": 0.05,
                "other": 0.01
            },
            points_multiplier={
                "other": 0.0
            },
            annual_fee=0.0,
            benefits=[
                "Rotating 5% Categories",
                "Cashback Match",
                "Free FICO Score"
            ],
            last_four_digits="2468",
            credit_limit=8000.0
        )
        print(f"   ✅ Created card: {discover_it.card_name}")
        
        # ============================================================
        # CREATE SAMPLE MERCHANTS
        # ============================================================
        print("\n🏪 Creating sample merchants...")
        
        merchants_data = [
            ("Starbucks", CategoryEnum.DINING),
            ("Whole Foods", CategoryEnum.GROCERIES),
            ("Shell", CategoryEnum.GAS),
            ("Amazon", CategoryEnum.SHOPPING),
            ("United Airlines", CategoryEnum.TRAVEL),
            ("Marriott Hotel", CategoryEnum.TRAVEL),
            ("Target", CategoryEnum.SHOPPING),
            ("Chipotle", CategoryEnum.DINING),
            ("Uber", CategoryEnum.TRAVEL),
            ("Netflix", CategoryEnum.ENTERTAINMENT),
        ]
        
        merchants = {}
        for name, category in merchants_data:
            merchant = get_or_create_merchant(session, name, category)
            merchants[name] = merchant
            print(f"   ✅ Created merchant: {name}")
        
        # ============================================================
        # CREATE SAMPLE TRANSACTIONS FOR USER 1
        # ============================================================
        print(f"\n💰 Creating sample transactions for {user1.full_name}...")
        
        transactions_data = [
            {
                "merchant": "Starbucks",
                "amount": 15.50,
                "category": CategoryEnum.DINING,
                "card_id": amex_gold.card_id,
                "days_ago": 1
            },
            {
                "merchant": "Whole Foods",
                "amount": 125.75,
                "category": CategoryEnum.GROCERIES,
                "card_id": amex_gold.card_id,
                "days_ago": 2
            },
            {
                "merchant": "United Airlines",
                "amount": 450.00,
                "category": CategoryEnum.TRAVEL,
                "card_id": chase_sapphire.card_id,
                "days_ago": 5
            },
            {
                "merchant": "Shell",
                "amount": 45.00,
                "category": CategoryEnum.GAS,
                "card_id": citi_double.card_id,
                "days_ago": 3
            },
            {
                "merchant": "Target",
                "amount": 85.20,
                "category": CategoryEnum.SHOPPING,
                "card_id": citi_double.card_id,
                "days_ago": 4
            },
            {
                "merchant": "Chipotle",
                "amount": 22.50,
                "category": CategoryEnum.DINING,
                "card_id": amex_gold.card_id,
                "days_ago": 7
            },
            {
                "merchant": "Amazon",
                "amount": 156.99,
                "category": CategoryEnum.SHOPPING,
                "card_id": citi_double.card_id,
                "days_ago": 10
            },
        ]
        
        for txn_data in transactions_data:
            transaction = create_transaction(
                session,
                user_id=user1.user_id,
                merchant=txn_data["merchant"],
                amount=txn_data["amount"],
                category=txn_data["category"],
                optimization_goal=user1.default_optimization_goal,
                card_id=txn_data["card_id"],
                recommended_card_id=txn_data["card_id"],  # Assume optimal choice
                location="San Francisco, CA"
            )
            
            # Set transaction date in the past
            transaction.transaction_date = datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            
            # Calculate rewards
            card = session.query(type(amex_gold)).filter_by(card_id=txn_data["card_id"]).first()
            category = txn_data["category"].value
            
            cash_back_rate = card.cash_back_rate.get(category, card.cash_back_rate.get("other", 0))
            points_mult = card.points_multiplier.get(category, card.points_multiplier.get("other", 0))
            
            transaction.cash_back_earned = txn_data["amount"] * cash_back_rate
            transaction.points_earned = txn_data["amount"] * points_mult
            transaction.total_value_earned = transaction.cash_back_earned + (transaction.points_earned * 0.015)
            transaction.optimal_value = transaction.total_value_earned  # Assume optimal
            transaction.missed_value = 0.0
            transaction.used_recommended_card = True
            
            session.add(transaction)
            print(f"   ✅ Created transaction: ${txn_data['amount']} at {txn_data['merchant']}")
        
        session.commit()
        
        print("\n" + "="*60)
        print("✨ Database seeded successfully!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   • Users created: 2")
        print(f"   • Cards created: 5")
        print(f"   • Merchants created: {len(merchants_data)}")
        print(f"   • Transactions created: {len(transactions_data)}")
        print(f"\n🔐 Test Accounts:")
        print(f"   • {user1.email} (user_id: {user1.user_id})")
        print(f"   • {user2.email} (user_id: {user2.user_id})")


if __name__ == "__main__":
    print("🚀 Starting database seeding...")
    print("⚠️  Make sure database tables are created first!")
    input("Press Enter to continue...")
    
    seed_database()
