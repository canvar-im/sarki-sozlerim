# Şarkı Sözlerim

İzci kamp ateşi şarkılarını toplamak, aramak ve söylerken ekrandan takip etmek için yapılmış bir şarkı sözü arşivi. Tamamen çevrimdışı çalışır — bütün veriler yalnızca cihazda saklanır, hiçbir sunucuya gönderilmez.

Android uygulaması olarak paketlenir (Capacitor), aynı kod tarayıcıda da çalışır.

## Özellikler

- **Arşiv** — şarkı adı, sanatçı, tür, sözler, akorlar/notlar ve dinleme bağlantıları (YouTube / Spotify / Apple Music)
- **Arama ve filtreleme** — başlık, sanatçı ve söz metni içinde arama; etikete göre filtreleme, favoriler, sıralama
- **Söz görüntüleyici** — ayarlanabilir yazı boyutu ve otomatik kaydırma (çalarken ekrana bakmadan söylemek için)
- **Word içe/dışa aktarma** — `.docx` ve eski `.doc` dosyalarından söz alma, tek şarkıyı `.docx` olarak dışa aktarma
- **JSON yedekleme** — tüm arşivi tek dosyaya aktarma ve geri yükleme (cihazlar arası taşımanın yolu budur)
- **Profil** — isim ve fotoğraf, yalnızca cihazda saklanır
- **Donanım geri tuşu desteği** ve çevrimdışı çalışma (Service Worker)

## Veri saklama ve yedekleme

Bütün şarkılar tarayıcının/WebView'in `localStorage` alanında (`music_archive_songs` anahtarı) tutulur. Bunun anlamı:

- Uygulamayı kaldırmak veya "uygulama verilerini temizle" demek **tüm arşivi siler**.
- Tarayıcıda kullanılıyorsa site verilerini temizlemek de aynı sonucu doğurur.
- Cihazdan cihaza geçiş otomatik değildir.

Bu yüzden **Yedekler ekranından düzenli olarak JSON yedeği indirin**. Geri yükleme mevcut şarkıları silmez, yalnızca eksik olanları ekler.

## Geliştirme

**Gereksinimler:** Node.js 20+ ve npm.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit (tip kontrolü)
npm run build      # üretim derlemesi -> dist/
```

## Android APK derleme

**Gereksinimler:** JDK 21 (Capacitor 8 Java 21 kaynak uyumluluğu ister) ve Android SDK (Android Studio ile gelir).

```bash
npm run build                 # web varlıklarını üret
npx cap sync android          # dist/ -> android/app/src/main/assets/public/
cd android
./gradlew assembleDebug       # Windows: gradlew.bat assembleDebug
```

APK çıktısı: `android/app/build/outputs/apk/debug/app-debug.apk`

Telefona kurmak için:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

> Windows'ta `JAVA_HOME` Android Studio'nun kendi JBR klasörünü gösteriyorsa ve derleme
> `invalid source release: 21` ya da `jvm.cfg` hatası veriyorsa, JDK 21'i ayrıca kurup
> `JAVA_HOME`'u ona yönlendirin.

## Sürümleme

Her yayınlanan derlemede üç yer birlikte güncellenir:

| Dosya | Alan |
| --- | --- |
| `src/version.ts` | `APP_VERSION`, `BUILD_STAMP` |
| `android/app/build.gradle` | `versionCode`, `versionName` |
| git | `git tag vX.Y.Z` |

`APP_VERSION` uygulama içinde Yedekler ekranının altında görünür — cihazda hangi
derlemenin çalıştığını doğrulamanın en hızlı yolu budur (dosya aktarımı sırasında
eski bir APK'nın yeniden açılması şaşırtıcı derecede sık karşılaşılan bir durum).

## Proje yapısı

```
src/
  App.tsx                 ekran durumu, gezinme yığını, geri tuşu, yedekleme
  components/
    SongList.tsx          liste, arama, filtre ve sıralama sayfaları
    SongDetail.tsx        söz görüntüleyici, otomatik kaydırma, bağlantı/akor sayfaları
    SongForm.tsx          ekleme/düzenleme formu
    ProfileEditor.tsx     isim ve fotoğraf
    ErrorBoundary.tsx     beklenmeyen hatada kurtarma ekranı
  utils/
    songUtils.ts          bozuk/eksik kayıtları onaran normalleştirme
    wordLyrics.ts         Word içe/dışa aktarma (tembel yüklenir)
    profile.ts            profil saklama, fotoğraf küçültme
    urlParser.ts          müzik bağlantısı platform tespiti
  version.ts              görünür sürüm damgası
android/                  Capacitor Android projesi
public/sw.js              çevrimdışı önbellek (network-first)
```

## Teknik notlar

- **Service Worker `network-first` çalışır.** Cache-first denendiğinde güncellenen
  derlemeler cihazda kalıcı olarak eski sürümde takılı kalıyordu; önbellek adı
  (`CACHE_NAME`) değiştiğinde eski önbellek temizlenir.
- **`docx`, `mammoth` ve `word-extractor` tembel yüklenir.** Üçü birlikte başlangıç
  paketini üç katına çıkarıyordu; artık yalnızca Word içe/dışa aktarma kullanıldığında
  indirilirler. Başlangıç JS'i ~137 kB gzip.
- **`normalizeSongs` her açılışta çalışır.** Eksik alanlı (`links`, `tags` gibi) bir
  kayıt eskiden uygulamayı kalıcı olarak çökertiyordu; artık eksikler tamamlanır.
- **`android:enableOnBackInvokedCallback="false"`** — `targetSdk 36` ile Android'in
  yeni geri hareketi Capacitor'ün JS `backButton` olayını atlıyor, bu bayrak eski
  davranışı geri getiriyor.

## Lisans ve içerik hakkında

Uygulama kodu kişisel/izci grubu kullanımı için yazılmıştır.

Uygulamanın içine eklediğiniz şarkı sözleri size aittir ve sizin sorumluluğunuzdadır.
Söz metinlerinin çoğu telif hakkına tabidir; kendi arşiviniz için kullanmak ile bunları
kamuya dağıtmak farklı şeylerdir. Bu depo hiçbir şarkı sözü içermez — sözler yalnızca
kullanıcının kendi cihazında, kendi eklediği kadarıyla bulunur.
