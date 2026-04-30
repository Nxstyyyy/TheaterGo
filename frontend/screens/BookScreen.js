import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function BookScreen({ show, onBack, onBookingSuccess, onNavigatePayment }) {
  const { colors } = useTheme();
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const s = makeStyles(colors);

  useEffect(() => {
    (async () => {
      try {
        const [seatsRes, bookingsRes] = await Promise.all([
          authFetch(`${API_URL}/api/shows/${show.show_id}/seats`),
          authFetch(`${API_URL}/api/bookings/upcoming`),
        ]);

        if (!seatsRes) return;
        if (!seatsRes.ok) throw new Error('Failed to load seats');
        setSeats(await seatsRes.json());

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const matches = bookings.filter(
            (b) =>
              String(b.show_date).slice(0, 10) === String(show.show_date).slice(0, 10) &&
              b.title === show.title
          );
          setExistingBookings(matches);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [show.show_id]);

  // Group seats by row label
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row_label]) acc[seat.row_label] = [];
    acc[seat.row_label].push(seat);
    return acc;
  }, {});

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id);
      return next;
    });
  };

  const totalPrice = selected.size * (show.price ?? 0.0);

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_id: show.show_id, seat_ids: Array.from(selected) }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Booking failed');

      const seatLabels = seats
        .filter((s) => selected.has(s.id))
        .map((s) => `${s.row_label}${s.seat_number}`)
        .join(', ');

      onNavigatePayment?.({
        booking_id: data.booking_id,
        total_price: data.total_price,
        status: 'pending',
        booked_at: new Date().toISOString(),
        show_date: show.show_date,
        show_time: show.show_time,
        title: show.title,
        image_url: show.image_url,
        venue_name: show.venue_name,
        city: show.city ?? null,
        seats: seatLabels,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // ── Main booking screen ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Select Seats</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Show summary */}
        <View style={s.showSummary}>
          <Image source={{ uri: show.image_url }} style={s.summaryImage} />
          <View style={s.summaryInfo}>
            <Text style={s.summaryTitle} numberOfLines={2}>{show.title}</Text>
            <View style={s.summaryRow}>
              <Ionicons name="location-outline" size={12} color={colors.venueSubtext} />
              <Text style={s.summaryMeta}>{show.venue_name}</Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.venueSubtext} />
              <Text style={s.summaryMeta}>{formatDate(show.show_date)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="time-outline" size={12} color={colors.venueSubtext} />
              <Text style={s.summaryMeta}>{formatTime(show.show_time)}</Text>
            </View>
          </View>
        </View>

        {/* Existing bookings */}
        {existingBookings.length > 0 && (
          <View style={s.existingSection}>
            <Text style={s.existingSectionTitle}>
              Your booking{existingBookings.length > 1 ? 's' : ''} for this show
            </Text>
            {existingBookings.map((booking, index) => (
              <View
                key={booking.booking_id}
                style={[
                  s.existingBanner,
                  index < existingBookings.length - 1 && s.existingBannerGap,
                ]}
              >
                <View style={s.existingBannerLeft}>
                  <Ionicons name="ticket" size={18} color={colors.INDIGO} />
                </View>
                <View style={s.existingBannerBody}>
                  <Text style={s.existingBannerTitle}>Booking #{booking.booking_id}</Text>
                  <Text style={s.existingBannerSub}>
                    Seats: {booking.seats ?? '—'}
                  </Text>
                  <Text style={s.existingBannerSub}>
                    Total: ${Number(booking.total_price).toFixed(2)}
                  </Text>
                  <View style={[s.existingStatusPill, booking.status === 'confirmed' && s.existingStatusConfirmed]}>
                    <Text style={[s.existingStatusText, booking.status === 'confirmed' && s.existingStatusTextConfirmed]}>
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stage indicator */}
        <View style={s.stageWrapper}>
          <View style={s.stage}>
            <Text style={s.stageText}>STAGE</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={s.legend}>
          {[
            { color: colors.venueBg, border: colors.pillInactiveBorder, label: 'Available' },
            { color: colors.INDIGO, border: colors.INDIGO, label: 'Selected' },
            { color: colors.inputBorder, border: colors.inputBorder, label: 'Taken' },
          ].map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color, borderColor: item.border }]} />
              <Text style={s.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Seat map */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.INDIGO} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={s.errorText}>{error}</Text>
        ) : seats.length === 0 ? (
          <Text style={s.emptyText}>No seat data available for this show.</Text>
        ) : (
          <View style={s.seatMap}>
            {Object.entries(rows).map(([rowLabel, rowSeats]) => (
              <View key={rowLabel} style={s.seatRow}>
                <Text style={s.rowLabel}>{rowLabel}</Text>
                <View style={s.seatsInRow}>
                  {rowSeats.map((seat) => {
                    const isSel = selected.has(seat.id);
                    const isTaken = Boolean(seat.is_booked);
                    return (
                      <TouchableOpacity
                        key={seat.id}
                        style={[
                          s.seat,
                          isTaken && s.seatTaken,
                          isSel && s.seatSelected,
                        ]}
                        onPress={() => toggleSeat(seat)}
                        activeOpacity={isTaken ? 1 : 0.7}
                        disabled={isTaken}
                      >
                        <Text style={[
                          s.seatNum,
                          isSel && s.seatNumSelected,
                          isTaken && s.seatNumTaken,
                        ]}>
                          {seat.seat_number}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={s.rowLabel}>{rowLabel}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Sticky bottom summary + confirm */}
      <View style={s.footer}>
        {error && !loading && (
          <Text style={s.footerError}>{error}</Text>
        )}
        <View style={s.footerSummary}>
          <View>
            <Text style={s.footerSeats}>
              {selected.size === 0
                ? 'No seats selected'
                : `${selected.size} seat${selected.size > 1 ? 's' : ''} · ${seats
                  .filter((s) => selected.has(s.id))
                  .map((s) => `${s.row_label}${s.seat_number}`)
                  .join(', ')
                }`}
            </Text>
            <Text style={s.footerPrice}>
              ${totalPrice.toFixed(2)}
              <Text style={s.footerPriceSub}> total</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[s.confirmBtn, (selected.size === 0 || submitting) && s.confirmBtnDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.88}
            disabled={selected.size === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.confirmBtnText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
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

    scroll: { paddingHorizontal: 20 },

    // Existing booking banner
    existingSection: {
      marginBottom: 20,
    },
    existingSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.sectionTitle,
      marginBottom: 10,
    },
    existingBannerGap: {
      marginBottom: 10,
    },
    existingBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.INDIGO + '12',
      borderWidth: 1,
      borderColor: colors.INDIGO + '40',
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      gap: 10,
    },
    existingBannerLeft: {
      marginTop: 2,
    },
    existingBannerBody: {
      flex: 1,
      gap: 4,
    },
    existingBannerTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.sectionTitle,
    },
    existingBannerSub: {
      fontSize: 12,
      color: colors.venueSubtext,
    },
    existingStatusPill: {
      alignSelf: 'flex-start',
      marginTop: 4,
      paddingHorizontal: 9,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.inputBorder,
    },
    existingStatusConfirmed: {
      backgroundColor: '#22C55E22',
    },
    existingStatusText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.venueSubtext,
      letterSpacing: 0.5,
    },
    existingStatusTextConfirmed: {
      color: '#22C55E',
    },

    // Show summary
    showSummary: {
      flexDirection: 'row',
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 24,
    },
    summaryImage: { width: 90, height: 110 },
    summaryInfo: { flex: 1, padding: 12, gap: 5 },
    summaryTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.sectionTitle,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    summaryMeta: { fontSize: 12, color: colors.venueSubtext },

    // Stage
    stageWrapper: { alignItems: 'center', marginBottom: 16 },
    stage: {
      width: '70%',
      paddingVertical: 8,
      backgroundColor: colors.INDIGO + '22',
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.INDIGO + '55',
    },
    stageText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.INDIGO,
      letterSpacing: 3,
    },

    // Legend
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginBottom: 20,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: {
      width: 16,
      height: 16,
      borderRadius: 4,
      borderWidth: 1.5,
    },
    legendLabel: { fontSize: 12, color: colors.venueSubtext },

    // Seat map
    seatMap: { gap: 8 },
    seatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    rowLabel: {
      width: 18,
      fontSize: 12,
      fontWeight: '700',
      color: colors.venueSubtext,
      textAlign: 'center',
    },
    seatsInRow: {
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },
    seat: {
      width: 34,
      height: 34,
      borderRadius: 6,
      backgroundColor: colors.venueBg,
      borderWidth: 1.5,
      borderColor: colors.pillInactiveBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seatSelected: {
      backgroundColor: colors.INDIGO,
      borderColor: colors.INDIGO,
    },
    seatTaken: {
      backgroundColor: colors.inputBorder,
      borderColor: colors.inputBorder,
    },
    seatNum: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.sectionTitle,
    },
    seatNumSelected: { color: '#fff' },
    seatNumTaken: { color: colors.background },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.navBg,
      borderTopWidth: 1,
      borderTopColor: colors.navBorder,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 28,
    },
    footerError: {
      color: '#EF4444',
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 8,
    },
    footerSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerSeats: {
      fontSize: 12,
      color: colors.venueSubtext,
      maxWidth: 180,
    },
    footerPrice: {
      fontSize: 22,
      fontWeight: '800',
      color: '#10B981',
    },
    footerPriceSub: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.venueSubtext,
    },
    confirmBtn: {
      backgroundColor: colors.INDIGO,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 22,
      minWidth: 150,
      alignItems: 'center',
    },
    confirmBtnDisabled: { opacity: 0.45 },
    confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

    // Confirmation screen
    confirmScroll: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 40,
    },
    confirmIcon: { marginBottom: 16 },
    confirmTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 6,
    },
    confirmSub: {
      fontSize: 15,
      color: colors.venueSubtext,
      marginBottom: 32,
    },
    ticket: {
      width: '100%',
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 32,
    },
    ticketImage: { width: '100%', height: 160 },
    ticketBody: { padding: 16, gap: 8 },
    ticketShow: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 4,
    },
    ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ticketMeta: { fontSize: 14, color: colors.venueSubtext },
    ticketDivider: {
      height: 1,
      backgroundColor: colors.venueBorder,
      marginVertical: 6,
    },
    doneBtn: {
      width: '100%',
      backgroundColor: colors.INDIGO,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Feedback
    errorText: { textAlign: 'center', color: '#e74c3c', fontSize: 14, marginTop: 20 },
    emptyText: { textAlign: 'center', color: colors.venueSubtext, fontSize: 14, marginTop: 20 },
  });
}
