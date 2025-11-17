#!/usr/bin/env python3
"""
Test script to verify location-based recommendations work with updated card rewards
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

# Test user
USER_EMAIL = "atharva@agentic.com"

# Test location (San Jose, CA coordinates)
TEST_LATITUDE = 37.3382
TEST_LONGITUDE = -121.8863

def test_location_recommendations():
    print("=" * 80)
    print("Testing Location-Based Recommendations")
    print("=" * 80)

    # Step 1: Get user ID
    print(f"\n1. Getting user ID for {USER_EMAIL}...")
    response = requests.post(f"{BASE_URL}/users/login", json={"email": USER_EMAIL})
    if response.status_code != 200:
        print(f"ERROR: Failed to get user - {response.status_code}")
        print(response.text)
        return

    user = response.json()
    user_id = user['user_id']
    print(f"   User ID: {user_id}")

    # Step 2: Get user's cards
    print(f"\n2. Fetching user's credit cards...")
    response = requests.get(f"{BASE_URL}/users/{user_id}/cards")
    if response.status_code != 200:
        print(f"ERROR: Failed to get cards - {response.status_code}")
        return

    cards = response.json()
    print(f"   Found {len(cards)} cards:")
    for card in cards:
        print(f"   - {card['card_name']}")
        print(f"     Cash Back: {json.dumps(card['cash_back_rate'], indent=8)}")
        print(f"     Points: {json.dumps(card['points_multiplier'], indent=8)}")

    # Step 3: Get nearby places
    print(f"\n3. Getting nearby places...")
    response = requests.post(
        f"{BASE_URL}/location/nearby-places",
        json={
            "latitude": TEST_LATITUDE,
            "longitude": TEST_LONGITUDE,
            "radius": 2000
        }
    )
    if response.status_code != 200:
        print(f"ERROR: Failed to get nearby places - {response.status_code}")
        print(response.text)
        return

    places = response.json()
    print(f"   Found {len(places)} nearby places:")
    for place in places[:3]:  # Show first 3
        print(f"   - {place['name']} ({place['category']}) - {place['distance_formatted']}")

    # Step 4: Get location-based recommendations
    print(f"\n4. Getting location-based recommendations...")
    response = requests.post(
        f"{BASE_URL}/location/recommendations",
        json={
            "user_id": user_id,
            "latitude": TEST_LATITUDE,
            "longitude": TEST_LONGITUDE,
            "radius": 2000,
            "assumed_amount": 100.0
        }
    )

    if response.status_code != 200:
        print(f"ERROR: Failed to get recommendations - {response.status_code}")
        print(response.text)
        return

    result = response.json()
    recommendations = result.get('recommendations', [])

    print(f"\n   SUCCESS! Received {len(recommendations)} recommendations")
    print(f"   Total potential savings: ${result.get('total_potential_savings', 0):.2f}")

    # Display top 3 recommendations
    print("\n" + "=" * 80)
    print("TOP RECOMMENDATIONS")
    print("=" * 80)

    for i, rec in enumerate(recommendations[:5], 1):
        place = rec['place']
        card = rec['recommended_card']

        print(f"\n{i}. {place['name']} ({place['category']})")
        print(f"   Address: {place['address']}")
        print(f"   Distance: {place['distance_formatted']}")
        if place.get('rating'):
            print(f"   Rating: ★ {place['rating']:.1f}")

        print(f"\n   → Recommended Card: {card['card_name']}")
        print(f"   → Expected Reward: ${rec['expected_reward']:.2f}")
        print(f"   → Why: {rec['reward_explanation'][:100]}...")

    print("\n" + "=" * 80)
    print("TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    try:
        test_location_recommendations()
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to backend API at http://localhost:8000")
        print("Make sure the backend server is running with: uvicorn main:app --reload")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
