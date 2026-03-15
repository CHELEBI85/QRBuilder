import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { SUBSCRIPTION_SKUS } from '../constants/subscription';

const SKUS = [SUBSCRIPTION_SKUS.MONTHLY, SUBSCRIPTION_SKUS.YEARLY];
let initDone = false;

/**
 * IAP sadece gerçek cihazda ve EAS/dev build'de çalışır. Expo Go'da çalışmaz.
 * Şimdilik sadece Android (Play Store) destekli.
 */
export const isIAPSupported = () => Platform.OS === 'android';

/**
 * Mağaza bağlantısını başlat. Uygulama açıldığında bir kez çağır.
 */
export async function initIAP() {
  if (!isIAPSupported()) return { ok: false, error: 'platform' };
  try {
    await RNIap.initConnection();
    initDone = true;
    return { ok: true };
  } catch (e) {
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
  try {
    const subs = await RNIap.fetchProducts({ skus: SKUS, type: 'subs' });
    return subs ?? [];
  } catch (e) {
    console.warn('[IAP] fetchProducts failed:', e?.message);
    return [];
  }
}

/**
 * Abonelik satın al.
 * @returns { ok: boolean, error?: string }
 */
export async function purchaseSubscription(sku = SUBSCRIPTION_SKUS.MONTHLY) {
  if (!isIAPSupported()) return { ok: false, error: 'Şu an sadece Android\'de abonelik mevcut.' };
  if (!initDone) {
    const r = await initIAP();
    if (!r.ok) return { ok: false, error: 'Mağaza bağlantısı kurulamadı.' };
  }
  try {
    await RNIap.requestPurchase({
      request: { android: { skus: [sku] } },
      type: 'subs',
    });
    return { ok: true };
  } catch (e) {
    if (e?.code === 'E_USER_CANCELLED') return { ok: false, error: 'cancelled' };
    return { ok: false, error: e?.message || 'Satın alma başarısız.' };
  }
}

/**
 * Satın alımları geri yükle.
 */
export async function restorePurchases() {
  if (!isIAPSupported() || !initDone) {
    const r = await initIAP();
    if (!r.ok) return [];
  }
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases ?? [];
  } catch (e) {
    console.warn('[IAP] getAvailablePurchases failed:', e?.message);
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
    if (!r.ok) return false;
  }
  try {
    const hasSub = await RNIap.hasActiveSubscriptions(SKUS);
    return hasSub;
  } catch (e) {
    console.warn('[IAP] hasActiveSubscriptions failed:', e?.message);
    return false;
  }
}
