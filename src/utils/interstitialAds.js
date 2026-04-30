import { resolveInterstitialUnitId, shouldUseAds } from '../constants/adMob';
import { ensureMobileAdsInitialized } from './initMobileAds';

function logAdError(prefix, err) {
  console.warn(prefix, {
    code: err?.code,
    domain: err?.domain,
    message: err?.message,
    responseInfo: err?.responseInfo,
  });
}

/**
 * Her QR oluşturulduğunda (PreviewScreen mount) çağrılır.
 * Premium kullanıcılarda ve Expo Go'da no-op.
 */
export async function showInterstitialOnQrCreated({ isPremium }) {
  if (!shouldUseAds() || isPremium) return;

  try {
    await ensureMobileAdsInitialized();
    const mod = await import('react-native-google-mobile-ads');
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
        try { u(); } catch (_) {}
      }
    };

    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        cleanup();
        try {
          interstitial.show();
        } catch (e) {
          console.warn('[Ads] interstitial show:', e?.message);
        }
      })
    );
    unsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, (err) => {
        cleanup();
        logAdError('[Ads] interstitial load failed', err);
      })
    );

    interstitial.load();
  } catch (e) {
    logAdError('[Ads] interstitial flow', e);
  }
}
