"""
Test script to verify card library seeding functionality
"""

import json
import os

# Test reading the card library
def test_card_library():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    library_path = os.path.join(current_dir, "seed_data", "card_library.json")

    print(f"Looking for card library at: {library_path}")
    print(f"File exists: {os.path.exists(library_path)}\n")

    if not os.path.exists(library_path):
        print("❌ Card library file not found!")
        return

    # Read and validate JSON
    try:
        with open(library_path, 'r') as f:
            cards_data = json.load(f)

        print(f"✅ Successfully loaded {len(cards_data)} cards from library\n")

        # Show sample of first 5 cards
        print("Sample cards:")
        print("=" * 80)
        for i, card in enumerate(cards_data[:5], 1):
            print(f"\n{i}. {card['card_name']}")
            print(f"   Issuer: {card['issuer']}")
            print(f"   Annual Fee: ${card['annual_fee']}")
            print(f"   Cash Back: {card['cash_back_rate']}")
            print(f"   Points: {card['points_multiplier']}")
            print(f"   Benefits: {len(card.get('benefits', []))} listed")

        print("\n" + "=" * 80)
        print(f"\nTotal cards in library: {len(cards_data)}")

        # Count by issuer
        issuers = {}
        for card in cards_data:
            issuer = card['issuer']
            issuers[issuer] = issuers.get(issuer, 0) + 1

        print("\nCards by issuer:")
        for issuer, count in sorted(issuers.items(), key=lambda x: x[1], reverse=True):
            print(f"  {issuer}: {count}")

    except Exception as e:
        print(f"❌ Error reading card library: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_card_library()
