import React, { useState, useEffect, useRef } from 'react';
import { Song, SongLink, GENRES, PLATFORMS } from '../types';
import { detectPlatform, isValidUrl } from '../utils/urlParser';
import { extractLyricsFromWordFile } from '../utils/wordLyrics';
import { Plus, Trash2, X, Link2, Info, Sparkles, Tag, FileText, FileUp } from 'lucide-react';

interface SongFormProps {
  song?: Song | null;
  onSave: (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function SongForm({ song, onSave, onCancel }: SongFormProps) {
  const lyricsFileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [lyrics, setLyrics] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [lyricsImportStatus, setLyricsImportStatus] = useState('');
  
  // Tag state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Links state
  const [links, setLinks] = useState<SongLink[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [urlError, setUrlError] = useState('');

  // Initialize form if editing
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setGenre(song.genre);
      setLyrics(song.lyrics);
      setNotes(song.notes || '');
      setIsFavorite(song.isFavorite);
      setTags(song.tags);
      setLinks(song.links);
    } else {
      setTitle('');
      setArtist('');
      setGenre(GENRES[0]);
      setLyrics('');
      setNotes('');
      setIsFavorite(false);
      setTags([]);
      setLinks([]);
    }
  }, [song]);

  // Tag Management
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().replace(/,/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/,/g, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
        setTagInput('');
      }
    }
  };

  // Link Management
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    if (!newUrl.trim()) return;

    if (!isValidUrl(newUrl)) {
      setUrlError('Lütfen geçerli bir internet adresi (URL) girin.');
      return;
    }

    const platform = detectPlatform(newUrl);
    if (!platform) {
      setUrlError('Yalnızca YouTube, Spotify ve Apple Music bağlantıları ekleyebilirsiniz.');
      return;
    }
    const platformName = PLATFORMS[platform].name;
    const finalLabel = newLabel.trim() || `${platformName} Bağlantısı`;

    const newSongLink: SongLink = {
      id: crypto.randomUUID(),
      platform,
      url: newUrl.trim(),
      label: finalLabel
    };

    setLinks([...links, newSongLink]);
    setNewUrl('');
    setNewLabel('');
  };

  const handleRemoveLink = (idToRemove: string) => {
    setLinks(links.filter(link => link.id !== idToRemove));
  };

  const handleLyricsWordImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLyricsImportStatus('Word dosyası okunuyor...');
      const importedLyrics = await extractLyricsFromWordFile(file);
      setLyrics(importedLyrics);
      setLyricsImportStatus(importedLyrics ? 'Sözler Word dosyasından yüklendi.' : 'Dosyada okunabilir metin bulunamadı.');
    } catch (error) {
      setLyricsImportStatus('Word dosyası okunamadı. Lütfen .doc veya .docx biçiminde olduğundan emin olun.');
    } finally {
      e.target.value = '';
    }
  };

  // Auto-fill label based on URL pasting
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewUrl(url);
    if (isValidUrl(url)) {
      const platform = detectPlatform(url);
      if (platform) {
        setNewLabel(`${PLATFORMS[platform].name} Bağlantısı`);
        setUrlError('');
      } else {
        setNewLabel('');
        setUrlError('Yalnızca YouTube, Spotify ve Apple Music bağlantıları desteklenir.');
      }
    } else {
      setNewLabel('');
    }
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      return;
    }

    onSave({
      id: song?.id,
      title: title.trim(),
      artist: artist.trim(),
      genre,
      lyrics: lyrics,
      links,
      tags,
      notes: notes.trim() || undefined,
      isFavorite
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {song ? 'Şarkıyı Düzenle' : 'Yeni Şarkı Ekle'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Arşivinize şarkı sözleri, etiketler ve dinleme bağlantıları ekleyin.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Vazgeç"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Row 1: Title & Artist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Şarkı Adı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Gülpembe, Islak Islak..."
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Sanatçı / Grup <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Örn: Barış Manço, Cem Karaca..."
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
            />
          </div>
        </div>

        {/* Row 2: Genre & Favorite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tür / Kategori
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-slate-100">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center h-12 px-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer w-full select-none">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4.5 h-4.5 text-emerald-500 bg-slate-950 border-slate-800 rounded focus:ring-emerald-500/30 focus:ring-offset-slate-900"
              />
              <span className="text-sm font-medium text-slate-300">Bu Şarkıyı Favorilere Ekle</span>
            </label>
          </div>
        </div>

        {/* Lyrics Area */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Şarkı Sözleri
            </label>
            <button
              type="button"
              onClick={() => lyricsFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 text-2xs font-semibold text-slate-300 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
            >
              <FileUp className="w-3.5 h-3.5" />
              Word’den Al
            </button>
          </div>
          <input
            ref={lyricsFileInputRef}
            type="file"
            accept=".doc,.docx"
            className="hidden"
            onChange={handleLyricsWordImport}
          />
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Şarkı sözlerini buraya yazın veya yapıştırın..."
            rows={12}
            className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all text-sm font-mono leading-relaxed"
          />
          {lyricsImportStatus && (
            <p className="mt-2 text-2xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-emerald-400" />
              {lyricsImportStatus}
            </p>
          )}
        </div>

        {/* Links Integration Section */}
        <div className="border-t border-slate-800/60 pt-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
            <Link2 className="w-4 h-4 text-emerald-400" />
            Müzik Bağlantıları (YouTube, Spotify ve Apple Music)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Arama yapıldığında şarkı sözleriyle birlikte bu dinleme bağlantılarına doğrudan erişebilirsiniz.
          </p>

          {/* Pasted Links List */}
          {links.length > 0 && (
            <div className="space-y-2 mb-4">
              {links.map((link) => {
                const platformMeta = PLATFORMS[link.platform];
                return (
                  <div key={link.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs">
                    <div className="flex items-center gap-2 overflow-hidden mr-4">
                      <span className={`px-2 py-0.5 rounded text-2xs font-semibold border ${platformMeta.color}`}>
                        {platformMeta.name}
                      </span>
                      <span className="text-slate-300 font-medium truncate">{link.label}</span>
                      <span className="text-slate-500 font-mono text-2xs truncate select-all">({link.url})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
                      title="Bağlantıyı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Link Input Group */}
          <div className="p-4 bg-slate-950/30 border border-slate-800/60 rounded-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Şarkı Bağlantı Linki (Paste URL)..."
                  value={newUrl}
                  onChange={handleUrlChange}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Bağlantı Başlığı (Örn: Klip, Canlı Performans...)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 hover:border-emerald-500 text-slate-300 font-medium rounded-lg transition-all text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ekle
                </button>
              </div>
            </div>
            {urlError && <p className="text-2xs text-rose-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> {urlError}</p>}
            <p className="text-2xs text-slate-500 font-medium">
              * Eklediğiniz her geçerli platform adresi için şarkı detay sayfasında hızlı dinleme butonları oluşturulacaktır.
            </p>
          </div>
        </div>

        {/* Tags management */}
        <div className="border-t border-slate-800/60 pt-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Etiketler (Örn: Anadolu Rock, 90lar, Canlı)
          </label>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Yeni etiket yazıp Enter'a basın..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-xs"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-lg text-xs cursor-pointer"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Notes (Chords, Key, Reminders) */}
        <div className="border-t border-slate-800/60 pt-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Özel Notlar (Akorlar, Ton, Açıklamalar)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Şarkıyla ilgili akor bilgilerini, ton bilgisini veya hatırlatıcıları buraya ekleyin..."
            rows={3}
            className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          Vazgeç
        </button>
        <button
          type="submit"
          disabled={!title.trim() || !artist.trim()}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 text-slate-950 font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 transition-all flex items-center gap-1 cursor-pointer"
        >
          {song ? 'Değişiklikleri Kaydet' : 'Şarkıyı Kaydet'}
        </button>
      </div>
    </form>
  );
}
