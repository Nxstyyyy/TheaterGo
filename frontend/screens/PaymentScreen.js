import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { authFetch } from '../utils/authFetch';
import { useTheme } from '../context/ThemeContext';

const API_URL = __DEV__ ? 'http://10.0.2.2:5000' : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function PaymentScreen({ booking, onBack, onPaymentSuccess }) {
  const displayImage = booking.image_url;
  const displayTitle = booking.title;
  const displayVenue = booking.venue_name;
  const displayCity = booking.city;
  const displayDate = booking.show_date;
  const displayTime = booking.show_time;
  const displaySeats = booking.seats ?? '—';
  const displayTotal = Number(booking.total_price);
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardHolder.trim().length >= 2 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handlePay = async () => {
    if (!isValid) return;
    setError(null);
    setProcessing(true);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1800));

    try {
      // Always PATCH to confirm the pending booking
      const res = await authFetch(`${API_URL}/api/bookings/${booking.booking_id}/confirm`, {
        method: 'PATCH',
      });
      if (!res?.ok) {
        const body = await res?.json().catch(() => ({}));
        throw new Error(body?.message || 'Payment failed');
      }
      const confirmedBooking = { ...booking, status: 'confirmed' };
      setSuccess(true);
      setTimeout(() => onPaymentSuccess?.(confirmedBooking), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatShowDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.sectionTitle} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Complete Payment</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Booking Summary */}
        <View style={s.summaryCard}>
          <Image source={{ uri: displayImage }} style={s.summaryImage} />
          <View style={s.summaryBody}>
            <Text style={s.summaryTitle}>{displayTitle}</Text>
            <View style={s.summaryRow}>
              <Ionicons name="location-outline" size={13} color={colors.venueSubtext} />
              <Text style={s.summaryVenue}>
                {displayVenue}{displayCity ? `, ${displayCity}` : ''}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.venueSubtext} />
              <Text style={s.summaryMeta}>
                {formatShowDate(displayDate)} • {formatTime(displayTime)}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Ionicons name="ticket-outline" size={13} color={colors.venueSubtext} />
              <Text style={s.summaryMeta}>{displaySeats}</Text>
            </View>
          </View>
        </View>

        {/* Amount */}
        <View style={s.amountRow}>
          <Text style={s.amountLabel}>Total due</Text>
          <Text style={s.amountValue}>${displayTotal.toFixed(2)}</Text>
        </View>

        {/* Card Form */}
        <Text style={s.sectionLabel}>Card Details</Text>

        <View style={s.cardVisual}>
          <View style={s.cardChip}>
            <View style={s.chipLine} />
            <View style={s.chipLine} />
          </View>
          <Text style={s.cardNumberDisplay}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={s.cardBottom}>
            <View>
              <Text style={s.cardFieldLabel}>CARD HOLDER</Text>
              <Text style={s.cardFieldValue}>{cardHolder || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.cardFieldLabel}>EXPIRES</Text>
              <Text style={s.cardFieldValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.inputLabel}>Card Number</Text>
          <TextInput
            style={s.input}
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.inputLabel}>Card Holder Name</Text>
          <TextInput
            style={s.input}
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholder="John Doe"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />
        </View>

        <View style={s.inputRow}>
          <View style={[s.inputGroup, { flex: 1 }]}>
            <Text style={s.inputLabel}>Expiry Date</Text>
            <TextInput
              style={s.input}
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              placeholder="MM/YY"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={[s.inputGroup, { flex: 1 }]}>
            <Text style={s.inputLabel}>CVV</Text>
            <TextInput
              style={s.input}
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {success ? (
          <View style={s.successBox}>
            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            <Text style={s.successText}>Payment successful! Redirecting…</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.payBtn, (!isValid || processing) && s.payBtnDisabled]}
            activeOpacity={0.85}
            onPress={handlePay}
            disabled={!isValid || processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={15} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.payBtnText}>Pay ${displayTotal.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <Text style={s.disclaimer}>
          This is a demo payment. No real transaction will occur.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },

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

    // Summary
    summaryCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      marginTop: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    summaryImage: {
      width: 90,
      height: 110,
    },
    summaryBody: {
      flex: 1,
      padding: 12,
      gap: 5,
      justifyContent: 'center',
    },
    summaryTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 2,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    summaryVenue: {
      fontSize: 12,
      color: colors.venueSubtext,
    },
    summaryMeta: {
      fontSize: 12,
      color: colors.venueSubtext,
    },

    // Amount
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 24,
    },
    amountLabel: {
      fontSize: 14,
      color: colors.venueSubtext,
      fontWeight: '500',
    },
    amountValue: {
      fontSize: 22,
      fontWeight: '800',
      color: '#10B981',
    },

    sectionLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.sectionTitle,
      marginBottom: 14,
    },

    // Card visual
    cardVisual: {
      backgroundColor: colors.INDIGO,
      borderRadius: 18,
      padding: 22,
      marginBottom: 22,
      shadowColor: colors.INDIGO,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    cardChip: {
      width: 36,
      height: 28,
      backgroundColor: '#F59E0B',
      borderRadius: 6,
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 4,
      marginBottom: 22,
    },
    chipLine: {
      height: 2,
      backgroundColor: 'rgba(0,0,0,0.25)',
      borderRadius: 1,
    },
    cardNumberDisplay: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 3,
      marginBottom: 20,
    },
    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardFieldLabel: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.6)',
      letterSpacing: 1,
      marginBottom: 3,
    },
    cardFieldValue: {
      fontSize: 13,
      fontWeight: '700',
      color: '#fff',
    },

    // Inputs
    inputGroup: {
      marginBottom: 14,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 0,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.label,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.inputText,
    },

    // Error / Success
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: 10,
      padding: 12,
      marginTop: 4,
      marginBottom: 12,
    },
    errorText: {
      fontSize: 13,
      color: '#EF4444',
      flex: 1,
    },
    successBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#F0FDF4',
      borderRadius: 10,
      padding: 14,
      marginTop: 4,
      marginBottom: 12,
    },
    successText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#22C55E',
    },

    // Pay button
    payBtn: {
      backgroundColor: colors.INDIGO,
      borderRadius: 12,
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    payBtnDisabled: {
      opacity: 0.45,
    },
    payBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },

    disclaimer: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.venueSubtext,
      marginTop: 12,
    },
  });
}
