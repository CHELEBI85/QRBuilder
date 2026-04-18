import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveInterstitialUnitId, shouldUseAds } from '../constants/adMob';

const STORAGE_KEY = '@qrbuilder_qr_export_count_ads';
/** Her kaç başarılı kayıtta (galeri veya geçmiş) bir geçiş reklamı denensin */
export const INTERSTITIAL_EVERY_N_EXPORTS = 3;

/**
 * Galeriye veya geçmişe başarılı kayıt sonrası çağır (aynı önizleme oturumunda yalnızca bir kez).
 * Premium / Expo Go / web'de no-op.
 */
export async function recordQrExportSuccessAndMaybeShowInterstitial({ isPremium }) {
  if (!shouldUseAds() || isPremium) return;

  let count = 0;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    count = raw ? parseInt(raw, 10) || 0 : 0;
  } catch (_) {
    return;
  }

  count += 1;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(count));
  } catch (_) {
    return;
  }

  if (count % INTERSTITIAL_EVERY_N_EXPORTS !== 0) return;

  try {
    const mod = await import('react-native-google-mobile-ads');
    await mod.default().initialize();
    const unitId = resolveInterstitialUnitId(mod.TestIds);
    if (!unitId) return;

    const { InterstitialAd, AdEventType } = mod;
    const interstitial = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribers = [];
    const cleanup = () => {
      while (unsubscribers.length) {
        const u = unsubscribers.pop();
        try {
          u();
        } catch (_) {}
      }
    };

    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        cleanup();
        try {
          interstitial.show();
        } catch (e) {
          if (__DEV__) console.warn('[Ads] interstitial show:', e?.message);
        }
      })
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, (err) => {
        cleanup();
        console.warn('[Ads] interstitial load failed:', err?.message);
      })
    );

    interstitial.load();
  } catch (e) {
    if (__DEV__) console.warn('[Ads] interstitial flow:', e?.message);
  }
}
