import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ProfileScreen from './screens/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Navigator() {
  const [screen, setScreen] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setScreen(token ? 'Discover' : 'Login');
    });
  }, []);

  if (screen === null) return null;

  if (screen === 'Register') {
    return <RegisterScreen onNavigateLogin={() => setScreen('Login')} onNavigateDiscover={() => setScreen('Discover')} />;
  }
  if (screen === 'Discover') {
    return <DiscoverScreen onNavigateProfile={() => setScreen('Profile')} />;
  }
  if (screen === 'Profile') {
    return <ProfileScreen onNavigateDiscover={() => setScreen('Discover')} onLogout={() => setScreen('Login')} />;
  }
  return <LoginScreen onNavigateRegister={() => setScreen('Register')} onNavigateDiscover={() => setScreen('Discover')} />;
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
