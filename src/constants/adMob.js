import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Google sample App ID'leri app.json plugin'de (test).
 * Mağaza yayını öncesi AdMob'dan aldığın gerçek App ID ile değiştir.
 *
 * Üretim banner birim ID'leri: app.json → extra.admobBannerAndroid / admobBannerIos
 * (boş bırakılırsa yalnızca __DEV__ iken Google test birimi kullanılır).
 */
export function isExpoGoClient() {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient'
  );
}

export function shouldUseAds() {
  if (Platform.OS === 'web') return false;
  if (isExpoGoClient()) return false;
  return true;
}

export function getConfiguredBannerUnitIdFromExtra() {
  const extra = Constants.expoConfig?.extra ?? {};
  const raw = Platform.OS === 'ios' ? extra.admobBannerIos : extra.admobBannerAndroid;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getConfiguredInterstitialUnitIdFromExtra() {
  const extra = Constants.expoConfig?.extra ?? {};
  const raw =
    Platform.OS === 'ios' ? extra.admobInterstitialIos : extra.admobInterstitialAndroid;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * @param {typeof import('react-native-google-mobile-ads').TestIds} TestIds
 */
export function resolveBannerUnitId(TestIds) {
  const fromExtra = getConfiguredBannerUnitIdFromExtra();
  if (fromExtra) return fromExtra;
  if (__DEV__) return TestIds.ADAPTIVE_BANNER;
  return null;
}

/**
 * @param {typeof import('react-native-google-mobile-ads').TestIds} TestIds
 */
export function resolveInterstitialUnitId(TestIds) {
  const fromExtra = getConfiguredInterstitialUnitIdFromExtra();
  if (fromExtra) return fromExtra;
  if (__DEV__) return TestIds.INTERSTITIAL;
  return null;
}
