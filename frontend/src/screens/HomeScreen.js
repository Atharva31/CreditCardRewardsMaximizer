/**
 * HomeScreen.js - FINAL VERSION
 * With original white box container + grey merchant tiles design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import TransactionModal from '../components/TransactionModal';

const HomeScreen = ({ navigation, route }) => {
  // Get userId and userName from navigation params or use defaults
  const userId = route?.params?.userId || 'user_123';
  const userName = route?.params?.userName || 'Joe';
  
  const [userCards, setUserCards] = useState([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [nearbyMerchants, setNearbyMerchants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  // API Configuration
  const API_URL = 'http://localhost:8000'; // Change this to your actual API URL
  // For mobile testing, use your computer's IP: 'http://192.168.1.XXX:8000'

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      // Fetch user's actual cards from backend
      try {
        const cardsResponse = await fetch(`${API_URL}/api/v1/users/${userId}/cards`);
        if (cardsResponse.ok) {
          const cards = await cardsResponse.json();
          setUserCards(cards);
          console.log('Loaded user cards:', cards.length);
        } else {
          console.log('Could not fetch cards, using mock data');
          setUserCards([]);
        }
      } catch (error) {
        console.error('Error fetching cards:', error);
        setUserCards([]);
      }

      // Fetch user stats
      try {
        const statsResponse = await fetch(`${API_URL}/api/v1/users/${userId}/stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setTotalRewards(stats.total_rewards || 0);
          setTransactionCount(stats.total_transactions || 0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      // Fetch nearby merchants (or use mock data)
      try {
        const merchantsResponse = await fetch(
          `${API_URL}/api/v1/merchants/nearby?user_id=${userId}`
        );
        if (merchantsResponse.ok) {
          const data = await merchantsResponse.json();
          setNearbyMerchants(data.merchants || getMockMerchants());
        } else {
          setNearbyMerchants(getMockMerchants());
        }
      } catch (error) {
        console.log('Using mock merchants');
        setNearbyMerchants(getMockMerchants());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setNearbyMerchants(getMockMerchants());
    }
  };

  // Mock merchants data (all original merchants)
  const getMockMerchants = () => [
    {
      name: 'Starbucks',
      category: 'DINING',
      address: '555 Coffee Lane',
      distance: '600m',
      rating: 4.3,
      best_card: 'American Express Gold',
      estimated_rewards: '$5.50 in rewards',
    },
    {
      name: 'Whole Foods Market',
      category: 'GROCERIES',
      address: '456 Market Street',
      distance: '750m',
      rating: 4.5,
      best_card: 'Amazon Prime Rewards',
      estimated_rewards: '$5.00 in rewards',
    },
    {
      name: 'Chipotle Mexican Grill',
      category: 'DINING',
      address: '789 Restaurant Row',
      distance: '900m',
      rating: 4.0,
      best_card: 'Chase Sapphire Reserve',
      estimated_rewards: '$4.50 in rewards',
    },
    {
      name: 'Target',
      category: 'SHOPPING',
      address: '123 Main Street',
      distance: '1.1km',
      rating: 4.2,
      best_card: 'Target RedCard',
      estimated_rewards: '$4.00 in rewards',
    },
    {
      name: 'Panera Bread',
      category: 'DINING',
      address: '222 Bakery Ave',
      distance: '800m',
      rating: 4.1,
      best_card: 'American Express Gold',
      estimated_rewards: '$3.80 in rewards',
    },
    {
      name: 'Shell Gas Station',
      category: 'GAS',
      address: '321 Highway Blvd',
      distance: '1.2km',
      rating: 3.9,
      best_card: 'Chase Freedom',
      estimated_rewards: '$3.50 in rewards',
    },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleMerchantPress = (merchant) => {
    setSelectedMerchant(merchant);
    setModalVisible(true);
  };

  const handleTransactionSuccess = () => {
    fetchUserData();
  };

  return (
    <View style={styles.container}>
      {/* Blue Header Bar */}
      <View style={styles.headerBar} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome {userName}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Your intelligent credit card recommendation system is ready.
          </Text>
          <Text style={styles.welcomeDescription}>
            Tap the Transaction tab below to get AI-powered recommendations!
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalRewards.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Rewards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{transactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Nearby Recommendations - WHITE BOX WITH GREY TILES (Original Style) */}
        <View style={styles.nearbyCard}>
          <View style={styles.nearbyHeader}>
            <Text style={styles.nearbyTitle}>Nearby Recommendations</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.refreshButton}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrolling Grey Merchant Tiles */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.merchantsScroll}
            contentContainerStyle={styles.merchantsScrollContent}
          >
            {nearbyMerchants.map((merchant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.merchantTile}
                onPress={() => handleMerchantPress(merchant)}
                activeOpacity={0.7}
              >
                {/* Merchant Name and Category */}
                <View style={styles.tileHeader}>
                  <Text style={styles.tileName} numberOfLines={2}>
                    {merchant.name}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{merchant.category}</Text>
                  </View>
                </View>

                {/* Address */}
                <Text style={styles.tileAddress} numberOfLines={1}>
                  {merchant.address}
                </Text>

                {/* Distance and Rating */}
                <View style={styles.tileMeta}>
                  <Text style={styles.tileDistance}>{merchant.distance}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingStar}>⭐</Text>
                    <Text style={styles.ratingText}>{merchant.rating}</Text>
                  </View>
                </View>

                {/* Best Card Section */}
                <View style={styles.tileDivider} />
                <View style={styles.tileCardSection}>
                  <Text style={styles.tileCardLabel}>Best Card:</Text>
                  <Text style={styles.tileCardName} numberOfLines={1}>
                    {merchant.best_card}
                  </Text>
                  <Text style={styles.tileRewards}>
                    {merchant.estimated_rewards}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        merchant={selectedMerchant}
        userCards={userCards}
        userId={userId}
        onSuccess={handleTransactionSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    height: 60,
    backgroundColor: '#4A90E2',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  // NEARBY CARD - WHITE BOX CONTAINER (Original Style)
  nearbyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  nearbyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  refreshButton: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  merchantsScroll: {
    paddingLeft: 20,
  },
  merchantsScrollContent: {
    paddingRight: 20,
  },
  // MERCHANT TILES - GREY BACKGROUND (Original Style)
  merchantTile: {
    width: 280,
    backgroundColor: '#F5F5F5', // Grey background like original
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  tileHeader: {
    marginBottom: 8,
  },
  tileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileDistance: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tileDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  tileCardSection: {
    paddingTop: 4,
  },
  tileCardLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  tileCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tileRewards: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreen;
