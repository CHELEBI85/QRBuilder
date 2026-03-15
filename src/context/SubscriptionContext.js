import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as RNIap from 'react-native-iap';
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

    const sub = RNIap.purchaseUpdatedListener(() => {
      setIsPremium(true);
      refresh();
    });
    const errSub = RNIap.purchaseErrorListener((err) => {
      setPurchaseLoading(false);
      if (err?.code !== 'E_USER_CANCELLED') {
        console.warn('[Subscription] purchase error:', err);
      }
    });

    return () => {
      sub?.remove?.();
      errSub?.remove?.();
    };
  }, [refresh]);

  const purchase = useCallback(async (sku = SUBSCRIPTION_SKUS.MONTHLY) => {
    setPurchaseLoading(true);
    try {
      const result = await purchaseSubscription(sku);
      if (result.ok) {
        setIsPremium(true);
        return { ok: true };
      }
      return { ok: false, error: result.error };
    } finally {
      setPurchaseLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setPurchaseLoading(true);
    try {
      await restorePurchases();
      const subscribed = await checkIsSubscribed();
      setIsPremium(subscribed);
      const prods = await getSubscriptionProducts();
      setProducts(prods);
      return subscribed;
    } catch (e) {
      console.warn('[Subscription] restore failed:', e);
      return false;
    } finally {
      setPurchaseLoading(false);
    }
  }, []);

  const value = {
    isPremium,
    loading,
    products,
    purchaseLoading,
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
