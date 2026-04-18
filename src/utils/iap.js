import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SUBSCRIPTION_SKUS } from '../constants/subscription';

const SKUS = [SUBSCRIPTION_SKUS.MONTHLY, SUBSCRIPTION_SKUS.YEARLY];
let initDone = false;
let initFailed = false;

/** Expo Go yerel modül içermez; react-native-iap NitroModules gerektirir — sadece dev/standalone build'de yükle. */
let rniapPromise = null;
function loadRNIap() {
  if (!rniapPromise) {
    rniapPromise = import('react-native-iap');
  }
  return rniapPromise;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isExpoGoClient() {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient'
  );
}

/**
 * IAP sadece gerçek cihazda ve EAS/dev build'de çalışır. Expo Go'da çalışmaz.
 * Şimdilik sadece Android (Play Store) destekli.
 */
export const isIAPSupported = () =>
  Platform.OS === 'android' && !isExpoGoClient();

/**
 * Mağaza bağlantısını başlat. Uygulama açıldığında bir kez çağır.
 */
export async function initIAP() {
  if (!isIAPSupported()) return { ok: false, error: 'platform' };
  if (initDone) return { ok: true };
  if (initFailed) return { ok: false, error: 'previously_failed' };
  const RNIap = await loadRNIap();
  try {
    await RNIap.initConnection();
    initDone = true;
    return { ok: true };
  } catch (e) {
    initFailed = true;
    console.warn('[IAP] initConnection failed:', e?.message);
    return { ok: false, error: e?.message };
  }
}

/**
 * Abonelik ürünlerini getir (fiyat, açıklama vb.)
 */
export async function getSubscriptionProducts() {
  if (!isIAPSupported() || !initDone) {
    if (isIAPSupported() && !initDone) await initIAP();
    if (!initDone) return [];
  }
  const RNIap = await loadRNIap();
  try {
    const subs = await RNIap.fetchProducts({ skus: SKUS, type: 'subs' });
    return subs ?? [];
  } catch (e) {
    console.warn('[IAP] fetchProducts failed:', e?.message);
    return [];
  }
}

/**
 * Kullanıcının aktif aboneliği var mı?
 */
export async function checkIsSubscribed() {
  if (!isIAPSupported()) return false;
  if (!initDone) {
    const r = await initIAP();
    if (!r.ok) return false; // initFailed flag set → sonraki çağrılar tekrar denemez
  }
  const RNIap = await loadRNIap();
  try {
    return await RNIap.hasActiveSubscriptions(SKUS);
  } catch (e) {
    console.warn('[IAP] hasActiveSubscriptions failed:', e?.message);
    return false;
  }
}

/**
 * Satın alma sonrası Play tarafının aboneliği işlemesi için kısa süre tekrar dener.
 */
async function verifySubscriptionActive({ attempts = 10, delayMs = 600 } = {}) {
  for (let i = 0; i < attempts; i++) {
    if (await checkIsSubscribed()) return true;
    if (i < attempts - 1) await sleep(delayMs);
  }
  return false;
}

function matchesOurSku(purchase, sku) {
  const id = purchase?.productId;
  if (!id) return false;
  return id === sku || SKUS.includes(id);
}

/**
 * requestPurchase dönüşü: Purchase | Purchase[] | null
 */
function normalizePurchaseResult(result, sku) {
  if (result == null) return null;
  const list = Array.isArray(result) ? result : [result];
  const match = list.find((p) => p && matchesOurSku(p, sku));
  return match || list[0] || null;
}

/**
 * Abonelik satın alma (event + doğrulama).
 * requestPurchase olay tabanlıdır; satın alma purchaseUpdatedListener ile gelir.
 *
 * @returns {Promise<{ status: string, error?: string, userMessage?: string }>}
 *   status: 'success' | 'cancelled' | 'failed' | 'not_verified'
 */
export async function purchaseSubscription(sku = SUBSCRIPTION_SKUS.MONTHLY) {
  if (!isIAPSupported()) {
    return {
      status: 'failed',
      error: 'platform',
      userMessage: 'Abonelik şu an yalnızca Android cihazlarda kullanılabilir.',
    };
  }
  if (!initDone) {
    const r = await initIAP();
    if (!r.ok) {
      return {
        status: 'failed',
        error: 'init',
        userMessage: 'Google Play ile bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.',
      };
    }
  }

  const RNIap = await loadRNIap();
  let listenerSub = null;
  const incomingPurchase = new Promise((resolve) => {
    listenerSub = RNIap.purchaseUpdatedListener((purchase) => {
      if (matchesOurSku(purchase, sku)) resolve(purchase);
    });
  });

  const waitMs = 90000;
  const timeoutOrNull = sleep(waitMs).then(() => null);

  try {
    const requestResult = await RNIap.requestPurchase({
      request: { android: { skus: [sku] } },
      type: 'subs',
    });

    let purchase = normalizePurchaseResult(requestResult, sku);
    if (!purchase) {
      purchase = await Promise.race([incomingPurchase, timeoutOrNull]);
    }

    if (purchase?.purchaseToken) {
      try {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      } catch (e) {
        console.warn('[IAP] finishTransaction (acknowledge):', e?.message);
      }
    }

    let verified = await verifySubscriptionActive({ attempts: 10, delayMs: 600 });
    if (!verified) {
      verified = await verifySubscriptionActive({ attempts: 5, delayMs: 1000 });
    }

    if (verified) {
      return { status: 'success' };
    }

    return {
      status: 'not_verified',
      error: 'not_verified',
      userMessage:
        'Ödeme tamamlandıysa aboneliğiniz kısa süre içinde aktif olur. Bir süre sonra "Satın alımları geri yükle"yi deneyin veya uygulamayı yeniden başlatın.',
    };
  } catch (e) {
    const code = e?.code;
    if (code === 'E_USER_CANCELLED') {
      return { status: 'cancelled' };
    }
    const msg = e?.message || '';
    if (String(msg).toLowerCase().includes('cancel')) {
      return { status: 'cancelled' };
    }
    return {
      status: 'failed',
      error: msg || 'purchase_error',
      userMessage:
        'Satın alma tamamlanamadı. İnternet bağlantınızı kontrol edip tekrar deneyin. Sorun sürerse Google Play ödeme ayarlarınızı kontrol edin.',
    };
  } finally {
    listenerSub?.remove?.();
  }
}

/**
 * Satın alımları geri yükle (getAvailablePurchases).
 */
export async function restorePurchases() {
  if (!isIAPSupported() || !initDone) {
    const r = await initIAP();
    if (!r.ok) return [];
  }
  const RNIap = await loadRNIap();
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases ?? [];
  } catch (e) {
    console.warn('[IAP] getAvailablePurchases failed:', e?.message);
    return [];
  }
}
