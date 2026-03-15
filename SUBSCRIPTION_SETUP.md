# Abonelik Kurulum Rehberi

## Uygulama Tarafı ✅

Uygulama tarafı hazır. Özet:

- **Ücretsiz türler:** URL, Metin
- **Premium türler:** Email, Telefon, SMS, WiFi, vCard, WhatsApp, Instagram, X, YouTube, GPS
- Premium türlere tıklandığında Paywall açılır
- Ayarlar → Premium ile de Paywall'a gidilebilir

## Play Console Adımları

### 1. Abonelik ürünü oluştur

1. [Google Play Console](https://play.google.com/console) → Uygulamanız
2. **Monetize** → **Subscriptions** → **Create subscription**
3. **Product ID:** `qrbuilder_premium_monthly` (koddaki `subscription.js` ile aynı olmalı)
4. Fiyat ve dönem (örn. 29,99 ₺/ay)
5. İsteğe bağlı: 7 gün ücretsiz deneme

### 2. Ürün ID değiştirirseniz

`src/constants/subscription.js` içindeki `SUBSCRIPTION_SKUS.MONTHLY` değerini güncelleyin.

### 3. Test

- **License testers:** Play Console → Setup → License testing → test Gmail adreslerinizi ekleyin
- **Internal testing track:** Uygulamayı internal testing'e yükleyin; abonelik gerçek ödeme almadan test edilir

## Önemli Notlar

- **IAP sadece EAS Build / development build'de çalışır.** Expo Go'da test edilemez.
- Gerçek cihazda test edin; emülatörde Play Store IAP kısıtlı olabilir.
- `eas build --platform android` ile APK/AAB alın.
