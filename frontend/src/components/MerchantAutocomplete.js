import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';

export default function MerchantAutocomplete({
  value,
  onMerchantSelect,
  onCategorySelect,
  apiUrl,
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSelectingMerchant, setIsSelectingMerchant] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const loadAllMerchants = async () => {
    // Don't search if we're in the middle of selecting a merchant
    if (isSelectingMerchant) return;

    setLoading(true);

    try {
      // Load all merchants (no query parameter)
      const response = await fetch(`${apiUrl}/api/v1/merchants`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data || []);
      } else {
        console.error('Merchant load error:', response.status);
        setResults([]);
      }
    } catch (error) {
      console.error('Merchant load error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMerchants = async (searchQuery) => {
    // Don't search if we're in the middle of selecting a merchant
    if (isSelectingMerchant) return;
    
    // If empty query, show all merchants
    if (!searchQuery || searchQuery.trim() === '') {
      loadAllMerchants();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/merchants/search?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setResults(data || []);
      } else {
        console.error('Merchant search error:', response.status);
        setResults([]);
      }
    } catch (error) {
      console.error('Merchant search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text) => {
    setQuery(text);
    setIsSelectingMerchant(false);
    setShowResults(true);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce search - search even with empty text to show all
    debounceTimer.current = setTimeout(() => {
      searchMerchants(text);
    }, 300);
  };

  const handleSelectMerchant = (merchant) => {
    // Set flag immediately to prevent blur from interfering
    setIsSelectingMerchant(true);
    setQuery(merchant.merchant_name);
    setShowResults(false);
    setResults([]);
    
    // Notify parent components
    if (onMerchantSelect) {
      onMerchantSelect(merchant.merchant_name);
    }
    if (onCategorySelect && merchant.primary_category) {
      onCategorySelect(merchant.primary_category);
    }
    
    Keyboard.dismiss();
    
    // Reset flag after a short delay
    setTimeout(() => {
      setIsSelectingMerchant(false);
    }, 500);
  };

  const handleFocus = () => {
    // Don't show results if we just selected a merchant
    if (isSelectingMerchant) return;
    
    setShowResults(true);
    
    // Always load merchants when focusing
    // If there's a query, search for it; otherwise show all
    if (query && query.trim() !== '') {
      searchMerchants(query);
    } else {
      loadAllMerchants();
    }
  };

  const handleBlur = () => {
    // Don't hide if we're selecting a merchant
    if (isSelectingMerchant) return;
    
    // Delay hiding results to allow tap on result
    setTimeout(() => {
      if (!isSelectingMerchant) {
        setShowResults(false);
        setResults([]);
      }
    }, 150);
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      dining: '🍽️',
      travel: '✈️',
      groceries: '🛒',
      gas: '⛽',
      entertainment: '🎬',
      shopping: '�️',
      other: '📦',
    };
    return emojiMap[category] || '📦';
  };

  const shouldShowResults = showResults && !isSelectingMerchant;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="e.g., Starbucks, Amazon, Whole Foods"
        value={query}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={() => {
          // Handle Enter key
          if (results.length > 0) {
            // Select first result from filtered list
            handleSelectMerchant(results[0]);
          } else {
            // No results - just close dropdown and keep typed text
            setShowResults(false);
            setResults([]);
            Keyboard.dismiss();
            
            // Still notify parent with typed text (manual entry)
            if (query.trim() && onMerchantSelect) {
              onMerchantSelect(query.trim());
            }
          }
        }}
        placeholderTextColor="#999"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />

      {/* Results Dropdown - Show when focused */}
      {shouldShowResults && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading merchants...</Text>
            </View>
          ) : results.length > 0 ? (
            <ScrollView 
              style={styles.resultsScrollView}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {results.slice(0, 50).map((merchant, index) => (
                <TouchableOpacity
                  key={`${merchant.merchant_id}-${index}`}
                  style={styles.resultItem}
                  onPress={() => handleSelectMerchant(merchant)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultContent}>
                    <Text style={styles.merchantEmoji}>
                      {getCategoryEmoji(merchant.primary_category)}
                    </Text>
                    <View style={styles.merchantInfo}>
                      <Text style={styles.merchantName}>{merchant.merchant_name}</Text>
                      <Text style={styles.merchantCategory}>
                        {merchant.primary_category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {results.length > 50 && (
                <View style={styles.moreResultsHint}>
                  <Text style={styles.moreResultsText}>
                    + {results.length - 50} more merchants
                  </Text>
                  <Text style={styles.moreResultsSubtext}>
                    Keep typing to narrow results
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No merchants found</Text>
              <Text style={styles.noResultsHint}>
                {query ? 'Try a different search' : 'No merchants available'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

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
  resultsContainer: {
    position: 'absolute',
    top: 55, // Just below the input
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  resultsScrollView: {
    // ScrollView for results - avoids nested VirtualizedLists warning
    maxHeight: 250,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  merchantEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  merchantCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  noResultsHint: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 4,
  },
  moreResultsHint: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  moreResultsText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  moreResultsSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
