// src/screens/HistoryScreen.js - Complete with Fixed Emojis
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [timeFilter, setTimeFilter] = useState('all');

  // Mock transaction history - Later: Fetch from backend via Atharva's API
  const transactions = [
    {
      id: '1',
      merchant: 'Starbucks',
      amount: 15.50,
      category: 'dining',
      card_used: 'Amex Gold',
      card_recommended: 'Amex Gold',
      cash_back: 0.62,
      points: 62,
      date: '2025-01-05',
      optimal: true,
    },
    {
      id: '2',
      merchant: 'Shell Gas Station',
      amount: 45.00,
      category: 'gas',
      card_used: 'Citi Double Cash',
      card_recommended: 'Citi Custom Cash',
      cash_back: 0.90,
      points: 0,
      missed_value: 1.35,
      date: '2025-01-04',
      optimal: false,
    },
    {
      id: '3',
      merchant: 'Whole Foods',
      amount: 127.43,
      category: 'groceries',
      card_used: 'Amex Gold',
      card_recommended: 'Amex Gold',
      cash_back: 5.10,
      points: 510,
      date: '2025-01-03',
      optimal: true,
    },
    {
      id: '4',
      merchant: 'Amazon',
      amount: 89.99,
      category: 'shopping',
      card_used: 'Chase Sapphire',
      card_recommended: 'Citi Double Cash',
      cash_back: 0.90,
      points: 90,
      missed_value: 0.90,
      date: '2025-01-02',
      optimal: false,
    },
    {
      id: '5',
      merchant: 'AMC Theater',
      amount: 32.00,
      category: 'entertainment',
      card_used: 'Chase Sapphire',
      card_recommended: 'Chase Sapphire',
      cash_back: 0.96,
      points: 96,
      date: '2025-01-01',
      optimal: true,
    },
  ];

  const totalSaved = transactions
    .filter((t) => t.optimal)
    .reduce((sum, t) => sum + (t.cash_back || 0) + (t.points || 0) * 0.01, 0);

  const totalMissed = transactions
    .filter((t) => !t.optimal)
    .reduce((sum, t) => sum + (t.missed_value || 0), 0);

  const getCategoryEmoji = (category) => {
    const emojis = {
      dining: '🍽️',
      gas: '⛽',
      groceries: '🛒',
      shopping: '🛍️',
      entertainment: '🎬',
      travel: '✈️',
    };
    return emojis[category] || '💳';
  };

  const TransactionItem = ({ transaction }) => {
    return (
      <View
        style={[
          styles.transactionItem,
          !transaction.optimal && styles.transactionItemSuboptimal,
        ]}
      >
        {/* Transaction Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.merchantRow}>
            <View style={styles.emojiCircle}>
              <Text style={styles.categoryEmoji}>
                {getCategoryEmoji(transaction.category)}
              </Text>
            </View>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
          </View>
          <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
        </View>

        {/* Card Used */}
        <View style={styles.cardUsedRow}>
          <Text style={styles.cardUsedLabel}>Card Used:</Text>
          <Text style={styles.cardUsedName}>{transaction.card_used}</Text>
        </View>

        {/* Optimal/Suboptimal Badge */}
        {transaction.optimal ? (
          <View style={styles.optimalBadge}>
            <Text style={styles.optimalBadgeText}>
              ✓ Optimal Choice • Earned ${(transaction.cash_back + transaction.points * 0.01).toFixed(2)}
            </Text>
          </View>
        ) : (
          <View style={styles.suboptimalBadge}>
            <Text style={styles.suboptimalBadgeText}>
              ⚠️ Could have saved ${transaction.missed_value.toFixed(2)} with {transaction.card_recommended}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyText}>
        Start using the app to track your transactions and see your history here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>{transactions.length} transactions</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summarySection}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Saved</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>
            ${totalSaved.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Missed Value</Text>
          <Text style={[styles.statValue, { color: '#FF5252' }]}>
            ${totalMissed.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Time Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'today', 'week', 'month'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}

          {/* Insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.insightsSectionTitle}>📊 Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                • You made {transactions.filter((t) => t.optimal).length} optimal decisions this week ({((transactions.filter((t) => t.optimal).length / transactions.length) * 100).toFixed(0)}%)
              </Text>
              <Text style={styles.insightText}>
                • Amex Gold is your most-used card
              </Text>
              <Text style={styles.insightText}>
                • You could save an extra ${totalMissed.toFixed(2)}/week by following all recommendations
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  summarySection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItemSuboptimal: {
    borderLeftColor: '#FF9800',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardUsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardUsedLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  cardUsedName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  optimalBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  optimalBadgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  suboptimalBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  suboptimalBadgeText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  insightsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});