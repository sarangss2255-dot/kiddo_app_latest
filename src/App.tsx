import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

// Lazy loading doesn't work the same in RN as web, using standard imports for stability
import Login from './pages/Login';
import KidDashboard from './pages/KidDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Onboarding from './pages/Onboarding';

function Navigation() {
  const { user, profile, loading, isAuthReady } = useAuth();

  if (!isAuthReady || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffbeb' }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={Login} />
      ) : !profile ? (
        <Stack.Screen name="Onboarding" component={Onboarding} />
      ) : (
        <>
          {profile.role === 'kid' && (
            <Stack.Screen name="KidDashboard" component={KidDashboard} />
          )}
          {profile.role === 'parent' && (
            <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
