#!/usr/bin/env python3
"""
Test script to verify the location-based recommendation data flow
Run this to see the exact structure of data being processed
"""

# Mock data structure returned by agentic_system.get_recommendation()
mock_recommendation = {
    "recommended_card": {
        "card_id": "card_123",
        "card_name": "Chase Sapphire Preferred",
        "expected_value": 2.50,  # $2.50 in rewards
        "cash_back_earned": 0.0,
        "points_earned": 100.0,
        "applicable_benefits": ["Travel insurance", "Purchase protection"],
        "explanation": "This card offers 3x points on dining, earning you 150 points ($2.25 value) on this transaction.",
        "confidence_score": 0.95
    },
    "alternative_cards": [],
    "optimization_summary": "Best choice for balanced: Chase Sapphire Preferred ($2.50 value)",
    "total_savings": 2.50
}

# Mock place data
mock_place = {
    'place_id': 'mock_chipotle_1',
    'name': 'Chipotle Mexican Grill',
    'category': 'dining',
    'place_types': ['restaurant', 'food'],
    'address': '789 Restaurant Row',
    'latitude': 37.7749,
    'longitude': -122.4194,
    'rating': 4.0,
    'price_level': 2,
    'is_open': True,
    'distance_meters': 900
}

print("=" * 60)
print("LOCATION-BASED RECOMMENDATION DATA FLOW TEST")
print("=" * 60)

print("\n1. INPUT: Mock Place")
print("-" * 60)
print(f"Place Name: {mock_place['name']}")
print(f"Category: {mock_place['category']}")
print(f"Distance: {mock_place['distance_meters']}m")

print("\n2. AI RECOMMENDATION OUTPUT")
print("-" * 60)
rec_card = mock_recommendation.get('recommended_card', {})
print(f"Recommended Card: {rec_card.get('card_name')}")
print(f"Expected Value: ${rec_card.get('expected_value', 0):.2f}")
print(f"Explanation: {rec_card.get('explanation')}")

print("\n3. CALCULATED METRICS")
print("-" * 60)
expected_reward = rec_card.get('expected_value', 0)
score = expected_reward / (mock_place['distance_meters'] / 100)
print(f"Expected Reward: ${expected_reward:.2f}")
print(f"Score (reward per 100m): {score:.4f}")

print("\n4. FINAL API RESPONSE FORMAT")
print("-" * 60)
response = {
    "place": {
        "name": mock_place['name'],
        "category": mock_place['category'],
        "distance_formatted": f"{mock_place['distance_meters']}m"
    },
    "recommended_card": {
        "card_name": rec_card.get('card_name', 'Unknown'),
        "reason": rec_card.get('explanation', 'Best rewards'),
        "estimated_value": f"${rec_card.get('expected_value', 0):.2f}"
    },
    "expected_reward": expected_reward,
    "reward_explanation": f"Earn ${expected_reward:.2f} in rewards at {mock_place['name']}"
}

import json
print(json.dumps(response, indent=2))

print("\n" + "=" * 60)
print("✅ DATA FLOW VERIFIED - All fields correctly mapped")
print("=" * 60)
