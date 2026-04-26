import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Rocket, ShieldCheck, Heart, LogIn } from 'lucide-react-native';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Rocket color="#d97706" size={48} />
        </View>
        <Text style={styles.title}>KidTasker</Text>
        <Text style={styles.subtitle}>Make chores fun and earn awesome rewards!</Text>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
             <View style={[styles.miniIcon, {backgroundColor: '#dbeafe'}]}><ShieldCheck color="#2563eb" size={20} /></View>
             <Text style={styles.featureLabel}>Secure</Text>
          </View>
          <View style={styles.featureItem}>
             <View style={[styles.miniIcon, {backgroundColor: '#fce7f3'}]}><Heart color="#db2777" size={20} /></View>
             <Text style={styles.featureLabel}>Family</Text>
          </View>
          <View style={styles.featureItem}>
             <View style={[styles.miniIcon, {backgroundColor: '#dcfce7'}]}><LogIn color="#16a34a" size={20} /></View>
             <Text style={styles.featureLabel}>Easy</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} style={styles.googleBtn}>
           <Text style={styles.googleBtnText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>By signing in, you agree to our family-friendly terms.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', padding: 32, borderRadius: 40, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, borderWidth: 4, borderColor: '#fef3c7' },
  iconCircle: { width: 96, height: 96, backgroundColor: '#fef3c7', borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#451a03', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#92400e', fontWeight: '600', textAlign: 'center', marginBottom: 40 },
  featureRow: { flexDirection: 'row', gap: 24, marginBottom: 48 },
  featureItem: { alignItems: 'center', gap: 8 },
  miniIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  featureLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  googleBtn: { backgroundColor: '#f59e0b', width: '100%', paddingVertical: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  googleBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  disclaimer: { marginTop: 32, fontSize: 12, color: '#d1d5db', textAlign: 'center' },
});
