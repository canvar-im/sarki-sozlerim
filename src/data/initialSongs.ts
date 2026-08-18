import { Song } from '../types';

export const INITIAL_SONGS: Song[] = [
  {
    id: 'gülpembe-baris-manco',
    title: 'Gülpembe',
    artist: 'Barış Manço',
    genre: 'Türkçe Rock',
    isFavorite: true,
    lyrics: `Sen gülünce güller açar Gülpembe
Bülbüller seni söyler, dilerim hiç solmayasın
Gönlümde bir tatlı telaş Gülpembe
Rüzgarlar seni söyler, dilerim hiç solmayasın

Gülpembe, Gülpembe
Dilerim hiç solmayasın
Gülpembe, Gülpembe
Dilerim hiç solmayasın

Seni gördüm göreli yüreğim bir başka atar
Aklımda hep o günler, o güzel anılar yaşar
Gönlümde bir tatlı telaş Gülpembe
Rüzgarlar seni söyler, dilerim hiç solmayasın

Gülpembe, Gülpembe
Dilerim hiç solmayasın
Gülpembe, Gülpembe
Dilerim hiç solmayasın

Gözlerimde yaşlar durur, her an seni arar durur
Bilsen içim nasıl yanar, yokluğun hep içime vurur
Gönlümde bir tatlı telaş Gülpembe
Rüzgarlar seni söyler, dilerim hiç solmayasın

Gülpembe, Gülpembe
Dilerim hiç solmayasın
Gülpembe, Gülpembe
Dilerim hiç solmayasın`,
    links: [
      {
        id: 'gp-link-1',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=0h3j2v5U-t0',
        label: 'Gülpembe Orijinal Video'
      },
      {
        id: 'gp-link-2',
        platform: 'spotify',
        url: 'https://open.spotify.com/track/1P6E9T8OIn84lS8eN9H7jA',
        label: 'Gülpembe - Spotify'
      }
    ],
    tags: ['Barış Manço', 'Klasik', 'Anadolu Rock', '80ler'],
    notes: 'Klavye solosu Fa# minör tonundadır. Akorlar: F#m, Bm, E, A, D, C#7.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  },
  {
    id: 'islak-islak-cem-karaca',
    title: 'Islak Islak',
    artist: 'Cem Karaca',
    genre: 'Türkçe Rock',
    isFavorite: true,
    lyrics: `Geceler boyu sesine uyandım
Seni aradım karanlık odalarda
Yollara düştüm senin yollarında
Kayboldum yokluğunda, anlasana

Islak ıslak bakma öyle ne olur
Islak ıslak bakma öyle ne olur
Islak ıslak bakma öyle...

Güneş doğacak, rüzgar esecek
Yine seninle hayat gülecek
Vazgeçme kendinden, vazgeçme sakın
Unutma her karanlık gecenin bir sabahı var

Yollara düştüm senin yollarında
Kayboldum yokluğunda, anlasana

Islak ıslak bakma öyle ne olur
Islak ıslak bakma öyle ne olur
Islak ıslak bakma öyle...

Güneş doğacak, rüzgar esecek
Yine seninle hayat gülecek
Vazgeçme kendinden, vazgeçme sakın
Unutma her karanlık gecenin bir sabahı var`,
    links: [
      {
        id: 'ii-link-1',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=f7G63f6S4lU',
        label: 'Cem Karaca - Canlı Performans'
      }
    ],
    tags: ['Cem Karaca', 'Anadolu Rock', 'Efsane'],
    notes: 'Ton: Mi minör (Em). Ana ritim: 4/4 arpej ile başlar, nakaratta ritme döner.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'kumsalda-sertab-erener',
    title: 'Kumsalda',
    artist: 'Sertab Erener',
    genre: 'Türkçe Pop',
    isFavorite: false,
    lyrics: `Uzanmışım kumsala rüzgarlar esiyor
Gözlerimi kapamışım bir tatlı rüya deryasında
Sanki her şey o kadar güzel ki her şey yalan gibi
Aşkın rüzgarı esiyor buralarda ne güzel esinti

Kumsalda yürüdüm dün gece seni düşündüm
Kumsalda yürüdüm dün gece seni düşündüm
Düşlerimde hep sen varsın, hep yanımda olsan diyorum
Kumsalda dalgalar fısıldar adını bana derinden

Sevgilim gel yanıma, sarıl boynuma öp beni canım gibi
Aşkın rüzgarı esiyor buralarda ne güzel esinti
Uzanmışım kumsala rüzgarlar esiyor
Gözlerimi kapamışım bir tatlı rüya deryasında`,
    links: [
      {
        id: 'ks-link-1',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=F3nre7jZ-E4',
        label: 'Kumsalda Orijinal Klip'
      }
    ],
    tags: ['Yaz', 'Nostalji', 'Sertab Erener', 'Pop'],
    notes: 'Akorlar oldukça basittir (Am, Dm, G, C, E7). Yaz aylarında çalmak için harikadır.',
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 4
  }
];
