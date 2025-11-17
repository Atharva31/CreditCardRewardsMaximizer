// src/screens/CardsScreen.js - Updated for UserCreditCard/Wallet system
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';

export default function CardsScreen() {
  const [userId, setUserId] = useState(null);
  const [walletCards, setWalletCards] = useState([]);
  const [libraryCards, setLibraryCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('All');

  const [editFormData, setEditFormData] = useState({
    nickname: '',
    last_four_digits: '',
    credit_limit: '',
  });

  // Load user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    loadUserId();
  }, []);

  // Convert API response to UI format
  const walletCardToUi = useCallback((c) => {
    return {
      id: c?.user_card_id ?? String(Math.random()),
      userCardId: c?.user_card_id,
      cardId: c?.card_id,
      name: c?.nickname || c?.card_name || 'Card',
      cardName: c?.card_name,
      issuer: c?.issuer ?? 'Unknown',
      lastFour: c?.last_four_digits,
      creditLimit: c?.credit_limit,
      balance: c?.current_balance,
      isActive: c?.is_active,
      annualFee: c?.annual_fee,
      benefits: c?.benefits || [],
      cashBackRate: c?.cash_back_rate || {},
      pointsMultiplier: c?.points_multiplier || {},
      _raw: c,
    };
  }, []);

  const libraryCardToUi = useCallback((c) => {
    const benefitsText = Array.isArray(c?.benefits) && c.benefits.length > 0
      ? c.benefits.slice(0, 2).join(', ')
      : 'Standard rewards';

    return {
      id: c?.card_id ?? String(Math.random()),
      cardId: c?.card_id,
      name: c?.card_name ?? 'Card',
      issuer: c?.issuer ?? 'Unknown',
      annualFee: c?.annual_fee ?? 0,
      benefits: c?.benefits || [],
      benefitsPreview: benefitsText,
      cashBackRate: c?.cash_back_rate || {},
      pointsMultiplier: c?.points_multiplier || {},
      _raw: c,
    };
  }, []);

  // Fetch wallet cards
  const fetchWalletCards = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await API.getWalletCards(userId);
      const list = Array.isArray(response.data) ? response.data : [];
      setWalletCards(list.map(walletCardToUi));
      setErrorMsg(null);
    } catch (err) {
      console.error('Error fetching wallet cards:', err);
      setWalletCards([]);

      if (err.response?.status === 404) {
        setErrorMsg(null); // No error for empty state
      } else {
        setErrorMsg('Could not load wallet. Pull down to retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, walletCardToUi]);

  // Fetch library cards
  const fetchLibraryCards = useCallback(async () => {
    try {
      const response = await API.getCardLibrary({ limit: 100 });
      const list = Array.isArray(response.data) ? response.data : [];
      setLibraryCards(list.map(libraryCardToUi));
    } catch (err) {
      console.error('Error fetching library:', err);
      Alert.alert('Error', 'Could not load card library');
    }
  }, [libraryCardToUi]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchWalletCards();
    } finally {
      setRefreshing(false);
    }
  }, [fetchWalletCards]);

  useEffect(() => {
    fetchWalletCards();
  }, [fetchWalletCards]);

  // Add card from library to wallet
  const handleAddCardToWallet = useCallback(async (libraryCard) => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    Alert.prompt(
      'Add to Wallet',
      `Add ${libraryCard.name} to your wallet?\n\nOptional: Enter a nickname for this card`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (nickname) => {
            setSubmitting(true);
            try {
              const payload = {
                card_id: libraryCard.cardId,
                nickname: nickname?.trim() || null,
                last_four_digits: null,
                credit_limit: null,
              };

              await API.addCardToWallet(userId, payload);

              setShowLibraryModal(false);
              await fetchWalletCards();

              Alert.alert('Success', `${libraryCard.name} added to your wallet!`);
            } catch (error) {
              console.error('Error adding card:', error);
              const message = error.response?.data?.detail || error.message || 'Could not add card';
              Alert.alert('Error', message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  }, [userId, fetchWalletCards]);

  // Open edit modal
  const handleEditCard = useCallback((card) => {
    setSelectedCard(card);
    setEditFormData({
      nickname: card.name === card.cardName ? '' : card.name,
      last_four_digits: card.lastFour || '',
      credit_limit: card.creditLimit ? String(card.creditLimit) : '',
    });
    setShowEditModal(true);
  }, []);

  // Update wallet card
  const handleUpdateCard = useCallback(async () => {
    if (!selectedCard) return;

    setSubmitting(true);
    try {
      const payload = {};

      if (editFormData.nickname?.trim()) {
        payload.nickname = editFormData.nickname.trim();
      }

      if (editFormData.last_four_digits?.trim()) {
        const digits = editFormData.last_four_digits.trim();
        if (digits.length === 4 && /^\d+$/.test(digits)) {
          payload.last_four_digits = digits;
        } else {
          Alert.alert('Error', 'Last 4 digits must be exactly 4 numbers');
          setSubmitting(false);
          return;
        }
      }

      if (editFormData.credit_limit?.trim()) {
        const limit = parseFloat(editFormData.credit_limit.trim());
        if (!isNaN(limit) && limit >= 0) {
          payload.credit_limit = limit;
        }
      }

      await API.updateWalletCard(selectedCard.userCardId, payload);

      setShowEditModal(false);
      setSelectedCard(null);
      await fetchWalletCards();

      Alert.alert('Success', 'Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Could not update card');
    } finally {
      setSubmitting(false);
    }
  }, [selectedCard, editFormData, fetchWalletCards]);

  // Delete wallet card
  const handleDeleteCard = useCallback((card) => {
    Alert.alert(
      'Remove Card',
      `Remove ${card.name} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.deleteWalletCard(card.userCardId, false); // Soft delete
              await fetchWalletCards();
              Alert.alert('Removed', 'Card removed from wallet');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Could not remove card');
            }
          },
        },
      ]
    );
  }, [fetchWalletCards]);

  // Filter library cards
  const filteredLibraryCards = useMemo(() => {
    let filtered = libraryCards;

    if (selectedIssuer && selectedIssuer !== 'All') {
      filtered = filtered.filter(c => c.issuer === selectedIssuer);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.issuer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [libraryCards, selectedIssuer, searchQuery]);

  // Get unique issuers from library
  const issuers = useMemo(() => {
    const unique = new Set(libraryCards.map(c => c.issuer));
    return ['All', ...Array.from(unique).sort()];
  }, [libraryCards]);

  // Wallet Card Item
  const WalletCardItem = ({ card }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => handleEditCard(card)}
      onLongPress={() => handleDeleteCard(card)}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>💳</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardName}>
          {card.name}
          {card.lastFour && <Text style={styles.lastFour}> •••• {card.lastFour}</Text>}
        </Text>
        <Text style={styles.cardIssuer}>{card.issuer}</Text>
        {card.creditLimit && (
          <Text style={styles.cardLimit}>Limit: ${card.creditLimit.toLocaleString()}</Text>
        )}
      </View>
      <Text style={styles.editIcon}>✏️</Text>
    </TouchableOpacity>
  );

  // Library Card Item
  const LibraryCardItem = ({ card }) => (
    <TouchableOpacity
      style={styles.libraryCardItem}
      onPress={() => handleAddCardToWallet(card)}
    >
      <View style={styles.cardDetails}>
        <Text style={styles.libraryCardName}>{card.name}</Text>
        <Text style={styles.libraryCardIssuer}>{card.issuer}</Text>
        <Text style={styles.libraryCardFee}>
          Annual Fee: ${card.annualFee}
        </Text>
        <Text style={styles.libraryCardBenefits} numberOfLines={2}>
          {card.benefitsPreview}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addToWalletButton}
        onPress={() => handleAddCardToWallet(card)}
      >
        <Text style={styles.addToWalletText}>+ Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🃏</Text>
      <Text style={styles.emptyTitle}>No Cards in Wallet</Text>
      <Text style={styles.emptyText}>
        Browse the card library and add cards to your wallet
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => {
          fetchLibraryCards();
          setShowLibraryModal(true);
        }}
      >
        <Text style={styles.emptyButtonText}>📚 Browse Card Library</Text>
      </TouchableOpacity>
    </View>
  );

  const cardCountText = useMemo(() => {
    const n = walletCards.length;
    return `${n} card${n !== 1 ? 's' : ''} in wallet`;
  }, [walletCards.length]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Wallet</Text>
          <Text style={styles.subtitle}>{cardCountText}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            fetchLibraryCards();
            setShowLibraryModal(true);
          }}
        >
          <Text style={styles.addButtonText}>📚 Browse</Text>
        </TouchableOpacity>
      </View>

      {/* Error banner */}
      {!!errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Loading / List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: '#666' }}>Loading wallet...</Text>
        </View>
      ) : walletCards.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={walletCards}
          renderItem={({ item }) => <WalletCardItem card={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Card Library Modal */}
      <Modal
        visible={showLibraryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLibraryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Card Library ({filteredLibraryCards.length})</Text>
              <TouchableOpacity
                onPress={() => setShowLibraryModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Issuer Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {issuers.map((issuer) => (
                <TouchableOpacity
                  key={issuer}
                  style={[
                    styles.filterButton,
                    selectedIssuer === issuer && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedIssuer(issuer)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedIssuer === issuer && styles.filterButtonTextActive,
                    ]}
                  >
                    {issuer}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Library Cards List */}
            <FlatList
              data={filteredLibraryCards}
              renderItem={({ item }) => <LibraryCardItem card={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.libraryList}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Card</Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={styles.closeButton}
                  disabled={submitting}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedCard && (
                <View style={styles.cardInfoBox}>
                  <Text style={styles.cardInfoTitle}>{selectedCard.cardName}</Text>
                  <Text style={styles.cardInfoSubtitle}>{selectedCard.issuer}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nickname (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. My Travel Card"
                  value={editFormData.nickname}
                  onChangeText={(text) => setEditFormData({ ...editFormData, nickname: text })}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last 4 Digits (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234"
                  value={editFormData.last_four_digits}
                  onChangeText={(text) => setEditFormData({ ...editFormData, last_four_digits: text })}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Credit Limit (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15000"
                  value={editFormData.credit_limit}
                  onChangeText={(text) => setEditFormData({ ...editFormData, credit_limit: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleUpdateCard}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Updating...' : 'Update Card'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {!loading && walletCards.length > 0 && (
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            💡 Tap to edit • Long press to remove
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  addButton: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#4A90E2', fontSize: 14, fontWeight: 'bold' },
  list: { padding: 20 },
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
  cardIconText: { fontSize: 24 },
  cardDetails: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  lastFour: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  cardIssuer: { fontSize: 13, color: '#666', marginBottom: 4 },
  cardLimit: { fontSize: 12, color: '#4A90E2', fontWeight: '500' },
  editIcon: { fontSize: 20, marginLeft: 8 },

  // Library card
  libraryCardItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  libraryCardName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  libraryCardIssuer: { fontSize: 13, color: '#666', marginBottom: 4 },
  libraryCardFee: { fontSize: 12, color: '#FF6B6B', marginBottom: 4 },
  libraryCardBenefits: { fontSize: 11, color: '#4A90E2', marginTop: 4 },
  addToWalletButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  addToWalletText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Empty/Error
  errorBox: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: '#C62828', fontSize: 14 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
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
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Modal
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
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 20, color: '#666' },

  // Search & Filter
  searchInput: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
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
  libraryList: {
    paddingBottom: 20,
  },

  // Edit form
  cardInfoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardInfoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
