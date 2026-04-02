# QRBuilder — Ürün, Tasarım ve Mühendislik Ana Kılavuzu

Bu belge, QRBuilder mobil uygulamasını MVP seviyesinden profesyonel, yayınlanabilir ve yüksek kalite hissi veren bir ürüne dönüştürmek için hazırlanmıştır.

Bu dosya; ürün vizyonunu, tasarım sistemini, renk şemasını, kullanıcı deneyimi standartlarını, mimari ilkeleri, geliştirme disiplinini ve Cursor ile çalışma biçimini tek yerde toplar.

Bu belge, proje boyunca **ana referans dokümanı** olarak kullanılmalıdır.

---

## 1. Belgenin amacı

Bu belgenin amacı şunları netleştirmektir:

- QRBuilder’ın nasıl bir ürün olması gerektiği
- Uygulamanın kullanıcıya nasıl hissettirmesi gerektiği
- Tasarım dili, renk sistemi ve UI prensipleri
- Kod tabanının hangi mühendislik standartlarına göre gelişeceği
- Android release ve Play Store yayını için hangi kalite çizgisinin hedefleneceği
- Cursor’un projede nasıl yönlendirilmesi gerektiği

Bu belge sayesinde hedef, sadece “çalışan ekranlar” üretmek değil; **profesyonel görünen, güven veren ve sürdürülebilir bir ürün** ortaya çıkarmaktır.

---

## 2. Ürün özeti

QRBuilder; kullanıcının farklı türlerde QR kodlar oluşturabildiği, bu kodları önizleyebildiği, özelleştirebildiği, kaydedebildiği, paylaşabildiği, daha sonra geçmişten tekrar erişebildiği ve bazı gelişmiş özelliklere premium abonelik ile ulaşabildiği bir mobil uygulamadır.

Temel özellikler:

- URL QR oluşturma
- Metin QR oluşturma
- Email, telefon, SMS, Wi‑Fi, vCard gibi gelişmiş QR türleri
- QR önizleme ve özelleştirme
- QR kaydetme / paylaşma
- Geçmiş ekranı
- QR tarayıcı
- Ayarlar ekranı
- Premium abonelik / paywall

---

## 3. Ürün vizyonu

QRBuilder sıradan bir utility uygulaması gibi görünmemelidir.

Ürün vizyonu:

- hızlı
- güven veren
- sade ama güçlü
- premium hissiyatlı
- teknik olarak temiz
- Play Store’da profesyonel görünen
- tekrar kullanmak isteği uyandıran

Kullanıcı uygulamayı açtığında şu hissi almalıdır:

- “Bu uygulama iyi yapılmış.”
- “Ne yapacağım çok net.”
- “Hızlıca QR oluşturup işimi çözerim.”
- “Premium özellikler uydurma değil, gerçekten değer katıyor.”

---

## 4. Ürün hedefleri

### 4.1 Teknik hedefler

- sürdürülebilir kod tabanı
- modüler ekran yapısı
- temiz state yönetimi
- merkezi ve tutarlı QR type sistemi
- güvenilir subscription akışı
- kontrollü storage kullanımı
- hata ve edge-case odaklı yaklaşım
- Android release’e uygun stabil yapı

### 4.2 Ürün hedefleri

- ilk açılışta güçlü görsel kalite
- hızlı ve net QR oluşturma deneyimi
- kullanıcıyı yormayan form yapısı
- sade ama şık tarama deneyimi
- kullanışlı geçmiş ekranı
- zayıf görünmeyen ayarlar ekranı
- ikna edici ve düzgün bir paywall

### 4.3 Yayın hedefleri

- Android release build alınabilmesi
- Play Console’a yüklenebilir kalite
- kritik akışlarda crash riskinin düşük olması
- görsel amatörlük hissinin ortadan kalkması
- ekran görüntüsü alınabilir, sunulabilir arayüz kalitesi

---

## 5. Hedef kullanıcı profilleri

### 5.1 Hızlı iş çözmek isteyen kullanıcı

Beklentisi:

- uygulamayı açsın
- 20-30 saniyede QR oluştursun
- paylaşsın veya kaydetsin

Bu kullanıcı için en kritik şeyler:

- hız
- sadelik
- netlik
- gereksiz adım olmaması

### 5.2 Tekrar tekrar QR oluşturan kullanıcı

Beklentisi:

- geçmişten faydalansın
- aynı tür QR’ları kolayca üretmeye devam etsin
- varsayılan ayarlarla hızlı iş yapsın

Bu kullanıcı için kritik şeyler:

- geçmiş
- tercihler
- tutarlılık

### 5.3 Premium kullanıma aday kullanıcı

Beklentisi:

- gelişmiş türler ve özellikler için ödeme yapmadan önce değer görsün
- paywall güven versin
- satın alma / geri yükleme akışı sorunsuz olsun

Bu kullanıcı için kritik şeyler:

- güven
- premium faydanın net anlatılması
- amatör görünmeyen premium deneyim

---

## 6. Marka karakteri

QRBuilder’ın marka karakteri şu eksende tanımlanmalıdır:

- modern
- temiz
- teknik ama soğuk olmayan
- güven veren
- mobil odaklı
- premium ama abartısız

Uygulama dili:

- kısa
- net
- sade
- gereksiz kurumsal olmayan
- kullanıcıyı yormayan

Örnek ton:

- “QR oluştur”
- “Paylaş”
- “Kaydet”
- “Tekrar tara”
- “Premium ile tüm türleri aç”

Kaçınılması gereken ton:

- aşırı resmi
- aşırı teknik
- uzun ve yorucu açıklamalar
- agresif satış dili

---

## 7. Tasarım vizyonu

QRBuilder’ın tasarımı şu dört hedefi birlikte sağlamalıdır:

1. Kullanıcı ne yapacağını hemen anlamalı
2. Ekranlar dağınık görünmemeli
3. Ürün premium hissiyat vermeli
4. Görsel kalite, işlevselliğin önüne geçmeden uygulamayı parlatmalı

Tasarım dili:

- minimal
- güçlü boşluk kullanımı olan
- yuvarlatılmış ama oyuncak görünmeyen bileşenler
- yumuşak kontrastlar
- kontrollü vurgu renkleri
- net hiyerarşi

---

## 8. Renk sistemi

Aşağıdaki sistem, uygulama için önerilen ana renk şemasıdır.

Hedef:

- güven veren
- premium hissiyatlı
- teknoloji ürünü gibi görünen
- karanlık modda güçlü, açık modda temiz duran

### 8.1 Brand yaklaşımı

QRBuilder için önerilen ana vurgu rengi:

- **Electric Indigo / Royal Blue ekseni**

Neden:

- teknoloji hissi verir
- güven uyandırır
- premium görünür
- hem açık hem koyu temada iyi çalışır
- Android’de çok yabancı durmaz

İkincil destek rengi:

- **Teal / Mint ekseni**

Neden:

- başarı / tamamlanmışlık / canlılık hissi verir
- QR özelleştirme ekranlarında ferah görünür
- mavi ile iyi eşleşir

### 8.2 Light theme renk token’ları

#### Temel yüzeyler

- `background`: `#F6F8FC`
- `surface`: `#FFFFFF`
- `surfaceSecondary`: `#EEF2FF`
- `card`: `#FFFFFF`
- `border`: `#E5EAF3`
- `divider`: `#D9E1EE`

#### Metinler

- `textPrimary`: `#0F172A`
- `textSecondary`: `#475569`
- `textTertiary`: `#64748B`
- `textOnPrimary`: `#FFFFFF`

#### Marka / aksan

- `primary`: `#4F46E5`
- `primaryPressed`: `#4338CA`
- `primarySoft`: `#EEF2FF`
- `accent`: `#14B8A6`
- `accentSoft`: `#E6FFFB`

#### Durum renkleri

- `success`: `#10B981`
- `warning`: `#F59E0B`
- `error`: `#EF4444`
- `info`: `#0EA5E9`

#### QR özelleştirme destek tonları

- `qrDark`: `#111827`
- `qrLight`: `#FFFFFF`
- `previewBg`: `#F8FAFC`

### 8.3 Dark theme renk token’ları

#### Temel yüzeyler

- `background`: `#0B1020`
- `surface`: `#121A2B`
- `surfaceSecondary`: `#182238`
- `card`: `#121A2B`
- `border`: `#24324B`
- `divider`: `#1E293B`

#### Metinler

- `textPrimary`: `#F8FAFC`
- `textSecondary`: `#CBD5E1`
- `textTertiary`: `#94A3B8`
- `textOnPrimary`: `#FFFFFF`

#### Marka / aksan

- `primary`: `#7C78FF`
- `primaryPressed`: `#6A63F6`
- `primarySoft`: `#23285A`
- `accent`: `#2DD4BF`
- `accentSoft`: `#0F2E2C`

#### Durum renkleri

- `success`: `#34D399`
- `warning`: `#FBBF24`
- `error`: `#F87171`
- `info`: `#38BDF8`

#### QR özelleştirme destek tonları

- `qrDark`: `#F8FAFC`
- `qrLight`: `#0F172A`
- `previewBg`: `#0F172A`

### 8.4 Renk kullanım kuralları

- `primary` ana CTA’larda kullanılmalı
- `accent` destekleyici vurgularda kullanılmalı
- hata ve uyarı renkleri yalnızca durum amacıyla kullanılmalı
- aynı ekranda çok fazla canlı vurgu rengi kullanılmamalı
- bir ekranda bir ana odak rengi yeterli olmalı
- premium alanlarda sadece renk değiştirerek “premium” etkisi yaratılmamalı; tipografi, boşluk ve yüzey kullanımı da desteklemeli

### 8.5 Premium bölümler için vurgu yaklaşımı

Paywall veya premium kartlarda:

- koyu zemin + hafif indigo geçiş hissi
- fazla parlak altın tonlarından kaçınma
- premium görünüm için sofistike kontrast kullanımı

Öneri:

- Gradient kullanılıyorsa sade ve kontrollü kullanılmalı
- Örnek: `#4F46E5 -> #7C3AED`

---

## 9. Tipografi sistemi

Tipografi; uygulamanın profesyonel görünmesinde en kritik alanlardan biridir.

Önerilen yaklaşım:

- sistem fontu kullanmak kabul edilebilir
- ama boyut, kalınlık ve satır yüksekliği hiyerarşisi net tanımlanmalı

### 9.1 Tipografi hiyerarşisi

- `display`: 32 / 38 / semibold
- `title1`: 28 / 34 / semibold
- `title2`: 24 / 30 / semibold
- `title3`: 20 / 26 / semibold
- `headline`: 18 / 24 / semibold
- `body`: 16 / 24 / regular
- `bodyMedium`: 16 / 24 / medium
- `subbody`: 14 / 20 / regular
- `caption`: 12 / 18 / regular
- `button`: 16 / 20 / semibold

### 9.2 Kullanım kuralları

- başlıklar gereksiz büyük olmamalı
- açıklama metinleri en fazla 2-3 kısa satır hedeflemeli
- aynı ekranda çok fazla font boyutu kullanılmamalı
- buton metinleri kısa ve güçlü olmalı
- metin kontrastı erişilebilir olmalı

---

## 10. Spacing sistemi

Tutarlı spacing, uygulamanın “iyi yapılmış” görünmesini doğrudan etkiler.

Önerilen 4 tabanlı sistem:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Kullanım önerileri:

- ekran yatay padding: `20`
- section araları: `24`
- kart iç padding: `16`
- buton iç dikey padding: `14-16`
- form elemanları arası boşluk: `12-16`
- küçük yardımcı boşluklar: `8`

---

## 11. Radius sistemi

Aşırı yuvarlak ya da aşırı sert görünüm yerine dengeli bir modern yapı kullanılmalı.

Önerilen radius token’ları:

- `xs`: `8`
- `sm`: `12`
- `md`: `16`
- `lg`: `20`
- `xl`: `24`
- `pill`: `999`

Kullanım önerileri:

- input: `16`
- kart: `20`
- modal / bottom sheet: `24`
- chip / tag: `pill`
- icon button: `16` veya `pill`

---

## 12. Shadow / elevation sistemi

Gölge kullanımı kontrollü olmalı. Her şeye gölge vermek amatör görünüm üretir.

Öneri:

- Light theme’de hafif ve geniş gölgeler
- Dark theme’de daha çok yüzey kontrastı, daha az ağır gölge

Kullanım alanları:

- ana CTA butonları
- önemli kartlar
- modal / floating action bölümleri

Kaçınılacaklar:

- keskin koyu gölge
- her kartta aynı yoğun gölge
- fazla yüksek elevation

---

## 13. İkonografi

İkon dili tek set üzerinden tutarlı kullanılmalıdır.

Kurallar:

- mümkün olduğunca tek ikon ailesi kullan
- aynı ekranda çok farklı çizim stillerini karıştırma
- ikonlar dekor değil, anlam taşımalı
- premium kartlarda gereksiz süs ikonlarından kaçın

QR türleri için ikon yaklaşımı:

- hızlı anlaşılır
- yüksek kontrastlı
- küçük boyutta seçilebilir

---

## 14. Hareket ve mikro etkileşimler

Premium hissiyat sadece renk ve kartlarla oluşmaz.

Şunlar kontrollü şekilde kullanılmalıdır:

- buton basış geri bildirimi
- başarılı işlemlerde kısa toast
- kayıt / paylaşım sonrası net durum bilgisi
- sekmeler arası yumuşak geçiş hissi
- form hatalarında sarsılmayan ama dikkat çeken geri bildirim

Kurallar:

- animasyonlar kısa olmalı
- işlevin önüne geçmemeli
- her hareket bir amaca hizmet etmeli
- yavaş ve süslü geçişlerden kaçınılmalı

---

## 15. Tasarım sistemi bileşenleri

Uygulama büyüdükçe ortak bileşen dili kurulmalıdır.

Gerekli temel bileşenler:

- PrimaryButton
- SecondaryButton
- GhostButton
- IconButton
- InputField
- SectionHeader
- AppCard
- EmptyState
- ErrorState
- LoadingState
- Chip / FilterChip
- ScreenContainer
- Toast
- PremiumBadge

Her ortak bileşen:

- tutarlı spacing kullanmalı
- renk token’larından beslenmeli
- dark/light temada aynı kaliteyi korumalı

---

## 16. Ekran bazlı deneyim hedefleri

### 16.1 Home / QR türü seçimi

Amaç:

- kullanıcıyı karmaşa olmadan QR türüne götürmek

Standart:

- net başlık
- güçlü grid / kategori düzeni
- ücretsiz ve premium ayrımı açık ama kaba olmayan şekilde gösterilmeli
- premium türler “engel” gibi değil, “değerli seçenek” gibi görünmeli

### 16.2 Create ekranı

Amaç:

- hızlı, anlaşılır, hatasız form deneyimi

Standart:

- alanlar net etiketli olmalı
- placeholder tek başına açıklama yerine geçmemeli
- validation kullanıcıyı cezalandırmamalı
- gereksiz uzun form hissi olmamalı

### 16.3 Preview ekranı

Amaç:

- wow etkisi + işlevsellik

Standart:

- QR odakta olmalı
- özelleştirme kontrolleri karmaşık görünmemeli
- kaydet / paylaş butonları çok net olmalı
- logo, renk, boyut gibi ayarlar düzenli section’lara ayrılmalı

### 16.4 History ekranı

Amaç:

- gerçek kullanım değeri üretmek

Standart:

- hızlı okunabilir liste
- tarih / tür ayrımı net
- arama ve filtre pratik
- boş geçmiş ekranı “ölü ekran” gibi görünmemeli

### 16.5 Scanner ekranı

Amaç:

- hızlı ve güven veren tarama deneyimi

Standart:

- izin akışı temiz
- kameraya erişim neden gerektiği net
- sonuç aksiyonları sade
- tekrar tarama akışı tek dokunuşla yapılabilmeli

### 16.6 Settings ekranı

Amaç:

- yardımcı ekran değil, ürün ayar merkezi hissi

Standart:

- tema ayarları anlaşılır
- varsayılan QR ayarları net
- premium bölümü zayıf görünmemeli
- hakkında / sürüm / destek alanları düzenli olmalı

### 16.7 Paywall ekranı

Amaç:

- baskı kurmadan ikna etmek

Standart:

- fayda odaklı anlatım
- premium özellikler açık ve seçici şekilde gösterilmeli
- CTA net olmalı
- restore purchase görünür ama baskın olmamalı
- ekran tasarımı amatör görünmemeli

---

## 17. Kullanıcı deneyimi kuralları

### 17.1 Zorunlu durumlar

Her önemli ekranda aşağıdakiler düşünülmelidir:

- loading state
- empty state
- error state
- permission denied state
- success feedback

### 17.2 Geri bildirim standartları

Kullanıcı bir işlem yaptığında mümkün olduğunca belirsiz bırakılmamalıdır.

Örnek:

- QR kaydedildi
- Paylaşım iptal edildi
- Kamera izni gerekli
- Satın alma geri yüklendi
- Hata oluştu, tekrar dene

### 17.3 UX öncelikleri

Öncelik sırası:

1. netlik
2. hız
3. güven
4. görsel kalite
5. ileri seviye süsleme

---

## 18. Erişilebilirlik kuralları

- yeterli metin kontrastı
- küçük tıklama alanlarından kaçınma
- metinleri sadece renkle anlamlandırmama
- form hatalarını net metinle belirtme
- kritik aksiyon butonlarını görünür tutma

---

## 19. Ürün metinleri / microcopy kuralları

Metinler:

- kısa
- doğrudan
- sade
- güven veren

Örnekler:

- “Bağlantını QR’a dönüştür”
- “Kaydetmeden önce görünümü özelleştir”
- “Premium ile tüm QR türlerini aç”
- “Daha önce oluşturduğun kodlara buradan ulaş”

Kaçınılacaklar:

- uzun paragraflar
- çok teknik açıklamalar
- saldırgan satış dili

---

## 20. Mimari yaklaşım

Uygulama küçük ve orta ölçekli mobil ürün mantığıyla sürdürülebilir olmalıdır.

Temel ilkeler:

- UI ve business logic ayrılmalı
- büyük ekranlar parçalanmalı
- utility fonksiyonlar merkezi olmalı
- state karmaşası büyütülmemeli
- aynı bilginin farklı yerlerde dağınık yaşaması engellenmeli

---

## 21. Kod organizasyonu prensipleri

Kurallar:

- tek dosyada aşırı sorumluluk birikmemeli
- tekrar eden logic ortaklaştırılmalı
- bileşen adları işlevini açık anlatmalı
- helper ve service ayrımı net olmalı
- form mantığı ve UI mümkünse ayrıştırılmalı

Özellikle dikkat edilecek alanlar:

- QR type tanımı
- validator
- formatter
- preview export mantığı
- subscription state
- storage katmanı

---

## 22. QR type sistemi için hedef yapı

Bu alan projedeki en kritik teknik konulardan biridir.

Hedef:

- yeni QR tipi eklemek kolay olmalı
- type tanımı, alanlar, doğrulama ve formatter ilişkisi kopuk olmamalı
- hata mesajları tutarlı olmalı
- gereksiz if/else yığını oluşmamalı

İstenen yaklaşım:

- mümkün olduğunca merkezi yapı
- type bazlı konfigürasyon
- form tanımı ile formatter mantığı arasında kopukluk olmaması

---

## 23. Form deneyimi ve validation standardı

Formlar kullanıcıyı cezalandırmamalıdır.

Kurallar:

- zorunlu alanlar net görünmeli
- hata mesajı alanın yanında veya altında görünmeli
- kullanıcı submit sonrası neyin eksik olduğunu hemen anlamalı
- placeholder, etiketin yerine geçmemeli
- validation metinleri kısa ve anlaşılır olmalı

Örnek hata tonu:

- “Geçerli bir bağlantı gir.”
- “Email alanı boş bırakılamaz.”
- “Telefon numarası eksik görünüyor.”

---

## 24. Preview ve export standardı

Preview ekranı uygulamanın gösteri alanıdır.

Burada hedef:

- QR net ve merkezde görünmeli
- özelleştirme kontrolleri düzenli olmalı
- kaydetme / paylaşma / logo ekleme işlemleri güvenilir olmalı
- işlemler sırasında kullanıcı bilgilendirilmeli

Bu ekran aşırı büyürse parçalanmalıdır.

---

## 25. History veri modeli yaklaşımı

Geçmiş sadece liste değil, tekrar kullanım özelliğidir.

Kurallar:

- veri modeli sürdürülebilir olmalı
- eski kayıtlarla uyumluluk düşünülmeli
- arama ve filtre akışı hızlı olmalı
- büyük veri senaryosu düşünülmeli
- silme / temizleme aksiyonları güvenli olmalı

---

## 26. Scanner deneyimi standardı

Scanner ekranı kısa ama kritik bir akıştır.

Kurallar:

- izin reddedilirse kullanıcı boş ekranda kalmamalı
- tarama sonrası çıkan aksiyonlar anlamlı olmalı
- link ise açma seçeneği, metinse kopyalama, genel kullanım için paylaşma sunulmalı
- sürekli tetiklenen tarama davranışı kontrollü olmalı

---

## 27. Subscription ve paywall standardı

Bu alan hem ürün hem gelir tarafında kritiktir.

Kurallar:

- premium state yanlış görünmemeli
- restore purchase düzgün çalışmalı
- satın alma sonrası kullanıcı net yönlendirilmeli
- paywall değer anlatmalı, baskı kurmamalı
- premium fayda net olmalı

Paywall içeriği:

- ne açılıyor
- neden değerli
- nasıl geri yüklenir
- güven veren kısa açıklama

---

## 28. State yönetimi ilkeleri

- global state minimumda tutulmalı
- UI state gereksiz yere globale taşınmamalı
- context kullanımı kontrollü olmalı
- async akışlar net yönetilmeli
- premium ve tema gibi gerçekten ortak state’ler merkezde kalmalı

---

## 29. Storage ilkeleri

- AsyncStorage kontrollü kullanılmalı
- key isimleri tutarlı olmalı
- veri şeması düşünülmeden rastgele obje saklanmamalı
- gerektiğinde migration mantığı düşünülmeli
- history ve preferences birbiriyle karıştırılmamalı

---

## 30. Error handling standardı

Production kalitesi için hata yönetimi şarttır.

Kurallar:

- hatalar sessizce yutulmamalı
- kullanıcıya uygun seviyede bilgi verilmeli
- teknik detay doğrudan kullanıcıya dökülmemeli
- satın alma, export, paylaşım, medya izinleri, kamera izinleri gibi alanlar özellikle korunmalı

---

## 31. Permission akışları

Düşünülmesi gereken izinler:

- kamera
- medya / galeri
- paylaşım akışlarıyla ilgili platform davranışları

Standart:

- neden istediğini anlat
- reddedilirse çıkış yolu sun
- ayarlara yönlendirme gerekiyorsa nazikçe yap
- tekrar dene akışı olsun

---

## 32. Performans prensipleri

- gereksiz render azaltılmalı
- büyük ekranlar sadeleştirilmeli
- ağır hesaplar tekrar tekrar çalışmamalı
- uzun listelerde performans düşünülmeli
- state ve props zinciri kontrol edilmeli

---

## 33. Güvenilirlik hedefleri

Uygulamanın aşağıdaki alanlarda stabil davranması gerekir:

- navigation geçişleri
- preview export akışı
- history okuma / yazma
- premium state yenileme
- scanner izinleri ve sonuç akışı

---

## 34. Dosya ve klasör yaklaşımı

Mevcut yapıyı tek seferde baştan yazmak hedef değildir.

Ama zamanla şu kalite hedeflenmelidir:

- ekranlar şişmemeli
- ortak bileşenler ayrılmalı
- logic katmanı görünür olmalı
- feature bazlı düşünceye geçiş mümkün olmalı

---

## 35. Android release ve Play Store hedefi

Bu proje Android’de yayınlanacağı için aşağıdaki çizgi hedeflenmelidir:

- release build stabil olmalı
- permission açıklamaları mantıklı olmalı
- UI farklı ekran boyutlarında da düzgün görünmeli
- premium akışı güvenilir olmalı
- zayıf / yarım bırakılmış ekran hissi olmamalı
- uygulama amatör prototip gibi görünmemeli

---

## 36. Play Store kalite hedefleri

Uygulama mağaza sayfasında da güven verebilmelidir.

Bu yüzden ürün içinde:

- temiz ana ekran
- kaliteli preview ekranı
- güçlü paywall
- düzenli ayarlar ekranı
- düzgün koyu/açık tema görüntüleri

olmalıdır.

Ekran görüntüsü alınırken:

- metin taşmaları olmamalı
- aşırı boşluk olmamalı
- görsel dil tutarlı olmalı
- amatör renk karmaşası olmamalı

---

## 37. Kalite kontrol checklist’i

Her önemli değişiklikten sonra şu sorular sorulmalıdır:

- Kod daha okunabilir hale geldi mi?
- UI daha tutarlı oldu mu?
- Kullanıcı deneyimi gerçekten iyileşti mi?
- Yeni bug üretme riski azaltıldı mı?
- Bu refactor gerçekten gerekli miydi?
- Değişiklik geri alınabilir ve kontrollü mü?

Eğer cevaplar güçlü değilse değişiklik yeterli değildir.

---

## 38. Cursor’un çalışma kuralları

Cursor bu projede şu disiplinle çalışmalıdır:

1. Önce ilgili dosyaları analiz et
2. Sorunu net tarif et
3. Neden problem olduğunu açıkla
4. Çözüm yaklaşımını öner
5. Küçük ve kontrollü refactor yap
6. Dosya bazlı özet ver
7. Riskleri yaz
8. Test senaryolarını belirt
9. Sonraki mantıklı adımı öner

### 38.1 Cursor için yasaklar

Cursor şunları yapmamalıdır:

- tüm projeyi bir anda refactor etmek
- analiz yapmadan kod yazmak
- gereksiz abstraction üretmek
- çalışan yapıyı sebepsiz yere bozmak
- sadece yüzeysel UI rötuşlarıyla işi bitmiş saymak
- teknik borcu makyajla gizlemek

### 38.2 Beklenen çalışma tarzı

Her değişiklik:

- küçük
- kontrollü
- açıklanabilir
- geri alınabilir

olmalıdır.

---

## 39. Çalışma stratejisi

Projeyi tek seferde baştan yazmak istenmiyor.

Doğru yöntem:

1. analiz
2. problem seçimi
3. küçük refactor
4. test
5. sonraki katmana geçiş

Yani hedef:
**adım adım, kontrollü ve profesyonel dönüşüm**

---

## 40. Cursor çıktı formatı

Cursor mümkün olduğunca şu yapıda cevap vermelidir:

### 1. Mevcut sorun

Kısa ve net analiz

### 2. Neden problem

Teknik ve ürün etkisi

### 3. Çözüm yaklaşımı

Ne yapılacak

### 4. Yapılan değişiklikler

Dosya bazlı özet

### 5. Riskler

Kırılabilecek alanlar

### 6. Test senaryoları

Nasıl doğrulanır

### 7. Sonraki adım

Bir sonraki mantıklı gelişim

---

## 41. Öncelik sırası

Bir karar arasında seçim yapılacaksa öncelik sırası şu olmalıdır:

1. stabilite
2. sürdürülebilirlik
3. kullanıcı deneyimi
4. görsel kalite
5. hız optimizasyonu

Önce sağlam temel, sonra parlatma.

---

## 42. İlk denetim için ana başlangıç promptu

Aşağıdaki prompt, Cursor içinde ilk mesaj olarak kullanılabilir:

```text
Bu proje React Native + Expo ile geliştirilmiş bir QR uygulaması.
Amacım bu uygulamayı MVP seviyesinden production-ready, profesyonel, görsel olarak güçlü ve Google Play’de yayınlanabilir bir seviyeye taşımak.

Projeyi önce analiz et. Hemen rastgele kod yazma.

Özellikle şu alanlara dikkat et:
- mimari yapı
- ekran sorumlulukları
- navigation
- state yönetimi
- QR type sistemi
- validation ve formatter ilişkisi
- preview ekranı
- history veri modeli
- subscription / paywall yapısı
- settings ekranı
- design system eksikleri
- permission akışları
- Android release riskleri
- UI/UX tutarlılığı

Bana şu formatta cevap ver:
1. Executive summary
2. Güçlü taraflar
3. Kritik problemler
4. UI/UX problemleri
5. Orta seviye problemler
6. Önerilen refactor sırası
7. İlk yapılacak aksiyon

Kurallar:
- dosya bazlı somut konuş
- yüzeysel değerlendirme yapma
- gerektiğinde sert eleştir
- production standardına göre değerlendir
- kod yazmadan önce detaylı audit yap

Audit bittikten sonra, ilk yapılacak aksiyon için küçük ve kontrollü bir refactor planı hazırla; ama henüz kodu değiştirme.
```

---

## 43. Son not

Bu dosya sabit referans belgesi olarak kullanılmalıdır.

Sonraki her Cursor görevi:

- bu belgeye uygun olmalı
- ürün kalitesini artırmalı
- teknik borcu azaltmalı
- UI/UX seviyesini yükseltmeli
- uygulamayı yayın kalitesine yaklaştırmalıdır

Bu projede hedef sadece çalışan kod değil;
**profesyonel ürün kalitesidir.**
