import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const API_URL = __DEV__ ? 'http://10.0.2.2:5000' : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All', 'Musical', 'Drama', 'Comedy', 'Opera'];

const SORT_OPTIONS = [
  { label: 'Date', value: 'date' },
  { label: 'Title', value: 'title' },
  { label: 'Venue', value: 'venue' },
];

export default function AllShowsScreen({ onBack, onNavigateShow, onNavigateProfile }) {
  const { colors } = useTheme();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/api/shows`);
        if (!res) return;
        if (!res.ok) throw new Error('Failed to load shows');
        const data = await res.json();

        // Deduplicate by production_id — keep earliest show per production
        const unique = Object.values(
          data.reduce((acc, item) => {
            if (!acc[item.production_id]) {
              acc[item.production_id] = item;
            } else {
              // keep the one with the nearest date
              if (new Date(item.show_date) < new Date(acc[item.production_id].show_date)) {
                acc[item.production_id] = item;
              }
            }
            return acc;
          }, {})
        );
        setShows(unique);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtering and sorting for search, category, and sort options
  const filtered = shows
    .filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.venue_name?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === 'All' || item.genre === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.show_date) - new Date(b.show_date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'venue') return (a.venue_name ?? '').localeCompare(b.venue_name ?? '');
      return 0;
    });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Skeleton shimmer
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  const SkeletonCard = () => (
    <Animated.View style={[s.card, s.skeletonCard, { opacity: shimmerOpacity }]}>
      <View style={[s.cardImage, s.skeletonBlock]} />
      <View style={s.cardBody}>
        <View style={[s.skeletonLine, { width: 70, height: 16, borderRadius: 999 }]} />
        <View style={[s.skeletonLine, { width: '80%', height: 15, marginTop: 8 }]} />
        <View style={[s.skeletonLine, { width: '55%', height: 12, marginTop: 6 }]} />
        <View style={[s.skeletonLine, { width: '65%', height: 12, marginTop: 4 }]} />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>All Shows</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search */}
      <View style={s.searchWrapper}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.placeholder} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search shows, venues, cities..."
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre pills */}
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillsList}
        contentContainerStyle={s.pillsRow}
        renderItem={({ item }) => {
          const active = item === activeCategory;
          return (
            <TouchableOpacity
              style={[s.pill, active ? s.pillActive : s.pillInactive]}
              onPress={() => setActiveCategory(item)}
              activeOpacity={0.8}
            >
              <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Sort row */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[s.sortChip, sortBy === opt.value && s.sortChipActive]}
            onPress={() => setSortBy(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={[s.sortChipText, sortBy === opt.value && s.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={s.resultCount}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={() => <SkeletonCard />}
        />
      ) : error ? (
        <Text style={s.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.production_id)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={s.emptyText}>No shows match your search.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.88}
              onPress={() => onNavigateShow?.(item)}
            >
              <Image source={{ uri: item.image_url }} style={s.cardImage} />
              <View style={s.cardBody}>
                <View style={s.cardTopRow}>
                  <View style={s.genrePill}>
                    <Text style={s.genreText}>{item.genre}</Text>
                  </View>
                  {item.is_trending ? (
                    <View style={s.trendingBadge}>
                      <Ionicons name="flame" size={10} color="#fff" />
                      <Text style={s.trendingBadgeText}>HOT</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.cardMetaRow}>
                  <Ionicons name="location-outline" size={12} color={colors.venueSubtext} />
                  <Text style={s.cardMeta} numberOfLines={1}>{item.venue_name}</Text>
                </View>
                <View style={s.cardMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.venueSubtext} />
                  <Text style={s.cardMeta}>
                    {formatDate(item.show_date)} · {formatTime(item.show_time)}
                  </Text>
                </View>
                <View style={s.seatsRow}>
                  <Ionicons name="ticket-outline" size={12} color={item.available_seats === 0 ? '#e53e3e' : '#22c55e'} />
                  <Text style={[s.seatsText, item.available_seats === 0 && s.seatsTextFull]}>
                    {item.available_seats === 0 ? 'Sold out' : `${item.available_seats} seats left`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.navInactive} style={s.cardChevron} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: 'Discover', icon: 'compass-outline', onPress: onBack },
          { label: 'Profile', icon: 'person-outline', onPress: onNavigateProfile },
        ].map((tab) => (
          <TouchableOpacity key={tab.label} style={s.navTab} onPress={tab.onPress}>
            <Ionicons name={tab.icon} size={22} color={colors.navInactive} />
            <Text style={[s.navLabel, { color: colors.navInactive }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.pillInactiveBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.sectionTitle,
    },

    // Search
    searchWrapper: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.inputText,
    },

    // Pills
    pillsList: {
      flexGrow: 0,
      flexShrink: 0,
    },
    pillsRow: {
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 4,
      marginBottom: 10,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 999,
    },
    pillActive: { backgroundColor: colors.pillActiveBg },
    pillInactive: {
      backgroundColor: colors.pillInactiveBg,
      borderWidth: 1,
      borderColor: colors.pillInactiveBorder,
    },
    pillText: { fontSize: 13, fontWeight: '600' },
    pillTextActive: { color: colors.pillActiveText },
    pillTextInactive: { color: colors.pillInactiveText },

    // Sort row
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 8,
    },
    sortLabel: {
      fontSize: 13,
      color: colors.venueSubtext,
      fontWeight: '500',
    },
    sortChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.pillInactiveBg,
      borderWidth: 1,
      borderColor: colors.pillInactiveBorder,
    },
    sortChipActive: {
      backgroundColor: colors.INDIGO + '18',
      borderColor: colors.INDIGO,
    },
    sortChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.pillInactiveText,
    },
    sortChipTextActive: {
      color: colors.INDIGO,
    },
    resultCount: {
      marginLeft: 'auto',
      fontSize: 12,
      color: colors.venueSubtext,
    },

    // List
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 20,
    },

    // Card
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      marginBottom: 12,
      overflow: 'hidden',
    },
    cardImage: {
      width: 90,
      height: 110,
    },
    cardBody: {
      flex: 1,
      padding: 12,
      gap: 5,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    genrePill: {
      backgroundColor: colors.INDIGO + '1A',
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 2,
    },
    genreText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.INDIGO,
      letterSpacing: 0.4,
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#EF4444',
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    trendingBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.sectionTitle,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cardMeta: {
      fontSize: 12,
      color: colors.venueSubtext,
      flex: 1,
    },
    seatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    seatsText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#22c55e',
    },
    seatsTextFull: {
      color: '#e53e3e',
    },
    cardChevron: {
      marginRight: 12,
    },

    // Skeleton
    skeletonCard: {
      opacity: 1,
    },
    skeletonBlock: {
      backgroundColor: colors.inputBorder,
    },
    skeletonLine: {
      backgroundColor: colors.inputBorder,
      borderRadius: 6,
    },

    // Feedback
    errorText: {
      textAlign: 'center',
      color: '#e74c3c',
      fontSize: 14,
      marginTop: 40,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.venueSubtext,
      fontSize: 14,
      marginTop: 40,
    },

    // Bottom nav
    bottomNav: {
      flexDirection: 'row',
      backgroundColor: colors.navBg,
      borderTopWidth: 1,
      borderTopColor: colors.navBorder,
      paddingBottom: 20,
      paddingTop: 10,
    },
    navTab: { flex: 1, alignItems: 'center', gap: 3 },
    navLabel: { fontSize: 11, fontWeight: '500' },
  });
}
