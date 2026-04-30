import { shouldUseAds } from '../constants/adMob';

let initPromise = null;

export function ensureMobileAdsInitialized() {
  if (!shouldUseAds()) return null;

  if (!initPromise) {
    initPromise = import('react-native-google-mobile-ads')
      .then(async (m) => {
        const mobileAds = m.default();
        // setRequestConfiguration initialize()'dan ÖNCE çağrılmalı.
        await mobileAds.setRequestConfiguration({
          testDeviceIdentifiers: ['EMULATOR', '8ABE056ADFD53418C5DD947AEA101548'],
        });
        await mobileAds.initialize();
        console.warn('[Ads] MobileAds.initialize OK');
      })
      .catch((e) => {
        initPromise = null;
        console.warn('[Ads] ensureMobileAdsInitialized failed:', e?.message);
      });
  }

  return initPromise;
}
