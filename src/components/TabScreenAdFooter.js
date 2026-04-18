import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { resolveBannerUnitId, shouldUseAds } from '../constants/adMob';

/**
 * Özel tabBar içinde kullan: anchored banner (premium’da gizlenir).
 * Tarayıcı sekmesi `MainTabBar` içinde hiç render edilmez.
 */
export default function TabScreenAdFooter() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [adsModule, setAdsModule] = useState(null);

  const eligible = shouldUseAds() && !subscriptionLoading && !isPremium;

  useEffect(() => {
    if (!eligible) {
      setAdsModule(null);
      return undefined;
    }
    let cancelled = false;
    import('react-native-google-mobile-ads')
      .then(async (m) => {
        try {
          await m.default().initialize();
        } catch (e) {
          console.warn('[Ads] Mobile Ads init failed:', e?.message);
          return null;
        }
        return m;
      })
      .then((m) => {
        if (!cancelled && m) setAdsModule(m);
      })
      .catch(() => {
        if (!cancelled) setAdsModule(null);
      });
    return () => {
      cancelled = true;
    };
  }, [eligible]);

  if (!eligible || !adsModule) return null;

  const { BannerAd, BannerAdSize } = adsModule;
  const unitId = resolveBannerUnitId(adsModule.TestIds);
  if (!unitId) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.tabBar,
        borderTopWidth: 1,
        borderTopColor: theme.tabBarBorder,
      }}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        width={width}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(e) => console.warn('[Ads] banner failed:', e?.message)}
      />
    </View>
  );
}
