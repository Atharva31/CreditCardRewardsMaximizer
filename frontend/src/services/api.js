// src/services/api.js - CORRECTED: Backend doesn't use /api/v1 prefix

import axios from 'axios';

// 🔥 UPDATE THIS with your current tunnel URL from Terminal 2!
// NOTE: Backend doesn't use /api/v1 prefix, so we don't add it!
const API_BASE_URL = 'https://hip-wolves-yell.loca.lt/api/v1';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📡 API Configuration');
console.log('Base URL:', API_BASE_URL);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',  // Skip localtunnel warning page
  },
  timeout: 30000, // 30 seconds (tunnels can be slow)
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const fullURL = config.baseURL + config.url;
    console.log('→ Making request to:', fullURL);
    console.log('→ Method:', config.method?.toUpperCase());
    console.log('→ Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Success:', response.status, response.config.url);
    console.log('✅ Data:', response.data);
    return response;
  },
  (error) => {
    const fullURL = error.config?.baseURL + error.config?.url;
    console.error('❌ Request failed');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ URL:', fullURL);
    console.error('❌ Error:', error.response?.data);
    return Promise.reject(error);
  }
);

export const API = {
  // Get AI recommendation for a transaction
  getRecommendation: async (transactionData) => {
    try {
      console.log('🤖 Getting recommendation...');
      const response = await api.post('/recommend', transactionData);
      console.log('✨ Recommendation received!');
      return response;
    } catch (error) {
      console.error('Failed to get recommendation');
      throw error;
    }
  },

  // Save transaction to database
  saveTransaction: async (transactionRecord) => {
    try {
      console.log('💾 Saving transaction...');
      const response = await api.post('/transactions', transactionRecord);
      console.log('✅ Transaction saved!');
      return response;
    } catch (error) {
      console.error('Failed to save transaction');
      // Don't throw - we don't want to block the user if saving fails
      return null;
    }
  },

  // Get all transactions for history
  getTransactions: async (userId = 'user123', filters = {}) => {
    try {
      console.log('📜 Getting transactions...');
      const params = {
        user_id: userId,
        ...filters,
      };
      const response = await api.get('/transactions', { params });
      console.log(`✅ Found ${response.data.length} transactions`);
      return response.data;
    } catch (error) {
      console.error('Failed to get transactions');
      throw error;
    }
  },

  // Get user stats (total saved, transaction count, etc.)
  getUserStats: async (userId = 'user123') => {
    try {
      console.log('📊 Getting stats...');
      const response = await api.get(`/users/${userId}/stats`);
      console.log('✅ Stats received!');
      return response.data;
    } catch (error) {
      console.error('Failed to get stats');
      throw error;
    }
  },

  // Get all cards for user
  getCards: async (userId = 'user123') => {
    try {
      console.log('🃏 Getting cards...');
      const response = await api.get('/cards', {
        params: { user_id: userId }
      });
      console.log(`✅ Found ${response.data.length} cards`);
      return response.data;
    } catch (error) {
      console.error('Failed to get cards');
      throw error;
    }
  },

  // Add a new card
  addCard: async (cardData) => {
    try {
      console.log('➕ Adding card...');
      const response = await api.post('/cards', cardData);
      console.log('✅ Card added!');
      return response.data;
    } catch (error) {
      console.error('Failed to add card');
      throw error;
    }
  },

  // Delete a card
  deleteCard: async (cardId) => {
    try {
      console.log('🗑️  Deleting card...');
      const response = await api.delete(`/cards/${cardId}`);
      console.log('✅ Card deleted!');
      return response.data;
    } catch (error) {
      console.error('Failed to delete card');
      throw error;
    }
  },
};

export default API;