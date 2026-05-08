import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

const API_URL = __DEV__ ? 'http://10.0.2.2:5000' : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All Productions', 'Musicals', 'Drama', 'Comedy', 'Opera'];

const GENRE_MAP = {
  Musicals: 'Musical',
  Drama: 'Drama',
  Comedy: 'Comedy',
  Opera: 'Opera',
};

export default function DiscoverScreen({ onNavigateProfile, onNavigateVenue, onNavigateShow, onNavigateAllShows }) {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Productions');
  const [activeTab, setActiveTab] = useState('Discover');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllVenues, setShowAllVenues] = useState(false);
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/api/shows`);
        if (!res) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Error ${res.status}`);
        }
        const data = await res.json();
        setShows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredShows = shows.filter((item) => {
    const matchesSearch =
      search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.venue_name?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === 'All Productions' ||
      item.genre === GENRE_MAP[activeCategory];

    return matchesSearch && matchesCategory;
  });

  const trendingShows = Object.values(
    filteredShows
      .filter((item) => item.is_trending)
      .reduce((acc, item) => {
        if (!acc[item.production_id]) acc[item.production_id] = item;
        return acc;
      }, {})
  );

  const venues = Object.values(
    shows.reduce((acc, item) => {
      if (item.venue_name && !acc[item.venue_name]) {
        acc[item.venue_name] = {
          name: item.venue_name,
          city: item.city,
          image_url: item.venue_image_url,
        };
      }
      return acc;
    }, {})
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <Image source={require('../assets/icon_app.png')} style={s.logoIcon} />
          <Text style={s.logoText}>Theater Go</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Search bar */}
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.placeholder} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search for plays, musicals, or venues..."
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsRow}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[s.pill, active ? s.pillActive : s.pillInactive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active ? s.pillTextActive : s.pillTextInactive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={colors.INDIGO} style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={s.errorText}>{error}</Text>
        ) : (
          <>
            {/* Trending Now */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Trending Now</Text>
              <TouchableOpacity style={s.seeAllRow} onPress={() => onNavigateAllShows?.()}>
                <Text style={s.seeAll}>See all</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.seeAllColor} />
              </TouchableOpacity>
            </View>

            {trendingShows.length === 0 ? (
              <Text style={s.emptyText}>No trending shows found.</Text>
            ) : (
              <FlatList
                data={trendingShows}
                keyExtractor={(item) => String(item.show_id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.trendingList}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.trendingCard} activeOpacity={0.9} onPress={() => onNavigateShow?.(item)}>
                    <Image source={{ uri: item.image_url }} style={s.trendingImage} />
                    <View style={s.trendingOverlay}>
                      <Text style={s.trendingGenre}>{item.genre?.toUpperCase()}</Text>
                      <Text style={s.trendingTitle}>{item.title}</Text>
                      <View style={s.trendingVenueRow}>
                        <Ionicons name="location-outline" size={12} color="#fff" />
                        <Text style={s.trendingVenue}>{item.venue_name}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Local Venues */}
            <Text style={[s.sectionTitle, s.venuesSectionTitle]}>Local Venues</Text>
            {venues.length === 0 ? (
              <Text style={s.emptyText}>No venues found.</Text>
            ) : (
              <>
                {(showAllVenues ? venues : venues.slice(0, 3)).map((venue) => (
                  <TouchableOpacity key={venue.name} style={s.venueCard} activeOpacity={0.85} onPress={() => onNavigateVenue?.(venue)}>
                    {venue.image_url && (
                      <Image source={{ uri: venue.image_url }} style={s.venueImage} />
                    )}
                    <View style={s.venueInfo}>
                      <Text style={s.venueName}>{venue.name}</Text>
                      <Text style={s.venueMeta}>{venue.city}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.navInactive} />
                  </TouchableOpacity>
                ))}
                {venues.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllVenues(!showAllVenues)} style={s.showMore}>
                    <Text style={s.showMoreText}>{showAllVenues ? 'Show less' : `Show ${venues.length - 3} more`}</Text>
                    <Ionicons name={showAllVenues ? 'chevron-up' : 'chevron-down'} size={14} color={colors.INDIGO} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: 'Discover', icon: 'compass-outline', onPress: null },
          { label: 'Profile', icon: 'person-outline', onPress: onNavigateProfile },
        ].map((tab) => {
          const active = tab.label === activeTab;
          return (
            <TouchableOpacity
              key={tab.label}
              style={s.navTab}
              onPress={() => { setActiveTab(tab.label); tab.onPress?.(); }}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? colors.navActive : colors.navInactive}
              />
              <Text style={[s.navLabel, { color: active ? colors.navActive : colors.navInactive }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 20,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 14,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoIcon: {
      width: 64,
      height: 64,
      resizeMode: 'contain',
    },
    logoText: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.INDIGO,
    },

    // Search
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 14,
      color: colors.inputText,
    },

    // Pills
    pillsRow: {
      gap: 10,
      paddingBottom: 4,
      marginBottom: 24,
    },
    pill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 999,
    },
    pillActive: {
      backgroundColor: colors.pillActiveBg,
    },
    pillInactive: {
      backgroundColor: colors.pillInactiveBg,
      borderWidth: 1,
      borderColor: colors.pillInactiveBorder,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '600',
    },
    pillTextActive: {
      color: colors.pillActiveText,
    },
    pillTextInactive: {
      color: colors.pillInactiveText,
    },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.sectionTitle,
    },
    seeAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    seeAll: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.seeAllColor,
    },

    // Trending cards
    trendingList: {
      paddingRight: 20,
      marginBottom: 28,
      marginLeft: -20,
      paddingLeft: 20,
    },
    trendingCard: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.1,
      borderRadius: 16,
      overflow: 'hidden',
      marginRight: 16,
    },
    trendingImage: {
      width: '100%',
      height: '100%',
    },
    trendingOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingTop: 40,
      background: 'transparent',
      backgroundGradient: true,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    trendingGenre: {
      fontSize: 10,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 1.5,
      marginBottom: 4,
    },
    trendingTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 6,
    },
    trendingVenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    trendingVenue: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
    },

    // Venues
    venuesSectionTitle: {
      marginBottom: 14,
    },
    showMore: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
      marginBottom: 4,
    },
    showMoreText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.INDIGO,
    },
    venueCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    venueImage: {
      width: 72,
      height: 72,
      borderRadius: 10,
      marginRight: 14,
    },
    venueInfo: {
      flex: 1,
    },
    venueName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.sectionTitle,
      marginBottom: 4,
    },
    venueMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 3,
    },
    venueMeta: {
      fontSize: 13,
      color: colors.venueSubtext,
    },
    venueDot: {
      color: colors.venueSubtext,
      fontSize: 13,
    },
    venueGenre: {
      fontSize: 12,
      color: colors.venueSubtext,
      fontStyle: 'italic',
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
    navTab: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
    },
    navLabel: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Feedback
    errorText: {
      textAlign: 'center',
      marginTop: 40,
      color: '#e74c3c',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.venueSubtext,
      fontSize: 14,
      marginBottom: 20,
    },
  });
}
