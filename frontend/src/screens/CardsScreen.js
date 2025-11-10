// src/screens/CardsScreen.js - Complete with Add Card Modal
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CardsScreen({ navigation }) {
  const [cards, setCards] = useState([
    { 
      id: '1', 
      name: 'Chase Sapphire Preferred', 
      type: 'Visa',
      rewards: '3x travel, 2x dining',
      cashBackRate: 0,
      pointsMultiplier: 3,
    },
    { 
      id: '2', 
      name: 'Citi Double Cash', 
      type: 'Mastercard',
      rewards: '2% everything',
      cashBackRate: 2,
      pointsMultiplier: 0,
    },
    { 
      id: '3', 
      name: 'Amex Gold', 
      type: 'Amex',
      rewards: '4x dining, 4x groceries',
      cashBackRate: 0,
      pointsMultiplier: 4,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    type: 'Visa',
    rewards: '',
  });

  // Handle adding a new card
  const handleAddCard = () => {
    if (!newCard.name.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    const card = {
      id: Date.now().toString(),
      name: newCard.name,
      type: newCard.type,
      rewards: newCard.rewards || 'Standard rewards',
      cashBackRate: 1.5, // Default
      pointsMultiplier: 1, // Default
    };

    setCards([...cards, card]);
    setShowAddModal(false);
    
    // Reset form
    setNewCard({ name: '', type: 'Visa', rewards: '' });
    
    Alert.alert('Success', `${card.name} added to your wallet!`);
  };

  // Handle deleting a card
  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(card => card.id !== cardId));
          },
        },
      ]
    );
  };

  const CardItem = ({ card }) => (
    <TouchableOpacity 
      style={styles.cardItem}
      onLongPress={() => handleDeleteCard(card.id)}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>💳</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardType}>{card.type}</Text>
        <Text style={styles.cardRewards}>{card.rewards}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🃏</Text>
      <Text style={styles.emptyTitle}>No Cards Yet</Text>
      <Text style={styles.emptyText}>
        Add your first credit card to start getting personalized recommendations
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.emptyButtonText}>+ Add Your First Card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Cards</Text>
          <Text style={styles.subtitle}>{cards.length} card{cards.length !== 1 ? 's' : ''} in wallet</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Card</Text>
        </TouchableOpacity>
      </View>

      {/* Cards List or Empty State */}
      {cards.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={cards}
          renderItem={({ item }) => <CardItem card={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Card</Text>
                <TouchableOpacity 
                  onPress={() => setShowAddModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Card Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Chase Sapphire Preferred"
                  value={newCard.name}
                  onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                  autoCapitalize="words"
                />
              </View>

              {/* Card Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Type</Text>
                <View style={styles.cardTypeRow}>
                  {['Visa', 'Mastercard', 'Amex', 'Discover'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newCard.type === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewCard({ ...newCard, type })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          newCard.type === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rewards Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rewards (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. 3x points on travel, 2x on dining"
                  value={newCard.rewards}
                  onChangeText={(text) => setNewCard({ ...newCard, rewards: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Tip: You can edit reward categories later by tapping on the card
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddCard}
              >
                <Text style={styles.submitButtonText}>Add Card</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help Text */}
      {cards.length > 0 && (
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            💡 Long press on a card to delete it
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  header: { 
    backgroundColor: '#4A90E2', 
    padding: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  addButtonText: { 
    color: '#4A90E2', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  list: { 
    padding: 20 
  },
  cardItem: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 4 
  },
  cardType: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 4 
  },
  cardRewards: { 
    fontSize: 13, 
    color: '#4A90E2', 
    fontWeight: '500' 
  },
  
  // Empty State
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
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  cardTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  helpBox: {
    padding: 16,
    backgroundColor: '#E3F2FD',
    margin: 20,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
});