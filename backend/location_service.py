# location_service.py - Google Places Integration for Location-Based Recommendations
import os
import logging
from typing import List, Dict, Optional
import googlemaps
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LocationService:
    """Service for finding nearby places using Google Places API"""

    def __init__(self):
        api_key = os.getenv('GOOGLE_PLACES_API_KEY')
        if not api_key or api_key == 'your_google_places_api_key_here':
            logger.warning("Google Places API key not configured. Location features will be limited.")
            self.client = None
        else:
            self.client = googlemaps.Client(key=api_key)
            logger.info("Google Places API client initialized")

    def get_nearby_places(
        self,
        latitude: float,
        longitude: float,
        radius: int = 2000,
        place_types: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Get nearby places from Google Places API

        Args:
            latitude: User's latitude
            longitude: User's longitude
            radius: Search radius in meters (default 2000m = 2km)
            place_types: Optional list of place types to search for

        Returns:
            List of nearby places with details
        """
        if not self.client:
            logger.warning("Google Places API client not initialized, using mock data")
            return self._get_mock_nearby_places(latitude, longitude)

        try:
            location = (latitude, longitude)

            # Default place types relevant for credit card rewards
            if not place_types:
                place_types = [
                    'restaurant',
                    'grocery_or_supermarket',
                    'gas_station',
                    'shopping_mall',
                    'department_store',
                    'cafe',
                    'movie_theater',
                    'airport',
                    'hotel'
                ]

            all_places = []

            # Search for each type (Google allows max 20 results per type)
            api_errors = 0
            for place_type in place_types:
                try:
                    results = self.client.places_nearby(
                        location=location,
                        radius=radius,
                        type=place_type,
                        rank_by=None  # Use radius-based search
                    )

                    # Check for API errors (REQUEST_DENIED, etc.)
                    if results.get('status') in ['REQUEST_DENIED', 'INVALID_REQUEST']:
                        api_errors += 1
                        if api_errors >= 3:
                            # If we get multiple API errors, fall back to mock data
                            logger.warning(f"Google Places API error: {results.get('status')}. Falling back to mock data.")
                            return self._get_mock_nearby_places(latitude, longitude)
                        continue

                    if results.get('results'):
                        for place in results['results']:
                            # Map to our format
                            place_data = {
                                'place_id': place.get('place_id'),
                                'name': place.get('name'),
                                'category': self._map_place_type_to_category(place.get('types', [])),
                                'place_types': place.get('types', []),
                                'address': place.get('vicinity'),
                                'latitude': place['geometry']['location']['lat'],
                                'longitude': place['geometry']['location']['lng'],
                                'rating': place.get('rating'),
                                'price_level': place.get('price_level'),
                                'is_open': place.get('opening_hours', {}).get('open_now'),
                                'distance_meters': self._calculate_distance(
                                    latitude, longitude,
                                    place['geometry']['location']['lat'],
                                    place['geometry']['location']['lng']
                                )
                            }
                            all_places.append(place_data)

                except Exception as e:
                    logger.error(f"Error searching for {place_type}: {e}")
                    api_errors += 1
                    if api_errors >= 3:
                        logger.warning("Multiple API errors encountered. Falling back to mock data.")
                        return self._get_mock_nearby_places(latitude, longitude)
                    continue

            # Remove duplicates (same place might appear in multiple type searches)
            unique_places = {p['place_id']: p for p in all_places}.values()

            # Sort by distance
            sorted_places = sorted(unique_places, key=lambda x: x['distance_meters'])

            # Return top 20 closest places
            return list(sorted_places)[:20]

        except Exception as e:
            logger.error(f"Error fetching nearby places: {e}", exc_info=True)
            return self._get_mock_nearby_places(latitude, longitude)

    def _map_place_type_to_category(self, place_types: List[str]) -> str:
        """Map Google place types to our credit card categories"""
        type_mapping = {
            'restaurant': 'dining',
            'cafe': 'dining',
            'bar': 'dining',
            'meal_delivery': 'dining',
            'meal_takeaway': 'dining',
            'food': 'dining',
            'grocery_or_supermarket': 'groceries',
            'supermarket': 'groceries',
            'gas_station': 'gas',
            'airport': 'travel',
            'hotel': 'travel',
            'lodging': 'travel',
            'travel_agency': 'travel',
            'movie_theater': 'entertainment',
            'amusement_park': 'entertainment',
            'bowling_alley': 'entertainment',
            'shopping_mall': 'shopping',
            'department_store': 'shopping',
            'clothing_store': 'shopping',
            'electronics_store': 'shopping',
        }

        for place_type in place_types:
            if place_type in type_mapping:
                return type_mapping[place_type]

        return 'other'

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in meters using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2

        R = 6371000  # Earth's radius in meters

        lat1_rad = radians(lat1)
        lat2_rad = radians(lat2)
        delta_lat = radians(lat2 - lat1)
        delta_lon = radians(lon2 - lon1)

        a = sin(delta_lat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance = R * c
        return distance

    def _get_mock_nearby_places(self, latitude: float, longitude: float) -> List[Dict]:
        """
        Return mock nearby places when Google API is not configured.
        Useful for development and testing.
        """
        logger.info("Using mock nearby places (Google API not available)")

        # Mock places based on common categories with realistic locations
        mock_places = [
            {
                'place_id': 'mock_target_1',
                'name': 'Target',
                'category': 'shopping',
                'place_types': ['department_store', 'shopping'],
                'address': '123 Main St',
                'latitude': latitude + 0.01,
                'longitude': longitude + 0.01,
                'rating': 4.2,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 500
            },
            {
                'place_id': 'mock_whole_foods_1',
                'name': 'Whole Foods Market',
                'category': 'groceries',
                'place_types': ['grocery_or_supermarket', 'supermarket'],
                'address': '456 Oak Ave',
                'latitude': latitude + 0.005,
                'longitude': longitude + 0.005,
                'rating': 4.5,
                'price_level': 3,
                'is_open': True,
                'distance_meters': 750
            },
            {
                'place_id': 'mock_chipotle_1',
                'name': 'Chipotle Mexican Grill',
                'category': 'dining',
                'place_types': ['restaurant', 'food'],
                'address': '789 Restaurant Row',
                'latitude': latitude + 0.008,
                'longitude': longitude + 0.003,
                'rating': 4.0,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 900
            },
            {
                'place_id': 'mock_shell_1',
                'name': 'Shell Gas Station',
                'category': 'gas',
                'place_types': ['gas_station'],
                'address': '321 Highway Blvd',
                'latitude': latitude + 0.012,
                'longitude': longitude + 0.008,
                'rating': 3.8,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 1200
            },
            {
                'place_id': 'mock_starbucks_1',
                'name': 'Starbucks',
                'category': 'dining',
                'place_types': ['cafe', 'food'],
                'address': '555 Coffee Lane',
                'latitude': latitude + 0.003,
                'longitude': longitude + 0.007,
                'rating': 4.3,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 600
            },
            {
                'place_id': 'mock_walmart_1',
                'name': 'Walmart Supercenter',
                'category': 'groceries',
                'place_types': ['grocery_or_supermarket', 'department_store'],
                'address': '888 Commerce Dr',
                'latitude': latitude + 0.015,
                'longitude': longitude + 0.002,
                'rating': 3.9,
                'price_level': 1,
                'is_open': True,
                'distance_meters': 1500
            },
            {
                'place_id': 'mock_costco_1',
                'name': 'Costco Wholesale',
                'category': 'groceries',
                'place_types': ['grocery_or_supermarket', 'warehouse_club'],
                'address': '999 Wholesale Way',
                'latitude': latitude + 0.018,
                'longitude': longitude + 0.005,
                'rating': 4.4,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 1800
            },
            {
                'place_id': 'mock_panerabread_1',
                'name': 'Panera Bread',
                'category': 'dining',
                'place_types': ['restaurant', 'cafe', 'bakery'],
                'address': '222 Bakery Street',
                'latitude': latitude + 0.006,
                'longitude': longitude + 0.009,
                'rating': 4.1,
                'price_level': 2,
                'is_open': True,
                'distance_meters': 800
            }
        ]

        return mock_places

    def format_distance(self, distance_meters: float) -> str:
        """Format distance for display"""
        if distance_meters < 1000:
            return f"{int(distance_meters)}m"
        else:
            return f"{distance_meters / 1000:.1f}km"


# Singleton instance
location_service = LocationService()
