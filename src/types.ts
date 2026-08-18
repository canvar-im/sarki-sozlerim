export interface SongLink {
  id: string;
  platform: 'youtube' | 'spotify' | 'apple';
  url: string;
  label?: string; // Optional custom name for the link
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  genre: string;
  links: SongLink[];
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  photo: string | null; // base64 data URL, resized/compressed client-side
}

export interface SongFilter {
  searchQuery: string;
  genre: string;
  tag: string;
  onlyFavorites: boolean;
  sortBy: 'createdAt-desc' | 'createdAt-asc' | 'title-asc' | 'artist-asc';
}

export const GENRES = [
  'Türkçe Pop',
  'Türkçe Rock',
  'Rap / Hip-Hop',
  'Türk Halk Müziği',
  'Türk Sanat Müziği',
  'Arabesk / Fantezi',
  'Alternatif / Indie',
  'Klasik Müzik',
  'Caz / Blues',
  'Enstrümantal',
  'Diğer'
];

export const PLATFORMS = {
  youtube: {
    name: 'YouTube',
    color: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    iconColor: 'text-red-500'
  },
  spotify: {
    name: 'Spotify',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
    iconColor: 'text-emerald-500'
  },
  apple: {
    name: 'Apple Music',
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20',
    iconColor: 'text-pink-500'
  }
};
