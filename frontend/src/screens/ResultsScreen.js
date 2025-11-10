// src/screens/ResultsScreen.js - NEW FILE YOU NEED
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultsScreen({ route, navigation }) {
  // Mock recommendation for Day 1
  // Atharva will replace with real API data on Day 2
  const mockRecommendation = {
    card_name: 'Chase Sapphire Preferred',
    expected_value: 15.50,
    cash_back: 0,
    points: 150,
    explanation: 'This card earns 3x points on dining, giving you 150 points worth ~$1.50',
  };

  const { merchant, amount, category, goal } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ Recommendation tu madre</Text>
        </View>

        <View style={styles.transactionSummary}>
          <Text style={styles.summaryLabel}>Transaction:</Text>
          <Text style={styles.summaryText}>{merchant || 'N/A'}</Text>
          <Text style={styles.summaryText}>${amount || '0.00'}</Text>
          <Text style={styles.summaryText}>Category: {category}</Text>
        </View>

        <View style={styles.recommendationCard}>
          <Text style={styles.useLabel}>USE THIS CARD</Text>
          <Text style={styles.cardName}>{mockRecommendation.card_name}</Text>

          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Expected Value</Text>
            <Text style={styles.valueAmount}>
              ${mockRecommendation.expected_value.toFixed(2)}
            </Text>
          </View>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardCol}>
              <Text style={styles.rewardLabel}>Cash Back</Text>
              <Text style={styles.rewardValue}>
                ${mockRecommendation.cash_back.toFixed(2)}
              </Text>
            </View>
            <View style={styles.rewardCol}>
              <Text style={styles.rewardLabel}>Points</Text>
              <Text style={styles.rewardValue}>{mockRecommendation.points}</Text>
            </View>
          </View>

          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Why this card?</Text>
            <Text style={styles.explanationText}>{mockRecommendation.explanation}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Transaction')}
        >
          <Text style={styles.primaryButtonText}>Try Another Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MyCards')}
        >
          <Text style={styles.secondaryButtonText}>View My Cards</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#4A90E2', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  transactionSummary: { 
    backgroundColor: '#fff', 
    margin: 20, 
    padding: 15, 
    borderRadius: 8 
  },
  summaryLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  summaryText: { fontSize: 16, color: '#333', marginBottom: 4 },
  recommendationCard: { 
    backgroundColor: '#E3F2FD', 
    margin: 20, 
    marginTop: 0,
    padding: 20, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2'
  },
  useLabel: { fontSize: 12, fontWeight: 'bold', color: '#4A90E2', marginBottom: 8 },
  cardName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  valueBox: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 16
  },
  valueLabel: { fontSize: 14, color: '#666' },
  valueAmount: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', marginTop: 4 },
  rewardsRow: { flexDirection: 'row', marginBottom: 16 },
  rewardCol: { flex: 1, alignItems: 'center' },
  rewardLabel: { fontSize: 12, color: '#666' },
  rewardValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  explanationBox: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8 
  },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  explanationText: { fontSize: 14, color: '#555', lineHeight: 20 },
  primaryButton: { 
    backgroundColor: '#4A90E2', 
    margin: 20, 
    marginTop: 0,
    padding: 18, 
    borderRadius: 8,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { 
    backgroundColor: '#fff', 
    margin: 20, 
    marginTop: 0,
    padding: 18, 
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2'
  },
  secondaryButtonText: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' },
});