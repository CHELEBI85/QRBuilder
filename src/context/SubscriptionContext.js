import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  checkIsSubscribed,
  purchaseSubscription,
  restorePurchases,
  getSubscriptionProducts,
  isIAPSupported,
} from '../utils/iap';
import { SUBSCRIPTION_SKUS } from '../constants/subscription';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isIAPSupported()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const subscribed = await checkIsSubscribed();
      setIsPremium(subscribed);
      const prods = await getSubscriptionProducts();
      setProducts(prods);
    } catch (e) {
      console.warn('[Subscription] refresh failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (!isIAPSupported()) return;

    let mounted = true;
    let sub = null;
    let errSub = null;

    (async () => {
      const RNIap = await import('react-native-iap');
      if (!mounted) return;
      sub = RNIap.purchaseUpdatedListener(() => {
        setIsPremium(true);
        refresh();
      });
      if (!mounted) {
        sub?.remove?.();
        sub = null;
        return;
      }
      errSub = RNIap.purchaseErrorListener((err) => {
        if (err?.code !== 'E_USER_CANCELLED') {
          console.warn('[Subscription] purchase error:', err);
        }
      });
    })();

    return () => {
      mounted = false;
      sub?.remove?.();
      errSub?.remove?.();
    };
  }, [refresh]);

  const purchase = useCallback(async (sku = SUBSCRIPTION_SKUS.MONTHLY) => {
    setPurchaseLoading(true);
    try {
      const result = await purchaseSubscription(sku);

      if (result.status === 'success') {
        setIsPremium(true);
        await refresh();
        return { ok: true, status: 'success' };
      }

      if (result.status === 'cancelled') {
        return { ok: false, status: 'cancelled' };
      }

      if (result.status === 'not_verified') {
        const subscribed = await checkIsSubscribed();
        if (subscribed) {
          setIsPremium(true);
          await refresh();
          return { ok: true, status: 'success' };
        }
        return {
          ok: false,
          status: 'not_verified',
          userMessage: result.userMessage,
        };
      }

      return {
        ok: false,
        status: 'failed',
        userMessage: result.userMessage,
        error: result.error,
      };
    } finally {
      setPurchaseLoading(false);
    }
  }, [refresh]);

  const restore = useCallback(async () => {
    setRestoreLoading(true);
    try {
      await restorePurchases();
      const subscribed = await checkIsSubscribed();
      setIsPremium(subscribed);
      const prods = await getSubscriptionProducts();
      setProducts(prods);
      if (subscribed) {
        return { ok: true, status: 'restored' };
      }
      return {
        ok: false,
        status: 'not_found',
        userMessage:
          'Bu Google Play hesabında aktif bir abonelik bulunamadı. Daha önce satın aldığınız hesaba giriş yaptığınızdan emin olun.',
      };
    } catch (e) {
      console.warn('[Subscription] restore failed:', e);
      return {
        ok: false,
        status: 'failed',
        userMessage: 'Geri yükleme sırasında bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      };
    } finally {
      setRestoreLoading(false);
    }
  }, []);

  const value = {
    isPremium,
    loading,
    products,
    purchaseLoading,
    restoreLoading,
    purchase,
    restore,
    refresh,
    isIAPSupported: isIAPSupported(),
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
