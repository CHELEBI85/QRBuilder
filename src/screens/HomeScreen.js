import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { QR_TYPES } from '../constants/qrTypes';
import QRTypeCard from '../components/QRTypeCard';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { isPremium } = useSubscription();

  const handleTypePress = (item) => {
    const needsPremium = item.premium === true && !isPremium;
    if (needsPremium) {
      navigation.navigate('Paywall', { qrType: item });
    } else {
      navigation.navigate('Create', { qrType: item });
    }
  };

  const renderItem = ({ item }) => (
    <QRTypeCard item={item} onPress={() => handleTypePress(item)} />
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>QR Oluştur</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Bir QR kodu türü seçin
        </Text>
      </View>
      <FlatList
        data={QR_TYPES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
});
