import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const API_URL = __DEV__ ? 'http://10.0.2.2:5000' : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All', 'Musical', 'Drama', 'Comedy', 'Opera'];

export default function VenueScreen({ venue, onBack, onNavigateProfile, onNavigateBook }) {
  const { colors } = useTheme();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/api/shows`);
        if (!res) return;
        if (!res.ok) throw new Error('Failed to load shows');
        const data = await res.json();
        setShows(data.filter((sh) => sh.venue_name === venue.name));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [venue.name]);

  const filtered =
    activeCategory === 'All'
      ? shows
      : shows.filter((sh) => sh.genre === activeCategory);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Hero */}
        <View style={s.heroWrapper}>
          {venue.image_url ? (
            <Image source={{ uri: venue.image_url }} style={s.heroImage} />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]} />
          )}
          <View style={s.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={s.heroContent}>
            <Text style={s.heroTitle}>{venue.name}</Text>
            <View style={s.heroLocationRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={s.heroCity}>{venue.city}</Text>
            </View>
          </View>
        </View>

        {/* Info strip */}
        <View style={s.infoStrip}>
          <View style={s.infoItem}>
            <MaterialCommunityIcons name="theater" size={18} color={colors.INDIGO} />
            <Text style={s.infoLabel}>Venue</Text>
          </View>
          <View style={s.infoDivider} />
          <View style={s.infoItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.INDIGO} />
            <Text style={s.infoLabel}>{shows.length} upcoming</Text>
          </View>
          <View style={s.infoDivider} />
          <View style={s.infoItem}>
            <Ionicons name="musical-notes-outline" size={18} color={colors.INDIGO} />
            <Text style={s.infoLabel}>Live shows</Text>
          </View>
        </View>

        <View style={s.body}>
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

          {/* Shows list */}
          <Text style={s.sectionTitle}>
            {activeCategory === 'All' ? 'All Shows' : activeCategory}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.INDIGO} style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={s.errorText}>{error}</Text>
          ) : filtered.length === 0 ? (
            <Text style={s.emptyText}>No shows in this category.</Text>
          ) : (
            filtered.map((show) => (
              <TouchableOpacity key={show.show_id} style={s.showCard} activeOpacity={0.9}>
                <Image source={{ uri: show.image_url }} style={s.showImage} />
                <View style={s.showBody}>
                  <View style={s.genrePill}>
                    <Text style={s.genreText}>{show.genre}</Text>
                  </View>
                  <Text style={s.showTitle}>{show.title}</Text>
                  <View style={s.showMetaRow}>
                    <Ionicons name="calendar-outline" size={13} color={colors.venueSubtext} />
                    <Text style={s.showMeta}>{formatDate(show.show_date)}</Text>
                    <Text style={s.showMetaDot}>•</Text>
                    <Ionicons name="time-outline" size={13} color={colors.venueSubtext} />
                    <Text style={s.showMeta}>{formatTime(show.show_time)}</Text>
                  </View>
                  <View style={s.seatsRow}>
                    <Ionicons name="ticket-outline" size={12} color={show.available_seats === 0 ? '#e53e3e' : '#22c55e'} />
                    <Text style={[s.seatsText, show.available_seats === 0 && s.seatsTextFull]}>
                      {show.available_seats === 0 ? 'Sold out' : `${show.available_seats} seats left`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[s.bookBtn, show.available_seats === 0 && s.bookBtnDisabled]}
                    activeOpacity={show.available_seats === 0 ? 1 : 0.85}
                    onPress={() => show.available_seats > 0 && onNavigateBook(show)}
                  >
                    <Text style={s.bookBtnText}>
                      {show.available_seats === 0 ? 'Sold Out' : 'Book Tickets'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

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
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Hero
    heroWrapper: {
      height: 260,
      position: 'relative',
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroPlaceholder: {
      backgroundColor: '#1E1B4B',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.42)',
    },
    backBtn: {
      position: 'absolute',
      top: 14,
      left: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroContent: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 6,
    },
    heroLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    heroCity: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
    },

    // Info strip
    infoStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.venueBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.venueBorder,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    infoItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.venueSubtext,
      fontWeight: '500',
    },
    infoDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.venueBorder,
    },

    // Body
    body: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    // Pills
    pillsRow: {
      gap: 10,
      paddingBottom: 4,
      marginBottom: 20,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 7,
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

    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 14,
    },

    // Show cards
    showCard: {
      flexDirection: 'row',
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      marginBottom: 14,
      overflow: 'hidden',
    },
    showImage: {
      width: 100,
      alignSelf: 'stretch',
    },
    showBody: {
      flex: 1,
      padding: 12,
    },
    genrePill: {
      alignSelf: 'flex-start',
      backgroundColor: colors.INDIGO + '1A',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginBottom: 6,
    },
    genreText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.INDIGO,
      letterSpacing: 0.5,
    },
    showTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.sectionTitle,
      marginBottom: 6,
    },
    showMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    showMeta: {
      fontSize: 12,
      color: colors.venueSubtext,
    },
    showMetaDot: {
      color: colors.venueSubtext,
      fontSize: 12,
    },
    seatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 10,
    },
    seatsText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#22c55e',
    },
    seatsTextFull: {
      color: '#e53e3e',
    },
    bookBtn: {
      backgroundColor: colors.INDIGO,
      borderRadius: 8,
      paddingVertical: 7,
      alignItems: 'center',
    },
    bookBtnDisabled: {
      backgroundColor: colors.inputBorder ?? '#ccc',
    },
    bookBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },

    // Feedback
    errorText: {
      textAlign: 'center',
      color: '#e74c3c',
      fontSize: 14,
      marginTop: 20,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.venueSubtext,
      fontSize: 14,
      marginTop: 20,
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
