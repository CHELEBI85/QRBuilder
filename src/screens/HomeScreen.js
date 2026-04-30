import React from 'react';
import { View, FlatList, StyleSheet, Image, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { QR_TYPES } from '../constants/qrTypes';
import QRTypeCard from '../components/QRTypeCard';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import { AppButton, PremiumChip, ScreenHeader, SectionCard } from '../components/ui';


const LOGO_ON_DARK = require('../../assets/siyahlogo.png');
const LOGO_ON_LIGHT = require('../../assets/beyazlogo.png');

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { isPremium, loading: subscriptionLoading } = useSubscription();

  const freeTypes = QR_TYPES.filter((t) => t.premium !== true);
  const premiumTypes = QR_TYPES.filter((t) => t.premium === true);

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

  const header = (
    <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl }}>
      <ScreenHeader
        left={
          <View style={styles.brandLeft}>
            <View
              style={[
                styles.miniLogoPlate,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Image
                source={isDark ? LOGO_ON_DARK : LOGO_ON_LIGHT}
                style={styles.miniLogo}
                resizeMode="contain"
              />
            </View>
            <AppText variant="headline" tone="primary" style={styles.brandWordmark} numberOfLines={1}>
              QRBuilder
            </AppText>
          </View>
        }
        right={
          isPremium ? (
            <PremiumChip kind="premium" label="Aktif" />
          ) : (
            <PremiumChip kind="locked" label="Premium" />
          )
        }
      />

      {!isPremium ? (
        <SectionCard padding="lg" style={{ marginBottom: theme.spacing.lg }}>
          <View style={styles.upsellTopRow}>
            <PremiumChip kind="premium" label="Daha fazla tür" />
          </View>
          <AppText variant="headline" tone="primary" style={styles.upsellTitle}>
            Daha fazla QR türünün kilidini aç
          </AppText>
          <AppText variant="subbody" tone="tertiary" style={styles.upsellDesc}>
            Wi‑Fi, kişi (vCard), konum ve sosyal medya türleri dahil. Tek abonelikle sınırsız oluştur.
          </AppText>
          <View style={{ marginTop: theme.spacing.md }}>
            <AppButton
              label="Premium'u Gör"
              onPress={() => navigation.navigate('Paywall')}
              variant="primary"
            />
          </View>
        </SectionCard>
      ) : null}

      <View style={[styles.legendRow, { marginBottom: theme.spacing.sm }]}>
        <AppText variant="sectionLabel" tone="secondary" style={{ flex: 1 }}>
          TÜRLER
        </AppText>
        {!isPremium ? <PremiumChip kind="locked" label="Premium" /> : null}
      </View>
    </View>
  );

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.screenInner}>
      <View style={styles.listWrap}>
        <FlatList
          data={isPremium ? QR_TYPES : [...freeTypes, ...premiumTypes]}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          style={styles.list}
          columnWrapperStyle={styles.column}
          ListHeaderComponent={header}
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
  miniLogoPlate: {
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      default: {},
    }),
  },
  miniLogo: {
    width: 40,
    height: 40,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  brandWordmark: {
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  upsellTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  upsellTitle: {
    marginTop: 10,
    fontWeight: '900',
  },
  upsellDesc: {
    marginTop: 6,
    lineHeight: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
