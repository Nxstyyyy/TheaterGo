import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

const CATEGORIES = ['All Productions', 'Musicals', 'Drama', 'Comedy', 'Opera'];

const TRENDING = [
  {
    id: '1',
    genre: 'MUSICAL',
    title: 'The Midnight Chorus',
    venue: 'Majestic Theater',
    image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80',
  },
  {
    id: '2',
    genre: 'DRAMA',
    title: 'Shattered Mirrors',
    venue: 'Royal Stage',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  },
  {
    id: '3',
    genre: 'COMEDY',
    title: 'Last Laugh Club',
    venue: 'The Forum',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80',
  },
];

const VENUES = [
  {
    id: '1',
    name: 'The Grand Lyric',
    rating: '4.9',
    distance: '1.2 miles',
    genre: 'Classic Musicals & Opera',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=200&q=80',
  },
  {
    id: '2',
    name: 'Prism Contemporary',
    rating: '4.7',
    distance: '0.4 miles',
    genre: 'Experimental & Indie',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=200&q=80',
  },
  {
    id: '3',
    name: 'Black Box Studio',
    rating: '4.8',
    distance: '2.5 miles',
    genre: 'Intimate Drama & Solo Acts',
    image: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=200&q=80',
  },
];

export default function DiscoverScreen({ onNavigateProfile }) {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Productions');
  const [activeTab, setActiveTab] = useState('Discover');
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <MaterialCommunityIcons name="theater" size={22} color={colors.INDIGO} />
          <Text style={s.logoText}>Theater Go</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
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

        {/* Trending Now */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Trending Now</Text>
          <TouchableOpacity style={s.seeAllRow}>
            <Text style={s.seeAll}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.seeAllColor} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={TRENDING}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.trendingList}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.trendingCard} activeOpacity={0.9}>
              <Image source={{ uri: item.image }} style={s.trendingImage} />
              <View style={s.trendingOverlay}>
                <Text style={s.trendingGenre}>{item.genre}</Text>
                <Text style={s.trendingTitle}>{item.title}</Text>
                <View style={s.trendingVenueRow}>
                  <Ionicons name="location-outline" size={12} color="#fff" />
                  <Text style={s.trendingVenue}>{item.venue}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Local Venues */}
        <Text style={[s.sectionTitle, s.venuesSectionTitle]}>Local Venues</Text>
        {VENUES.map((venue) => (
          <TouchableOpacity key={venue.id} style={s.venueCard} activeOpacity={0.85}>
            <Image source={{ uri: venue.image }} style={s.venueImage} />
            <View style={s.venueInfo}>
              <Text style={s.venueName}>{venue.name}</Text>
              <View style={s.venueMetaRow}>
                <Ionicons name="star" size={13} color={colors.starColor} />
                <Text style={s.venueMeta}>{venue.rating}</Text>
                <Text style={s.venueDot}>•</Text>
                <Text style={s.venueMeta}>{venue.distance}</Text>
              </View>
              <Text style={s.venueGenre}>{venue.genre}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navInactive} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab}>
        <Ionicons name="options-outline" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: 'Discover', icon: 'compass-outline', onPress: null },
          { label: 'Tickets', icon: 'ticket-outline', onPress: null },
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
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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

    // FAB
    fab: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.fabBg,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
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
  });
}
