import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

/**
 * MerchantAutocomplete Component
 * 
 * Provides autocomplete functionality for merchant search with:
 * - Debounced search (300ms delay)
 * - Dropdown with merchant results
 * - Logo display
 * - Auto-category selection
 * 
 * Props:
 * - onMerchantSelect: Callback when merchant is selected
 * - onCategorySelect: Callback when category should be auto-selected
 * - value: Initial/controlled value for the input
 * - apiUrl: Base API URL (default: http://localhost:8000)
 */
const MerchantAutocomplete = ({ 
  onMerchantSelect, 
  onCategorySelect, 
  value,
  apiUrl = 'http://localhost:8000' // Change this for production
}) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [merchants, setMerchants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchMerchants(searchQuery);
      } else {
        setMerchants([]);
        setShowDropdown(false);
        setLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update search query when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  /**
   * Search merchants via API
   */
  const searchMerchants = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/v1/merchants/search?q=${encodeURIComponent(query)}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search merchants');
      }
      
      const data = await response.json();
      setMerchants(data);
      setShowDropdown(data.length > 0);
    } catch (error) {
      console.error('Error searching merchants:', error);
      setMerchants([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle merchant selection from dropdown
   */
  const handleMerchantSelect = (merchant) => {
    setSearchQuery(merchant.merchant_name);
    setShowDropdown(false);
    setMerchants([]);
    Keyboard.dismiss();
    
    // Notify parent components
    if (onMerchantSelect) {
      onMerchantSelect(merchant.merchant_name);
    }
    if (onCategorySelect) {
      onCategorySelect(merchant.primary_category);
    }
  };

  /**
   * Handle text input change
   */
  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setShowDropdown(false);
    }
    // Notify parent of manual text entry
    if (onMerchantSelect) {
      onMerchantSelect(text);
    }
  };

  /**
   * Render merchant logo or placeholder
   */
  const renderLogo = (merchant) => {
    if (merchant.logo_url) {
      return (
        <Image
          source={{ uri: merchant.logo_url }}
          style={styles.logo}
          onError={() => {
            // Fallback to placeholder on error
            console.log('Logo failed to load:', merchant.logo_url);
          }}
        />
      );
    }
    
    // Placeholder with first letter
    return (
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoPlaceholderText}>
          {merchant.merchant_name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="e.g., Starbucks, Amazon, Whole Foods"
        value={searchQuery}
        onChangeText={handleTextChange}
        onFocus={() => 
          searchQuery.length >= 2 && 
          merchants.length > 0 && 
          setShowDropdown(true)
        }
        autoCapitalize="words"
        autoCorrect={false}
        placeholderTextColor="#999"
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
        </View>
      )}
      
      {showDropdown && !loading && (
        <View style={styles.dropdown}>
          <FlatList
            data={merchants}
            keyExtractor={(item) => item.merchant_id.toString()}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleMerchantSelect(item)}
              >
                {renderLogo(item)}
                <View style={styles.merchantInfo}>
                  <Text style={styles.merchantName}>
                    {item.merchant_name}
                  </Text>
                  <Text style={styles.merchantCategory}>
                    {item.primary_category.charAt(0).toUpperCase() + 
                     item.primary_category.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No merchants found</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loadingContainer: {
    position: 'absolute',
    right: 12,
    top: 15,
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 4,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  merchantCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});

export default MerchantAutocomplete;
