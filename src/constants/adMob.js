import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const USE_ADMOB_TEST_IDS = false;

export const ADMOB_TEST_IDS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    adaptiveBanner: 'ca-app-pub-3940256099942544/9214589741',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    adaptiveBanner: 'ca-app-pub-3940256099942544/2435281174',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

/**
 * Google sample App ID'leri app.json plugin'de (test).
 * Mağaza yayını öncesi AdMob'dan aldığın gerçek App ID ile değiştir.
 *
 * Üretim banner birim ID'leri: app.json → extra.admobBannerAndroid / admobBannerIos (fixed)
 * ve extra.admobAdaptiveBannerAndroid / admobAdaptiveBannerIos (adaptive).
 * (boş bırakılırsa yalnızca __DEV__ iken Google test birimi kullanılır).
 */
export function isExpoGoClient() {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient'
  );
}

export function shouldUseAds() {
  return !isExpoGoClient();
}

export function getConfiguredBannerUnitIdFromExtra() {
  const extra = Constants.expoConfig?.extra ?? {};
  const raw = Platform.OS === 'ios' ? extra.admobBannerIos : extra.admobBannerAndroid;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getConfiguredAdaptiveBannerUnitIdFromExtra() {
  const extra = Constants.expoConfig?.extra ?? {};
  const raw =
    Platform.OS === 'ios' ? extra.admobAdaptiveBannerIos : extra.admobAdaptiveBannerAndroid;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isAdaptiveBannerSize(bannerSize) {
  // react-native-google-mobile-ads uses string values for BannerAdSize enum.
  return (
    bannerSize === 'ANCHORED_ADAPTIVE_BANNER' ||
    bannerSize === 'LARGE_ANCHORED_ADAPTIVE_BANNER' ||
    bannerSize === 'INLINE_ADAPTIVE_BANNER'
  );
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
export function resolveBannerUnitId(TestIds, bannerSize) {
  const adaptive = isAdaptiveBannerSize(bannerSize);
  if (USE_ADMOB_TEST_IDS) {
    const platformIds = Platform.OS === 'ios' ? ADMOB_TEST_IDS.ios : ADMOB_TEST_IDS.android;
    return adaptive ? platformIds.adaptiveBanner : platformIds.banner;
  }

  const fromExtra = adaptive
    ? getConfiguredAdaptiveBannerUnitIdFromExtra()
    : getConfiguredBannerUnitIdFromExtra();
  if (fromExtra) return fromExtra;
  if (__DEV__) return adaptive ? TestIds.ADAPTIVE_BANNER : TestIds.BANNER;
  return null;
}

/**
 * @param {typeof import('react-native-google-mobile-ads').TestIds} TestIds
 */
export function resolveInterstitialUnitId(TestIds) {
  if (USE_ADMOB_TEST_IDS) {
    const platformIds = Platform.OS === 'ios' ? ADMOB_TEST_IDS.ios : ADMOB_TEST_IDS.android;
    return platformIds.interstitial;
  }

  const fromExtra = getConfiguredInterstitialUnitIdFromExtra();
  if (fromExtra) return fromExtra;
  if (__DEV__) return TestIds.INTERSTITIAL;
  return null;
}
