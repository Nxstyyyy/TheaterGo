import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, StatusBar, BackHandler } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DiscoverScreen from "./screens/DiscoverScreen";
import ProfileScreen from "./screens/ProfileScreen";
import VenueScreen from "./screens/VenueScreen";
import ShowScreen from "./screens/ShowScreen";
import AllShowsScreen from "./screens/AllShowsScreen";
import BookScreen from "./screens/BookScreen";
import TicketScreen from "./screens/TicketScreen";
import PaymentScreen from "./screens/PaymentScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLogoutHandler } from "./utils/authFetch";
import API_URL from "./utils/apiUrl";

function Navigator() {
  const { isDark } = useTheme();
  const [screen, setScreen] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedBookShow, setSelectedBookShow] = useState(null);
  const [bookSource, setBookSource] = useState("Show");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [paymentBackScreen, setPaymentBackScreen] = useState("Profile");
  const [history, setHistory] = useState([]);

  const snapshot = useCallback(
    () => ({
      screen,
      selectedVenue,
      selectedShow,
      selectedBookShow,
      bookSource,
      selectedBooking,
      selectedPaymentBooking,
      paymentBackScreen,
    }),
    [screen, selectedVenue, selectedShow, selectedBookShow, bookSource, selectedBooking, selectedPaymentBooking, paymentBackScreen]
  );

  const restoreSnapshot = (s) => {
    setScreen(s.screen);
    setSelectedVenue(s.selectedVenue);
    setSelectedShow(s.selectedShow);
    setSelectedBookShow(s.selectedBookShow);
    setBookSource(s.bookSource);
    setSelectedBooking(s.selectedBooking);
    setSelectedPaymentBooking(s.selectedPaymentBooking);
    setPaymentBackScreen(s.paymentBackScreen);
  };

  const goBack = useCallback(() => {
    if (history.length === 0) return false;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    restoreSnapshot(prev);
    return true;
  }, [history]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", goBack);
    return () => sub.remove();
  }, [goBack]);

  const push = useCallback(
    (navigate) => {
      setHistory((h) => [...h, snapshot()]);
      navigate();
    },
    [snapshot]
  );

  const navigateToShow = (show) => push(() => {
    setSelectedShow(show);
    setScreen("Show");
  });
  const navigateToVenue = (venue) => push(() => {
    setSelectedVenue(venue);
    setScreen("Venue");
  });

  const navigateToBook = (show, source = "Show") => push(() => {
    setSelectedBookShow(show);
    setBookSource(source);
    setScreen("Book");
  });
  const navigateToTicket = (booking) => push(() => {
    setSelectedBooking(booking);
    setScreen("Ticket");
  });
  const navigateToPayment = (booking, backScreen = "Profile") => push(() => {
    setSelectedPaymentBooking(booking);
    setPaymentBackScreen(backScreen);
    setScreen("Payment");
  });

  useEffect(() => {
    setLogoutHandler(() => setScreen("Login"));
    AsyncStorage.getItem("token").then((token) => {
      setScreen(token ? "Discover" : "Login");
      SplashScreen.hideAsync();
    });
  }, []);

  const renderScreen = () => {
    if (screen === null) return null;
    if (screen === "Register")
      return (
        <RegisterScreen
          onNavigateLogin={() => setScreen("Login")}
          onNavigateDiscover={() => setScreen("Discover")}
        />
      );
    if (screen === "AllShows")
      return (
        <AllShowsScreen
          onBack={goBack}
          onNavigateShow={navigateToShow}
          onNavigateProfile={() => push(() => setScreen("Profile"))}
        />
      );
    if (screen === "Book" && selectedBookShow)
      return (
        <BookScreen
          show={selectedBookShow}
          onBack={goBack}
          onBookingSuccess={goBack}
          onNavigatePayment={(booking) =>
            navigateToPayment(booking, bookSource)
          }
        />
      );
    if (screen === "Show" && selectedShow)
      return (
        <ShowScreen
          show={selectedShow}
          onBack={goBack}
          onNavigateProfile={() => push(() => setScreen("Profile"))}
          onNavigateVenue={navigateToVenue}
          onNavigateBook={(show) => navigateToBook(show, "Show")}
        />
      );
    if (screen === "Venue" && selectedVenue)
      return (
        <VenueScreen
          venue={selectedVenue}
          onBack={goBack}
          onNavigateProfile={() => push(() => setScreen("Profile"))}
          onNavigateBook={(show) => navigateToBook(show, "Venue")}
        />
      );
    if (screen === "Discover")
      return (
        <DiscoverScreen
          onNavigateProfile={() => push(() => setScreen("Profile"))}
          onNavigateVenue={navigateToVenue}
          onNavigateShow={navigateToShow}
          onNavigateAllShows={() => push(() => setScreen("AllShows"))}
        />
      );
    if (screen === "Ticket" && selectedBooking)
      return (
        <TicketScreen
          booking={selectedBooking}
          onBack={goBack}
        />
      );
    if (screen === "Payment" && selectedPaymentBooking)
      return (
        <PaymentScreen
          booking={selectedPaymentBooking}
          onBack={goBack}
          onPaymentSuccess={(confirmedBooking) => {
            setSelectedPaymentBooking(null);
            setSelectedBooking(confirmedBooking);
            setScreen("Ticket");
          }}
        />
      );
    if (screen === "Profile")
      return (
        <ProfileScreen
          onNavigateDiscover={() => push(() => setScreen("Discover"))}
          onLogout={() => setScreen("Login")}
          onNavigateTicket={navigateToTicket}
          onNavigatePayment={navigateToPayment}
        />
      );
    return (
      <LoginScreen
        onNavigateRegister={() => setScreen("Register")}
        onNavigateDiscover={() => setScreen("Discover")}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      {__DEV__ && screen !== null && (
        <View
          style={[
            devStyles.banner,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.82)"
                : "rgba(255,255,255,0.92)",
            },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[devStyles.text, { color: isDark ? "#00ff88" : "#1a1a1a" }]}
          >
            Screen: {screen}
          </Text>
          <Text
            style={[devStyles.text, { color: isDark ? "#00ff88" : "#1a1a1a" }]}
          >
            Debug Mode Enabled
          </Text>
          <Text
            style={[devStyles.text, { color: isDark ? "#00ff88" : "#1a1a1a" }]}
          >
            API: {API_URL}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const devStyles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: StatusBar.currentHeight ?? 24,
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    zIndex: 9999,
  },
  text: {
    fontSize: 10,
    fontFamily: "monospace",
  },
});
