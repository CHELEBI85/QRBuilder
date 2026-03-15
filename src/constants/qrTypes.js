// icon.lib: 'MaterialIcons' | 'FontAwesome5' | 'text'
// icon.brand: true  → FontAwesome5'te brand icon kullan
export const QR_TYPES = [
  {
    id: 'url',
    label: 'URL',
    premium: false,
    icon: { lib: 'MaterialIcons', name: 'language', color: '#4285F4' },
    description: 'Web sitesi linki',
    fields: [
      { key: 'url', label: 'URL', placeholder: 'https://example.com', keyboardType: 'url' },
    ],
  },
  {
    id: 'text',
    label: 'Metin',
    premium: false,
    icon: { lib: 'MaterialIcons', name: 'notes', color: '#607D8B' },
    description: 'Serbest metin',
    fields: [
      { key: 'text', label: 'Metin', placeholder: 'Metninizi girin...', multiline: true },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'email', color: '#EA4335' },
    description: 'Email adresi',
    fields: [
      { key: 'email', label: 'Email Adresi', placeholder: 'ornek@email.com', keyboardType: 'email-address' },
      { key: 'subject', label: 'Konu', placeholder: 'Email konusu' },
      { key: 'body', label: 'İçerik', placeholder: 'Email içeriği...', multiline: true },
    ],
  },
  {
    id: 'phone',
    label: 'Telefon',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'phone', color: '#34A853' },
    description: 'Telefon numarası',
    fields: [
      { key: 'phone', label: 'Telefon', placeholder: '+90 555 000 0000', keyboardType: 'phone-pad' },
    ],
  },
  {
    id: 'sms',
    label: 'SMS',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'message', color: '#2196F3' },
    description: 'SMS mesajı',
    fields: [
      { key: 'phone', label: 'Telefon', placeholder: '+90 555 000 0000', keyboardType: 'phone-pad' },
      { key: 'message', label: 'Mesaj', placeholder: 'SMS içeriği...', multiline: true },
    ],
  },
  {
    id: 'wifi',
    label: 'WiFi',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'wifi', color: '#00BCD4' },
    description: 'WiFi ağı',
    fields: [
      { key: 'ssid', label: 'Ağ Adı (SSID)', placeholder: 'WiFi adı' },
      { key: 'password', label: 'Şifre', placeholder: 'WiFi şifresi', secureTextEntry: true },
      {
        key: 'security',
        label: 'Güvenlik',
        type: 'picker',
        options: ['WPA', 'WEP', 'nopass'],
        defaultValue: 'WPA',
      },
    ],
  },
  {
    id: 'vcard',
    label: 'Kişi',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'contact-page', color: '#FF9800' },
    description: 'vCard kişi bilgisi',
    fields: [
      { key: 'firstName', label: 'Ad', placeholder: 'Ad' },
      { key: 'lastName', label: 'Soyad', placeholder: 'Soyad' },
      { key: 'phone', label: 'Telefon', placeholder: '+90 555 000 0000', keyboardType: 'phone-pad' },
      { key: 'email', label: 'Email', placeholder: 'ornek@email.com', keyboardType: 'email-address' },
      { key: 'organization', label: 'Şirket', placeholder: 'Şirket adı' },
      { key: 'url', label: 'Web Sitesi', placeholder: 'https://example.com', keyboardType: 'url' },
    ],
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    premium: true,
    icon: { lib: 'FontAwesome5', name: 'whatsapp', color: '#25D366', brand: true },
    description: 'WhatsApp mesajı',
    fields: [
      { key: 'phone', label: 'Telefon (ülke kodu ile)', placeholder: '+905550000000', keyboardType: 'phone-pad' },
      { key: 'message', label: 'Mesaj (isteğe bağlı)', placeholder: 'Merhaba!', multiline: true },
    ],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    premium: true,
    icon: { lib: 'FontAwesome5', name: 'instagram', color: '#E1306C', brand: true },
    description: 'Instagram profili',
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', placeholder: 'kullaniciadi' },
    ],
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    premium: true,
    icon: { lib: 'text', name: '𝕏', color: '#000000' },
    description: 'X / Twitter profili',
    fields: [
      { key: 'username', label: 'Kullanıcı Adı', placeholder: 'kullaniciadi' },
    ],
  },
  {
    id: 'youtube',
    label: 'YouTube',
    premium: true,
    icon: { lib: 'FontAwesome5', name: 'youtube', color: '#FF0000', brand: true },
    description: 'YouTube kanalı',
    fields: [
      { key: 'channel', label: 'Kanal Adı', placeholder: 'kanal-adi' },
    ],
  },
  {
    id: 'gps',
    label: 'Konum',
    premium: true,
    icon: { lib: 'MaterialIcons', name: 'location-on', color: '#F44336' },
    description: 'GPS koordinatı',
    fields: [
      { key: 'latitude', label: 'Enlem', placeholder: '41.0082', keyboardType: 'decimal-pad' },
      { key: 'longitude', label: 'Boylam', placeholder: '28.9784', keyboardType: 'decimal-pad' },
    ],
  },
];
