import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { QR_TYPES } from '../constants/qrTypes';
import QRTypeCard from '../components/QRTypeCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import AppText from '../components/AppText';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { isPremium, loading: subscriptionLoading } = useSubscription();

  const handleTypePress = (item) => {
    if (subscriptionLoading) return;
    const needsPremium = item.premium === true && !isPremium;
    if (needsPremium) {
      navigation.navigate('Paywall', { qrType: item });
    } else {
      navigation.navigate('Create', { qrType: item });
    }
  };

  const renderItem = ({ item }) => (
    <QRTypeCard item={item} disabled={subscriptionLoading} onPress={() => handleTypePress(item)} />
  );

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.screenInner}>
      <SectionHeader
        title="QR Oluştur"
        subtitle="Bir tür seçin — kilit rozeti Premium gerektirir."
      />
      <AppText
        variant="caption"
        tone="tertiary"
        style={{
          paddingHorizontal: theme.spacing.xl,
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.sm,
          lineHeight: 18,
        }}
      >
        Ücretsiz: URL ve Metin · Diğer türler Premium ile açılır
      </AppText>
      <View style={styles.listWrap}>
        <FlatList
          data={QR_TYPES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={styles.list}
          columnWrapperStyle={styles.column}
          contentContainerStyle={[
            styles.grid,
            {
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.xxl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenInner: {
    flex: 1,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  listWrap: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  column: {
    justifyContent: 'flex-start',
  },
  grid: {
    flexGrow: 1,
  },
});
