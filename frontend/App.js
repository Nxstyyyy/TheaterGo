import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

function Navigator() {
  const [screen, setScreen] = useState('Login');

  if (screen === 'Register') {
    return <RegisterScreen onNavigateLogin={() => setScreen('Login')} />;
  }
  return <LoginScreen onNavigateRegister={() => setScreen('Register')} />;
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
