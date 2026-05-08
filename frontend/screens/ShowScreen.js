import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "../utils/authFetch";
import { useTheme } from "../context/ThemeContext";

const API_URL = __DEV__
  ? "http://10.0.2.2:5000"
  : process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export default function ShowScreen({
  show,
  onBack,
  onNavigateProfile,
  onNavigateVenue,
  onNavigateBook,
}) {
  const { colors } = useTheme();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const s = makeStyles(colors);

  // Fetch all shows and filter by this production to get all showtimes
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/api/shows`);
        if (!res) return;
        if (!res.ok) throw new Error("Failed to load showtimes");
        const data = await res.json();
        setShowtimes(
          data.filter((s) => s.production_id === show.production_id),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [show.production_id]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.heroWrapper}>
          <Image source={{ uri: show.image_url }} style={s.heroImage} />
          <View style={s.heroOverlay} />

          <TouchableOpacity
            style={s.backBtn}
            onPress={onBack}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{show.genre?.toUpperCase()}</Text>
          </View>

          <View style={s.heroContent}>
            <Text style={s.heroTitle}>{show.title}</Text>
            <TouchableOpacity
              style={s.heroVenueRow}
              onPress={() =>
                onNavigateVenue?.({
                  name: show.venue_name,
                  city: show.city,
                  image_url: show.venue_image_url,
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={s.heroVenue}>{show.venue_name}</Text>
              <Text style={s.heroCity}>{show.city}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick stats strip */}
        <View style={s.statsStrip}>
          <View style={s.statItem}>
            <MaterialCommunityIcons
              name="theater"
              size={18}
              color={colors.INDIGO}
            />
            <Text style={s.statLabel}>Live Theatre</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.INDIGO} />
            <Text style={s.statLabel}>
              {showtimes.length} showing{showtimes.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            {show.is_trending ? (
              <Ionicons name="flame-outline" size={18} color={colors.INDIGO} />
            ) : (
              <Ionicons name="star-outline" size={18} color={colors.INDIGO} />
            )}
            <Text style={s.statLabel}>
              {show.is_trending ? "Trending" : "Now Playing"}
            </Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Showtimes */}
          <Text style={s.sectionTitle}>Available Dates</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.INDIGO}
              style={{ marginTop: 16 }}
            />
          ) : error ? (
            <Text style={s.errorText}>{error}</Text>
          ) : showtimes.length === 0 ? (
            <Text style={s.emptyText}>No upcoming showtimes.</Text>
          ) : (
            showtimes.map((item) => (
              <View key={item.show_id} style={s.showtimeCard}>
                <View style={s.showtimeDateCol}>
                  <Text style={s.showtimeDay}>
                    {new Date(item.show_date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </Text>
                  <Text style={s.showtimeDayNum}>
                    {new Date(item.show_date).getDate()}
                  </Text>
                  <Text style={s.showtimeMonth}>
                    {new Date(item.show_date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </Text>
                </View>
                <View style={s.showtimeDivider} />
                <View style={s.showtimeInfo}>
                  <Text style={s.showtimeFullDate}>
                    {formatDate(item.show_date)}
                  </Text>
                  <View style={s.showtimeTimeRow}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={colors.venueSubtext}
                    />
                    <Text style={s.showtimeTime}>
                      {formatTime(item.show_time)}
                    </Text>
                  </View>
                  <View style={s.seatsRow}>
                    <Ionicons
                      name="ticket-outline"
                      size={12}
                      color={
                        item.available_seats === 0
                          ? (colors.error ?? "#e53e3e")
                          : "#22c55e"
                      }
                    />
                    <Text
                      style={[
                        s.seatsText,
                        item.available_seats === 0 && s.seatsTextFull,
                      ]}
                    >
                      {item.available_seats === 0
                        ? "Sold out"
                        : `${item.available_seats} seats left`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    s.bookBtn,
                    item.available_seats === 0 && s.bookBtnDisabled,
                  ]}
                  activeOpacity={item.available_seats === 0 ? 1 : 0.85}
                  onPress={() =>
                    item.available_seats > 0 && onNavigateBook?.(item)
                  }
                >
                  <Text style={s.bookBtnText}>
                    {item.available_seats === 0 ? "Sold Out" : "Book"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Venue shortcut */}
          <Text style={[s.sectionTitle, { marginTop: 28 }]}>Venue</Text>
          <TouchableOpacity
            style={s.venueCard}
            activeOpacity={0.85}
            onPress={() =>
              onNavigateVenue?.({
                name: show.venue_name,
                city: show.city,
                image_url: show.venue_image_url,
              })
            }
          >
            {show.venue_image_url && (
              <Image
                source={{ uri: show.venue_image_url }}
                style={s.venueImage}
              />
            )}
            <View style={s.venueInfo}>
              <Text style={s.venueName}>{show.venue_name}</Text>
              <View style={s.venueMetaRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={colors.venueSubtext}
                />
                <Text style={s.venueMeta}>{show.city}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.navInactive}
            />
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        {[
          { label: "Discover", icon: "compass-outline", onPress: onBack },
          {
            label: "Profile",
            icon: "person-outline",
            onPress: onNavigateProfile,
          },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={s.navTab}
            onPress={tab.onPress}
          >
            <Ionicons name={tab.icon} size={22} color={colors.navInactive} />
            <Text style={[s.navLabel, { color: colors.navInactive }]}>
              {tab.label}
            </Text>
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
      height: 300,
      position: "relative",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.48)",
    },
    backBtn: {
      position: "absolute",
      top: 14,
      left: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroBadge: {
      position: "absolute",
      top: 18,
      right: 16,
      backgroundColor: colors.INDIGO,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    heroBadgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
    },
    heroContent: {
      position: "absolute",
      bottom: 22,
      left: 20,
      right: 20,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 8,
    },
    heroVenueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    heroVenue: {
      fontSize: 14,
      fontWeight: "600",
      color: "rgba(255,255,255,0.9)",
    },
    heroCity: {
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
    },

    // Stats strip
    statsStrip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.venueBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.venueBorder,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.venueSubtext,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.venueBorder,
    },

    // Body
    body: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.sectionTitle,
      marginBottom: 14,
    },

    // Showtime cards
    showtimeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    showtimeDateCol: {
      alignItems: "center",
      minWidth: 44,
    },
    showtimeDay: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.venueSubtext,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    showtimeDayNum: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.INDIGO,
      lineHeight: 30,
    },
    showtimeMonth: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.venueSubtext,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    showtimeDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.venueBorder,
      marginHorizontal: 14,
    },
    showtimeInfo: {
      flex: 1,
    },
    showtimeFullDate: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.sectionTitle,
      marginBottom: 4,
    },
    showtimeTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    showtimeTime: {
      fontSize: 13,
      color: colors.venueSubtext,
    },
    seatsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    seatsText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#22c55e",
    },
    seatsTextFull: {
      color: colors.error ?? "#e53e3e",
    },
    bookBtn: {
      backgroundColor: colors.INDIGO,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    bookBtnDisabled: {
      backgroundColor: colors.inputBorder ?? "#ccc",
    },
    bookBtnText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },

    // Venue card
    venueCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.venueBg,
      borderWidth: 1,
      borderColor: colors.venueBorder,
      borderRadius: 14,
      padding: 12,
    },
    venueImage: {
      width: 64,
      height: 64,
      borderRadius: 10,
      marginRight: 14,
    },
    venueInfo: {
      flex: 1,
    },
    venueName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.sectionTitle,
      marginBottom: 4,
    },
    venueMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    venueMeta: {
      fontSize: 13,
      color: colors.venueSubtext,
    },

    // Feedback
    errorText: {
      textAlign: "center",
      color: "#e74c3c",
      fontSize: 14,
      marginTop: 16,
    },
    emptyText: {
      textAlign: "center",
      color: colors.venueSubtext,
      fontSize: 14,
      marginTop: 16,
    },

    // Bottom nav
    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.navBg,
      borderTopWidth: 1,
      borderTopColor: colors.navBorder,
      paddingBottom: 20,
      paddingTop: 10,
    },
    navTab: {
      flex: 1,
      alignItems: "center",
      gap: 3,
    },
    navLabel: {
      fontSize: 11,
      fontWeight: "500",
    },
  });
}
