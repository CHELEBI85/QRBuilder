import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TabScreenAdFooter from '../components/TabScreenAdFooter';

import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import PreviewScreen from '../screens/PreviewScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CreateStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Create"
        component={CreateScreen}
        options={({ route }) => ({
          title: route.params?.qrType?.label || 'Oluştur',
          headerBackTitle: 'Geri',
        })}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ title: 'QR Önizleme', headerBackTitle: 'Geri' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ title: 'Premium', headerBackTitle: 'Geri' }}
      />
    </Stack.Navigator>
  );
}

function MainTabBar(props) {
  const { theme } = useTheme();
  const current = props.state.routes[props.state.index];
  const routeName = current?.name;
  if (routeName === 'ScannerTab') {
    return null;
  }
  return (
    <View style={{ backgroundColor: theme.tabBar }}>
      <TabScreenAdFooter />
      <BottomTabBar {...props} />
    </View>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Tab bar content height + device bottom inset (gesture bar / home indicator)
  const tabBarHeight = 58 + Math.max(insets.bottom, 8);
  const tabBarBottomPad = Math.max(insets.bottom, 8);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(tabBarProps) => <MainTabBar {...tabBarProps} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
            borderTopWidth: 1,
            position: 'relative',
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: tabBarBottomPad,
          },
          tabBarItemStyle: {
            paddingTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        }}
      >
        <Tab.Screen
          name="CreateTab"
          component={CreateStack}
          options={{
            tabBarLabel: 'Oluştur',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="qr-code-2" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryScreen}
          options={{
            tabBarLabel: 'Geçmiş',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="history" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ScannerTab"
          component={ScannerScreen}
          options={{
            tabBarLabel: 'Tara',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="qr-code-scanner" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Ayarlar',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
