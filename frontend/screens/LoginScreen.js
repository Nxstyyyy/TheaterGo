import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ onNavigateRegister }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={colors.statusBar} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Top logo bar */}
          <View style={styles.logoBar}>
            <View style={styles.logoIconWrapper}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.logoText}>StageDoor</Text>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.logoText} />
            </TouchableOpacity>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your digital tickets</Text>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="google" size={18} color={colors.socialIconColor} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={18} color={colors.socialIconColor} />
                <Text style={styles.socialText}>
                  <Text style={styles.socialIOS}>iOS </Text>Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email field */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={colors.iconColor} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password field */}
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.iconColor} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={colors.iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Sign In button */}
            <TouchableOpacity style={styles.signInBtn} activeOpacity={0.85}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New to the theater? </Text>
              <TouchableOpacity onPress={onNavigateRegister}>
                <Text style={styles.footerLink}>Join the Audience</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return {
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  // Logo bar
  logoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 32,
    marginLeft: 4,
  },
  logoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.INDIGO,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.logoText,
    flex: 1,
  },
  themeToggle: {
    padding: 4,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.title,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtitle,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.socialBorder,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: colors.socialBg,
  },
  socialText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.socialText,
  },
  socialIOS: {
    fontSize: 10,
    color: colors.subtitle,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dividerLine,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '600',
    color: colors.dividerText,
    letterSpacing: 1,
  },

  // Inputs
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: colors.inputText,
  },
  eyeBtn: {
    padding: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.INDIGO,
  },

  // Sign In button
  signInBtn: {
    backgroundColor: colors.INDIGO,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.footerText,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.INDIGO,
  },
  };
}
