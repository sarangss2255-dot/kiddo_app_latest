import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Baby, Users, ShieldAlert } from 'lucide-react-native';
import { auth } from '../firebase';
import { UserRole } from '../types';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Onboarding({ navigation }: any) {
  const { refreshProfile } = useAuth();
  const [role, setRole] = React.useState<UserRole | null>(null);
  const [familyName, setFamilyName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleComplete = async () => {
    if (!auth.currentUser || !role) return;
    setLoading(true);
    try {
      // Create family and register user in MongoDB via API
      // For simplicity, we send both in one register call or let the backend handle it
      await api.post('/register', {
        firebaseUid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || 'New User',
        role,
        familyName: familyName || 'Our Awesome Family'
      });

      await refreshProfile();
      // Navigation will be handled by App.tsx observer through refreshProfile update
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kbView}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Welcome to KidTasker!</Text>
          <Text style={styles.subtitle}>Let's get your profile set up. Who are you today?</Text>

          <View style={styles.roleGrid}>
            {[
              { id: 'kid', label: 'I am a Kid', icon: Baby, color: '#22c55e', bg: '#f0fdf4' },
              { id: 'parent', label: 'I am a Parent', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
              { id: 'admin', label: 'System Admin', icon: ShieldAlert, color: '#ef4444', bg: '#fef2f2' }
            ].map(item => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => setRole(item.id as UserRole)}
                style={[
                  styles.roleCard, 
                  role === item.id ? { borderColor: item.color, backgroundColor: item.bg } : styles.roleCardInactive
                ]}
              >
                <item.icon color={role === item.id ? item.color : '#94a3b8'} size={40} />
                <Text style={[styles.roleLabel, role === item.id ? { color: item.color } : { color: '#94a3b8' }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {role === 'parent' && (
            <View style={styles.form}>
              <Text style={styles.label}>Family Name</Text>
              <TextInput 
                style={styles.input}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="e.g. The Incredibles"
              />
            </View>
          )}

          <TouchableOpacity 
            disabled={!role || loading} 
            onPress={handleComplete} 
            style={[styles.btn, (!role || loading) && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>{loading ? 'Setting up...' : 'Let\'s Go! 🚀'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ff' },
  kbView: { flex: 1 },
  scroll: { padding: 30, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '900', color: '#1e1b4b', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#4338ca', fontWeight: '500', marginBottom: 40 },
  roleGrid: { gap: 16, marginBottom: 40 },
  roleCard: { padding: 24, borderRadius: 24, borderWidth: 3, alignItems: 'center', flexDirection: 'row', gap: 20 },
  roleCardInactive: { backgroundColor: '#fff', borderColor: '#f1f5f9' },
  roleLabel: { fontSize: 18, fontWeight: '800' },
  form: { marginBottom: 32 },
  label: { fontSize: 12, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: '#fff', padding: 18, borderRadius: 16, fontSize: 18, borderWidth: 2, borderColor: '#e2e8f0', color: '#1e293b' },
  btn: { backgroundColor: '#4f46e5', paddingVertical: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnDisabled: { backgroundColor: '#cbd5e1', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '900' },
});
