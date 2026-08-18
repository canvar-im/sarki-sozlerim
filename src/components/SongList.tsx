import React from 'react';
import { Song, SongFilter, PLATFORMS } from '../types';
import { Search, Heart, Music, ArrowUpDown, Plus, Disc } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  activeSongId: string | null;
  onSelectSong: (songId: string) => void;
  filter: SongFilter;
  setFilter: React.Dispatch<React.SetStateAction<SongFilter>>;
  onAddNewClick: () => void;
}

export default function SongList({
  songs,
  activeSongId,
  onSelectSong,
  filter,
  setFilter,
  onAddNewClick
}: SongListProps) {
  // Extract all unique tags across all songs for filtering
  const allTags = Array.from(
    new Set(songs.flatMap((song) => song.tags || []))
  ).filter(Boolean);

  // Filter & Sort Logic
  const filteredSongs = songs
    .filter((song) => {
      // 1. Search Query (Check Title, Artist, and Lyrics)
      const query = filter.searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.lyrics.toLowerCase().includes(query) ||
        song.tags.some(tag => tag.toLowerCase().includes(query));

      // 2. Genre Filter
      const matchesGenre = filter.genre === '' || song.genre === filter.genre;

      // 3. Tag Filter
      const matchesTag = filter.tag === '' || song.tags.includes(filter.tag);

      // 4. Favorites Only
      const matchesFavorite = !filter.onlyFavorites || song.isFavorite;

      return matchesSearch && matchesGenre && matchesTag && matchesFavorite;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'createdAt-desc') {
        return b.createdAt - a.createdAt;
      }
      if (filter.sortBy === 'createdAt-asc') {
        return a.createdAt - b.createdAt;
      }
      if (filter.sortBy === 'title-asc') {
        return a.title.localeCompare(b.title, 'tr');
      }
      if (filter.sortBy === 'artist-asc') {
        return a.artist.localeCompare(b.artist, 'tr');
      }
      return 0;
    });

  const clearFilters = () => {
    setFilter({
      searchQuery: '',
      genre: '',
      tag: '',
      onlyFavorites: false,
      sortBy: 'createdAt-desc'
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Header with quick search */}
      <div className="p-5 border-b border-slate-800/60 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-2xs text-slate-400 font-semibold truncate">{songs.length} şarkı kayıtlı</p>
          </div>
          <button
            onClick={onAddNewClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Ekle
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            placeholder="Şarkı adı, sanatçı veya sözlerde ara..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 text-xs transition-colors"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter({ ...filter, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs p-1 rounded hover:bg-slate-850"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Row (scrollable) + Sort */}
      <div className="px-5 py-3 border-b border-slate-800/40 bg-slate-950/20 flex items-center gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
          {/* "Tüm Etiketler" chip resets the tag filter */}
          <button
            onClick={() => setFilter({ ...filter, tag: '' })}
            className={`shrink-0 text-2xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
              filter.tag === ''
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            Tüm Etiketler
          </button>

          {/* One chip per existing tag */}
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter({ ...filter, tag: filter.tag === t ? '' : t })}
              className={`shrink-0 text-2xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                filter.tag === t
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              #{t}
            </button>
          ))}

          {/* Favorites toggle chip */}
          <button
            onClick={() => setFilter({ ...filter, onlyFavorites: !filter.onlyFavorites })}
            className={`shrink-0 flex items-center gap-1 text-2xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              filter.onlyFavorites
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filter.onlyFavorites ? 'fill-rose-500 text-rose-400' : ''}`} />
            Favoriler
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
            className="text-2xs bg-transparent border-none text-slate-400 font-medium cursor-pointer focus:outline-none focus:ring-0 pr-6 py-1"
          >
            <option value="createdAt-desc" className="bg-slate-900">En Yeni Eklenen</option>
            <option value="createdAt-asc" className="bg-slate-900">En Eski Eklenen</option>
            <option value="title-asc" className="bg-slate-900">A-Z (Şarkı Adı)</option>
            <option value="artist-asc" className="bg-slate-900">A-Z (Sanatçı)</option>
          </select>
        </div>
      </div>

      {/* Song List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const isActive = song.id === activeSongId;
            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song.id)}
                className={`p-4 transition-all duration-150 cursor-pointer flex items-start gap-3 relative select-none ${
                  isActive
                    ? 'bg-emerald-500/5 hover:bg-emerald-500/8 border-l-2 border-emerald-500'
                    : 'hover:bg-slate-800/40 border-l-2 border-transparent'
                }`}
              >
                {/* Vinyl/Disc Icon */}
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500 group-hover:text-slate-400'
                }`}>
                  <Disc className={`w-4 h-4 ${isActive ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {song.title}
                    </h3>
                    {song.isFavorite && (
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-2xs text-slate-400 font-medium mt-0.5 truncate">{song.artist}</p>
                  
                  {/* Genre and Platform Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-slate-800/60 rounded text-3xs font-medium uppercase tracking-wider">
                      {song.genre}
                    </span>
                    
                    {/* Platform quick indicators */}
                    {song.links.length > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from(new Set(song.links.map(l => l.platform))).map(plat => (
                          <span
                            key={plat}
                            className={`w-1.5 h-1.5 rounded-full ${
                              plat === 'youtube' ? 'bg-red-500' :
                              plat === 'spotify' ? 'bg-emerald-500' :
                              plat === 'apple' ? 'bg-pink-500' :
                              plat === 'soundcloud' ? 'bg-orange-500' : 'bg-slate-400'
                            }`}
                            title={PLATFORMS[plat].name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-center text-slate-600 mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-300">Arama Sonucu Bulunamadı</p>
            <p className="text-2xs text-slate-500 max-w-[200px] mt-1 leading-normal">
              Farklı bir kelime deneyebilir veya yeni bir şarkı ekleyebilirsiniz.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-2xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
