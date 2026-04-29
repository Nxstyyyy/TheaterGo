import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen({ onNavigateDiscover, onLogout, onNavigateTicket, onNavigatePayment }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showAllPast, setShowAllPast] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);
  const upcomingSectionY = useRef(0);
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser(payload);
        }

        const [upRes, pastRes] = await Promise.all([
          authFetch(`${API_URL}/api/bookings/upcoming`),
          authFetch(`${API_URL}/api/bookings/past`),
        ]);

        if (upRes?.ok) {
          const upData = await upRes.json();
          const sorted = [...upData].sort((a, b) =>
            a.status === 'pending' && b.status !== 'pending' ? -1 :
            a.status !== 'pending' && b.status === 'pending' ? 1 : 0
          );
          setUpcoming(sorted);
        }
        if (pastRes?.ok) setPast(await pastRes.json());
      } catch (err) {
        console.error('Error fetching bookings:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visiblePast = showAllPast ? past : past.slice(0, 3);
  const visibleUpcoming = showAllUpcoming ? upcoming : upcoming.slice(0, 3);
  const pendingCount = upcoming.filter(b => b.status === 'pending').length;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatShowDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

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
          <Image source={require('../assets/icon.png')} style={s.logoIcon} />
          <Text style={s.logoText}>Theater Go</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.logoutColor} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarWrapper}>
          <Image
            source={{ uri: `https://api.dicebear.com/7.x/adventurer/png?seed=${user?.name ?? 'User'}` }}
            style={s.avatar}
          />

        </View>
        <Text style={s.userName}>{user?.name ?? '—'}</Text>
        <Text style={s.userSince}>{user?.email ?? ''}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.INDIGO} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Pending notification banner */}
            {pendingCount > 0 && (
              <TouchableOpacity
                style={s.pendingBanner}
                activeOpacity={0.85}
                onPress={() =>
                scrollRef.current?.scrollTo({ y: upcomingSectionY.current, animated: true })
              }
              >
                <Ionicons name="alert-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.pendingBannerText}>
                  {pendingCount === 1
                    ? 'You have 1 pending booking — complete your payment.'
                    : `You have ${pendingCount} pending bookings — complete your payments.`}
                </Text>
              </TouchableOpacity>
            )}
            {/* Upcoming Bookings */}
            <View
              style={s.sectionHeader}
              onLayout={(e) => { upcomingSectionY.current = e.nativeEvent.layout.y; }}
            >
              <Text style={s.sectionTitle}>Upcoming Bookings</Text>
            </View>

            {upcoming.length === 0 ? (
              <Text style={s.emptyText}>No upcoming bookings.</Text>
            ) : (
              <>
              {visibleUpcoming.map((item) => (
                <View key={item.booking_id} style={s.bookingCard}>
                  <Image source={{ uri: item.image_url }} style={s.bookingImage} />
                  {(() => {
                    const badgeColor =
                      item.status === 'confirmed' ? colors.confirmedBadgeBg :
                      item.status === 'pending'   ? '#F97316' :
                      item.status === 'cancelled' ? '#EF4444' : null;
                    return badgeColor ? (
                      <View style={[s.badge, { backgroundColor: badgeColor }]}>
                        <Text style={s.badgeText}>{item.status.toUpperCase()}</Text>
                      </View>
                    ) : null;
                  })()}
                  <View style={s.bookingBody}>
                    <Text style={s.bookingTitle}>{item.title}</Text>
                    <View style={s.bookingVenueRow}>
                      <Ionicons name="location-outline" size={13} color={colors.venueSubtext} />
                      <Text style={s.bookingVenue}>{item.venue_name}{item.city ? `, ${item.city}` : ''}</Text>
                      
                    </View>
                                        <View style={s.bookedAtRow}>
                      <Ionicons name="time-outline" size={12} color={colors.venueSubtext} />
                      <Text style={s.bookedAtText}>Booked {formatDate(item.booked_at)}</Text>
                    </View>
                    <View style={s.metaRow}>
                      <View style={s.metaBox}>
                        <Text style={s.metaLabel}>Date & Time</Text>
                        <Text style={s.metaValue}>{formatShowDate(item.show_date)} • {formatTime(item.show_time)}</Text>
                      </View>
                      <View style={s.metaBox}>
                        <Text style={s.metaLabel}>Seats</Text>
                        <Text style={s.metaValue}>{item.seats ?? '—'}</Text>
                      </View>
                    </View>

                    {item.status === 'pending' ? (
                      <TouchableOpacity
                        style={s.payBtn}
                        activeOpacity={0.85}
                        onPress={() => onNavigatePayment?.(item)}
                      >
                        <Text style={s.payBtnText}>Complete Payment</Text>
                      </TouchableOpacity>
                    ) : item.status === 'confirmed' ? (
                      <TouchableOpacity
                        style={s.ticketBtn}
                        activeOpacity={0.85}
                        onPress={() => onNavigateTicket?.(item)}
                      >
                        <Text style={s.ticketBtnText}>View Ticket</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
              {upcoming.length > 3 && (
                <TouchableOpacity onPress={() => setShowAllUpcoming(!showAllUpcoming)} style={s.showMore}>
                  <Text style={s.showMoreText}>{showAllUpcoming ? 'Show less' : 'Show more'}</Text>
                </TouchableOpacity>
              )}
              </>
            )}

            {/* Past Bookings */}
            <Text style={s.sectionTitle}>Past Bookings</Text>
            {past.length === 0 ? (
              <Text style={s.emptyText}>No past bookings.</Text>
            ) : (
              <>
                <View style={s.pastList}>
                  {visiblePast.map((item, index) => (
                    <View
                      key={item.booking_id}
                      style={[s.pastItem, index < visiblePast.length - 1 && s.pastItemBorder]}
                    >
                      <Image source={{ uri: item.image_url }} style={s.pastImage} />
                      <View style={s.pastInfo}>
                        <Text style={s.pastTitle}>{item.title}</Text>
                        <Text style={s.pastDate}>{formatDate(item.show_date)}</Text>
                        <Text style={s.bookedAtText}>Booked {formatDate(item.booked_at)}</Text>
                      </View>
                      <View style={s.pastRight}>
                        <Text style={s.pastPrice}>${Number(item.total_price).toFixed(2)}</Text>
                        <Text style={s.pastVenue}>{item.venue_name}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {past.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllPast(!showAllPast)} style={s.showMore}>
                    <Text style={s.showMoreText}>{showAllPast ? 'Show less' : 'Show more'}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}

        {/* Account Settings */}
        <View style={s.settingsSectionTitle}>
          <Text style={s.sectionTitle}>Settings</Text>
        </View>
        <View style={s.settingsList}>
          <View style={s.settingsRow}>
            <View style={s.settingsLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={18}
                color={colors.INDIGO}
              />
              <Text style={s.settingsLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.inputBorder, true: colors.INDIGO }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: 'Discover', icon: 'compass-outline', onPress: onNavigateDiscover },
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
    bookedAtRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 12,
    },
    bookedAtText: {
      fontSize: 11,
      color: colors.venueSubtext,
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
    payBtn: {
      backgroundColor: '#F97316',
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    payBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
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
      color: '#10B981',
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
    pendingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F97316',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    pendingBannerText: {
      flex: 1,
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    // Settings
    settingsSectionTitle: {
      marginTop: 8,
    },
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
    emptyText: {
      textAlign: 'center',
      color: colors.venueSubtext,
      fontSize: 14,
      marginBottom: 20,
    },
  });
}
