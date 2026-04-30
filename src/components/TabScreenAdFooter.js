import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  resolveBannerUnitId,
  shouldUseAds,
} from '../constants/adMob';
import { ensureMobileAdsInitialized } from '../utils/initMobileAds';

function logAdError(prefix, err) {
  console.warn(prefix, {
    code: err?.code,
    domain: err?.domain,
    message: err?.message,
    responseInfo: err?.responseInfo,
  });
}

export default function TabScreenAdFooter() {
  const { theme } = useTheme();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [adsModule, setAdsModule] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const retryTimer = useRef(null);

  const eligible = shouldUseAds() && !subscriptionLoading && !isPremium;

  useEffect(() => {
    if (!eligible) {
      setAdsModule(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      await ensureMobileAdsInitialized();
      try {
        const m = await import('react-native-google-mobile-ads');
        if (!cancelled) setAdsModule(m);
      } catch (_) {
        if (!cancelled) setAdsModule(null);
      }
    })();
    return () => {
      cancelled = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [eligible]);

  if (!eligible || !adsModule) return null;

  const { BannerAd, BannerAdSize } = adsModule;
  // Release uses the configured production banner unit from app.json.
  const bannerSize = BannerAdSize.BANNER;
  const unitId = resolveBannerUnitId(adsModule.TestIds, bannerSize);
  if (!unitId) return null;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.tabBar,
        borderTopWidth: 1,
        borderTopColor: theme.tabBarBorder,
        minHeight: 52,
      }}
    >
      <BannerAd
        key={retryKey}
        unitId={unitId}
        size={bannerSize}
        requestOptions={{}}
        onAdLoaded={() => __DEV__ && console.log('[Ads] banner loaded')}
        onAdFailedToLoad={(err) => {
          logAdError('[Ads] banner load failed', err);
          // 30 saniye sonra bir kez daha dene
          retryTimer.current = setTimeout(() => setRetryKey((k) => k + 1), 30000);
        }}
      />
    </View>
  );
}
