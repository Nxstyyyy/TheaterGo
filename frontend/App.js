import { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export default function App() {
  const [screen, setScreen] = useState('Login');

  if (screen === 'Register') {
    return <RegisterScreen onNavigateLogin={() => setScreen('Login')} />;
  }
  return <LoginScreen onNavigateRegister={() => setScreen('Register')} />;
}
