import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const UPCOMING = [
  {
    id: '1',
    badge: 'CONFIRMED',
    title: 'Hamilton: An American Musical',
    venue: 'Richard Rodgers Theatre, NY',
    date: 'Oct 24',
    time: '7:30 PM',
    seats: 'Row M, Seat 12-13',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  },
  {
    id: '2',
    badge: null,
    title: 'Wicked',
    venue: 'Gershwin Theatre, NY',
    date: 'Nov 12',
    time: '8:00 PM',
    seats: 'Row B, Seat 4',
    image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80',
  },
];

const PAST = [
  {
    id: '1',
    title: 'Hadestown',
    date: 'September 14, 2023',
    price: '$145.00',
    venue: 'Walter Kerr Theatre',
    image: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=100&q=80',
  },
  {
    id: '2',
    title: 'Moulin Rouge! The Musical',
    date: 'August 02, 2023',
    price: '$189.00',
    venue: 'Al Hirschfeld Theatre',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=100&q=80',
  },
  {
    id: '3',
    title: 'The Lion King',
    date: 'May 21, 2023',
    price: '$210.00',
    venue: 'Minskoff Theatre',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=100&q=80',
  },
];

export default function ProfileScreen({ onNavigateDiscover, onNavigateTickets, onLogout }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showAllPast, setShowAllPast] = useState(false);
  const s = makeStyles(colors);

  const visiblePast = showAllPast ? PAST : PAST.slice(0, 3);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    onLogout?.();
  };

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
          <Ionicons name="settings-outline" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarWrapper}>
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/adventurer/png?seed=Alex' }}
            style={s.avatar}
          />
          <View style={s.avatarBadge}>
            <Ionicons name="pencil" size={11} color="#fff" />
          </View>
        </View>
        <Text style={s.userName}>Alex Thompson</Text>
        <Text style={s.userSince}>Patron of the Arts since 2021</Text>

        {/* Upcoming Bookings */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Bookings</Text>
          <TouchableOpacity>
            <Text style={s.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {UPCOMING.map((item) => (
          <View key={item.id} style={s.bookingCard}>
            <Image source={{ uri: item.image }} style={s.bookingImage} />
            {item.badge && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.badge}</Text>
              </View>
            )}
            <View style={s.bookingBody}>
              <Text style={s.bookingTitle}>{item.title}</Text>
              <View style={s.bookingVenueRow}>
                <Ionicons name="location-outline" size={13} color={colors.venueSubtext} />
                <Text style={s.bookingVenue}>{item.venue}</Text>
              </View>
              <View style={s.metaRow}>
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>Date & Time</Text>
                  <Text style={s.metaValue}>{item.date} • {item.time}</Text>
                </View>
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>Seats</Text>
                  <Text style={s.metaValue}>{item.seats}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[s.ticketBtn, !item.badge && s.ticketBtnOutline]}
                activeOpacity={0.85}
              >
                <Text style={[s.ticketBtnText, !item.badge && s.ticketBtnTextOutline]}>
                  View Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Past Bookings */}
        <Text style={s.sectionTitle}>Past Bookings</Text>
        <View style={s.pastList}>
          {visiblePast.map((item, index) => (
            <View
              key={item.id}
              style={[s.pastItem, index < visiblePast.length - 1 && s.pastItemBorder]}
            >
              <Image source={{ uri: item.image }} style={s.pastImage} />
              <View style={s.pastInfo}>
                <Text style={s.pastTitle}>{item.title}</Text>
                <Text style={s.pastDate}>{item.date}</Text>
              </View>
              <View style={s.pastRight}>
                <Text style={s.pastPrice}>{item.price}</Text>
                <Text style={s.pastVenue}>{item.venue}</Text>
              </View>
            </View>
          ))}
        </View>

        {PAST.length > 3 && (
          <TouchableOpacity onPress={() => setShowAllPast(!showAllPast)} style={s.showMore}>
            <Text style={s.showMoreText}>{showAllPast ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}

        {/* Account Settings */}
        <Text style={[s.sectionTitle, { marginTop: 28 }]}>Account Settings</Text>
        <View style={s.settingsList}>
          <TouchableOpacity style={[s.settingsRow, s.settingsRowTop]} activeOpacity={0.7}>
            <View style={s.settingsLeft}>
              <Ionicons name="person-outline" size={18} color={colors.sectionTitle} />
              <Text style={s.settingsLabel}>Personal Info</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navInactive} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.logoutColor} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: 'Discover', icon: 'compass-outline', onPress: onNavigateDiscover },
          { label: 'Tickets', icon: 'ticket-outline', onPress: onNavigateTickets },
          { label: 'Profile', icon: 'person-outline', onPress: null },
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

    // Avatar
    avatarWrapper: {
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 12,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.inputBg,
    },
    avatarBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.INDIGO,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.sectionTitle,
      textAlign: 'center',
    },
    userSince: {
      fontSize: 13,
      color: colors.venueSubtext,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 28,
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
      marginBottom: 14,
    },
    viewAll: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.seeAllColor,
    },

    // Booking card
    bookingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    bookingImage: {
      width: '100%',
      height: 160,
    },
    badge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: colors.confirmedBadgeBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      color: colors.confirmedBadgeText,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },
    bookingBody: {
      padding: 16,
    },
    bookingTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 4,
    },
    bookingVenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 12,
    },
    bookingVenue: {
      fontSize: 13,
      color: colors.venueSubtext,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    metaBox: {
      flex: 1,
      backgroundColor: colors.bookingMetaBg,
      borderRadius: 8,
      padding: 10,
    },
    metaLabel: {
      fontSize: 11,
      color: colors.bookingMetaLabel,
      marginBottom: 3,
    },
    metaValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.bookingMetaValue,
    },
    ticketBtn: {
      backgroundColor: colors.INDIGO,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ticketBtnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.INDIGO,
    },
    ticketBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    ticketBtnTextOutline: {
      color: colors.INDIGO,
    },

    // Past bookings
    pastList: {
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    pastItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    pastItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.pastItemBorder,
    },
    pastImage: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
    },
    pastInfo: {
      flex: 1,
    },
    pastTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.sectionTitle,
      marginBottom: 3,
    },
    pastDate: {
      fontSize: 12,
      color: colors.venueSubtext,
    },
    pastRight: {
      alignItems: 'flex-end',
    },
    pastPrice: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.sectionTitle,
      marginBottom: 3,
    },
    pastVenue: {
      fontSize: 11,
      color: colors.venueSubtext,
      textAlign: 'right',
      maxWidth: 90,
    },
    showMore: {
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 4,
    },
    showMoreText: {
      fontSize: 13,
      color: colors.venueSubtext,
      fontWeight: '500',
    },

    // Settings
    settingsList: {
      backgroundColor: colors.settingsRowBg,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingsRowTop: {
      borderBottomWidth: 0,
    },
    settingsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingsLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.sectionTitle,
    },

    // Logout
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.logoutColor,
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
