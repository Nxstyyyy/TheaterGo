import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';

export default function TicketScreen({ booking, onBack }) {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatBookedAt = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Ticket</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Ticket Card */}
        <View style={s.ticketCard}>
          {/* Show Image */}
          <Image source={{ uri: booking.image_url }} style={s.heroImage} />

          {/* Status Badge */}
          {booking.status === 'confirmed' && (
            <View style={s.statusBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#fff" />
              <Text style={s.statusBadgeText}>CONFIRMED</Text>
            </View>
          )}

          {/* Top section */}
          <View style={s.topSection}>
            <Text style={s.showTitle}>{booking.title}</Text>
            <View style={s.venueRow}>
              <Ionicons name="location-outline" size={14} color={colors.venueSubtext} />
              <Text style={s.venueText}>
                {booking.venue_name}{booking.city ? `, ${booking.city}` : ''}
              </Text>
            </View>
          </View>

          {/* Perforated Divider */}
          <View style={s.perforated}>
            <View style={[s.circle, s.circleLeft, { backgroundColor: colors.background }]} />
            <View style={s.dashedLine}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={[s.dash, { backgroundColor: colors.pastItemBorder }]} />
              ))}
            </View>
            <View style={[s.circle, s.circleRight, { backgroundColor: colors.background }]} />
          </View>

          {/* Details Grid */}
          <View style={s.detailsSection}>
            <View style={s.detailRow}>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>DATE</Text>
                <Text style={s.detailValue}>{formatDate(booking.show_date)}</Text>
              </View>
            </View>

            <View style={s.detailRow}>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>TIME</Text>
                <Text style={s.detailValue}>{formatTime(booking.show_time)}</Text>
              </View>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>SEATS</Text>
                <Text style={s.detailValue}>{booking.seats ?? '—'}</Text>
              </View>
            </View>

            <View style={s.detailRow}>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>TOTAL PAID</Text>
                <Text style={[s.detailValue, s.priceValue]}>
                  ${Number(booking.total_price).toFixed(2)}
                </Text>
              </View>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>BOOKING ID</Text>
                <Text style={s.detailValue}>#{booking.booking_id}</Text>
              </View>
            </View>

            <View style={[s.detailRow, { marginBottom: 0 }]}>
              <View style={s.detailBox}>
                <Text style={s.detailLabel}>BOOKED ON</Text>
                <Text style={s.detailValue}>{formatBookedAt(booking.booked_at)}</Text>
              </View>
            </View>
          </View>

          {/* Second Perforated Divider */}
          <View style={s.perforated}>
            <View style={[s.circle, s.circleLeft, { backgroundColor: colors.background }]} />
            <View style={s.dashedLine}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={[s.dash, { backgroundColor: colors.pastItemBorder }]} />
              ))}
            </View>
            <View style={[s.circle, s.circleRight, { backgroundColor: colors.background }]} />
          </View>

          {/* QR Code Section */}
          <View style={s.qrSection}>
            <View style={s.qrPlaceholder}>
              <QRCode
                value={`TG-${String(booking.booking_id).padStart(6, '0')}`}
                size={100}
                color={colors.sectionTitle}
                backgroundColor={colors.bookingMetaBg}
              />
            </View>
            <Text style={s.qrHint}>Scan at the venue entrance</Text>
            <Text style={s.qrId}>ID: TG-{String(booking.booking_id).padStart(6, '0')}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
      paddingBottom: 20,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.sectionTitle,
    },

    // Ticket
    ticketCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
      marginTop: 8,
    },
    heroImage: {
      width: '100%',
      height: 200,
    },
    statusBadge: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.confirmedBadgeBg,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusBadgeText: {
      color: colors.confirmedBadgeText,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
    },

    // Top section
    topSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
    },
    showTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 6,
    },
    venueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    venueText: {
      fontSize: 14,
      color: colors.venueSubtext,
    },

    // Perforated divider
    perforated: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    circle: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    circleLeft: {
      marginLeft: -11,
    },
    circleRight: {
      marginRight: -11,
    },
    dashedLine: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    dash: {
      width: 6,
      height: 1.5,
      borderRadius: 1,
    },

    // Details grid
    detailsSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      gap: 14,
    },
    detailRow: {
      flexDirection: 'row',
      gap: 12,
    },
    detailBox: {
      flex: 1,
      backgroundColor: colors.bookingMetaBg,
      borderRadius: 10,
      padding: 12,
    },
    detailLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.bookingMetaLabel,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.bookingMetaValue,
    },
    priceValue: {
      color: '#10B981',
      fontSize: 16,
    },

    // QR
    qrSection: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 20,
    },
    qrPlaceholder: {
      width: 140,
      height: 140,
      backgroundColor: colors.bookingMetaBg,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    qrHint: {
      fontSize: 13,
      color: colors.venueSubtext,
      marginBottom: 4,
    },
    qrId: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.bookingMetaLabel,
      letterSpacing: 1,
    },
  });
}
