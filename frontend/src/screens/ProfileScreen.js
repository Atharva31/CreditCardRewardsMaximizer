import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';

// Optimization goal options
const OPTIMIZATION_GOALS = [
  { value: 'cash_back', label: 'Cash Back' },
  { value: 'travel_points', label: 'Travel Points' },
  { value: 'specific_discounts', label: 'Specific Discounts' },
  { value: 'balanced', label: 'Balanced' },
];

// Accept the 'onLogout' prop passed from App.js
export default function ProfileScreen({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (userId) {
        const profileResponse = await API.getUserProfile(userId);
        setProfile(profileResponse.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const updateOptimizationGoal = async (newGoal) => {
    setUpdating(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        await API.updateUserProfile(userId, {
          default_optimization_goal: newGoal
        });
        // Update local state
        setProfile(prev => ({
          ...prev,
          default_optimization_goal: newGoal
        }));
        setShowGoalPicker(false);
        Alert.alert('Success', 'Optimization goal updated successfully');
      }
    } catch (error) {
      console.error('Error updating optimization goal:', error);
      Alert.alert('Error', 'Failed to update optimization goal');
    } finally {
      setUpdating(false);
    }
  };

  const getGoalLabel = (value) => {
    const goal = OPTIMIZATION_GOALS.find(g => g.value === value);
    return goal ? goal.label : value?.replace('_', ' ').toUpperCase() || 'Not Set';
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0][0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile ? getInitials(profile.full_name) : 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>
                {profile?.full_name || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {profile?.email || ''}
              </Text>
            </View>

            {profile && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profile.email}</Text>
                </View>
                {profile.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={() => setShowGoalPicker(true)}
                >
                  <Text style={styles.infoLabel}>Optimization Goal</Text>
                  <View style={styles.editableValue}>
                    <Text style={styles.infoValue}>
                      {getGoalLabel(profile.default_optimization_goal)}
                    </Text>
                    <Text style={styles.editIcon}>Edit</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Goal Picker Modal */}
            <Modal
              visible={showGoalPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowGoalPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Optimization Goal</Text>
                  {OPTIMIZATION_GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal.value}
                      style={[
                        styles.goalOption,
                        profile?.default_optimization_goal === goal.value && styles.selectedGoal
                      ]}
                      onPress={() => updateOptimizationGoal(goal.value)}
                      disabled={updating}
                    >
                      <Text style={[
                        styles.goalOptionText,
                        profile?.default_optimization_goal === goal.value && styles.selectedGoalText
                      ]}>
                        {goal.label}
                      </Text>
                      {profile?.default_optimization_goal === goal.value && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowGoalPicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  {updating && (
                    <ActivityIndicator style={styles.modalLoader} color="#4A90E2" />
                  )}
                </View>
              </View>
            </Modal>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#4A90E2', padding: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1 },
  userSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff' },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#666' },
  logoutButton: {
    backgroundColor: '#fff',
    borderColor: '#E74C3C',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 12,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  goalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F7FA',
  },
  selectedGoal: {
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  goalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGoalText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalLoader: {
    marginTop: 10,
  },
});