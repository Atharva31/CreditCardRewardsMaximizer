/**
 * TransactionModal.js - FIXED VERSION
 * Now properly displays ALL user cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

export const TransactionModal = ({
  visible,
  onClose,
  merchant,
  userCards,
  userId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // Debug: Log when cards change
  useEffect(() => {
    console.log('TransactionModal received cards:', userCards?.length || 0);
    if (userCards && userCards.length > 0) {
      userCards.forEach((card, index) => {
        console.log(`Card ${index + 1}:`, card.card_name, card.card_id);
      });
    }
  }, [userCards]);

  // Reset when merchant changes
  useEffect(() => {
    if (merchant && visible) {
      setAmount('');
      setSelectedCardId('');
      setRecommendation(null);
    }
  }, [merchant, visible]);

  // Get AI recommendation when amount is entered
  const getRecommendation = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          merchant: merchant?.name,
          amount: parseFloat(amount),
          category: merchant?.category?.toLowerCase(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendation');

      const data = await response.json();
      setRecommendation(data);
      
      // Auto-select the recommended card
      if (data.recommended_card?.card_name) {
        const recommendedCard = userCards.find(
          (c) => c.card_name === data.recommended_card.card_name
        );
        if (recommendedCard) {
          setSelectedCardId(recommendedCard.card_id);
        }
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      Alert.alert('Error', 'Could not get card recommendation');
    } finally {
      setLoading(false);
    }
  };

  // Submit transaction
  const submitTransaction = async () => {
    if (!selectedCardId) {
      Alert.alert('No Card Selected', 'Please select a card');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/transactions/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          merchant: merchant?.name,
          amount: parseFloat(amount),
          category: merchant?.category?.toLowerCase(),
          card_id: selectedCardId,
          location: merchant?.distance,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit transaction');

      const result = await response.json();

      // Show success message with rewards earned
      Alert.alert(
        'Transaction Recorded! 🎉',
        `You earned ${result.rewards_earned || 0} ${result.reward_type || 'rewards'}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess(); // Refresh data
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting transaction:', error);
      Alert.alert('Error', 'Could not submit transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!merchant) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.merchantName}>{merchant.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.merchantDetails}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{merchant.category}</Text>
            </View>
            <Text style={styles.distance}>{merchant.distance}</Text>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Amount Spent</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  autoFocus={true}
                />
              </View>
              
              {amount && parseFloat(amount) > 0 && !recommendation && (
                <TouchableOpacity
                  style={styles.getRecommendationButton}
                  onPress={getRecommendation}
                  disabled={loading}
                >
                  <Text style={styles.getRecommendationButtonText}>
                    {loading ? 'Getting recommendation...' : 'Get Best Card 🤖'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* AI Recommendation */}
            {recommendation && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>
                  🎯 AI Recommendation
                </Text>
                <Text style={styles.recommendedCardName}>
                  {recommendation.recommended_card.card_name}
                </Text>
                <Text style={styles.estimatedValue}>
                  {recommendation.recommended_card.estimated_value}
                </Text>
                <Text style={styles.reason}>
                  {recommendation.recommended_card.reason}
                </Text>
              </View>
            )}

            {/* Card Selection - FIXED */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Select Card Used ({userCards?.length || 0} cards)
              </Text>
              
              {!userCards || userCards.length === 0 ? (
                <View style={styles.noCardsContainer}>
                  <Text style={styles.noCardsText}>
                    No cards found. Add a card to your wallet first.
                  </Text>
                </View>
              ) : (
                <View style={styles.cardsContainer}>
                  {userCards.map((card, index) => {
                    console.log('Rendering card:', card.card_name);
                    return (
                      <TouchableOpacity
                        key={card.card_id || `card-${index}`}
                        style={[
                          styles.cardOption,
                          selectedCardId === card.card_id && styles.cardOptionSelected,
                        ]}
                        onPress={() => {
                          console.log('Selected card:', card.card_name);
                          setSelectedCardId(card.card_id);
                        }}
                      >
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardName}>{card.card_name}</Text>
                          <Text style={styles.cardIssuer}>{card.issuer}</Text>
                        </View>
                        {selectedCardId === card.card_id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedCardId || !amount || loading) && styles.submitButtonDisabled,
              ]}
              onPress={submitTransaction}
              disabled={!selectedCardId || !amount || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Record Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  merchantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  merchantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  badge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    maxHeight: 450,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  getRecommendationButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  getRecommendationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
  },
  recommendedCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  estimatedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardsContainer: {
    // Container for all cards
  },
  cardOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardOptionSelected: {
    backgroundColor: '#E8F4FD',
    borderColor: '#4A90E2',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardIssuer: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  noCardsContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  noCardsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionModal;
