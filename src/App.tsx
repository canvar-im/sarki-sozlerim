import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song, SongFilter, UserProfile } from './types';
import { INITIAL_SONGS } from './data/initialSongs';
import { normalizeSongs } from './utils/songUtils';
import { loadProfile, saveProfile, getInitials, DEFAULT_PROFILE } from './utils/profile';
import { APP_VERSION, BUILD_STAMP } from './version';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import SongForm from './components/SongForm';
import ProfileEditor from './components/ProfileEditor';
import ErrorBoundary from './components/ErrorBoundary';
import { App as CapacitorApp } from '@capacitor/app';
import {
  Music,
  Plus,
  Share2,
  Download,
  Upload,
  ArrowLeft,
  Info,
  Library,
  Sparkles,
  FileMusic,
  SearchCheck,
  CheckCircle2,
  AlertCircle,
  Settings,
  User,
  ChevronRight,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Screen = 'list' | 'detail' | 'form' | 'drawer' | 'profile';

export default function App() {
  // Songs Database State
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  // Backup Drawer Open/Close State
  const [showBackupDrawer, setShowBackupDrawer] = useState(false);

  // Profile State (name + photo, stored locally on-device only)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
    showToast('Profil güncellendi.');
  };

  // Filters State
  const [filter, setFilter] = useState<SongFilter>({
    searchQuery: '',
    genre: '',
    tag: '',
    onlyFavorites: false,
    sortBy: 'createdAt-desc'
  });

  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Layout View States (For mobile responsive single-screen behavior)
  const [mobileView, setMobileView] = useState<'list' | 'detail' | 'form'>('list');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Alert/Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigationStackRef = useRef<Screen[]>(['list']);

  const applyScreen = useCallback((screen: Screen) => {
    if (screen === 'list') {
      setShowBackupDrawer(false);
      setShowProfileEditor(false);
      setIsEditing(false);
      setEditingSong(null);
      setMobileView('list');
      return;
    }

    if (screen === 'detail') {
      setShowBackupDrawer(false);
      setShowProfileEditor(false);
      setIsEditing(false);
      setEditingSong(null);
      setMobileView('detail');
      return;
    }

    if (screen === 'form') {
      setShowBackupDrawer(false);
      setShowProfileEditor(false);
      setIsEditing(true);
      setMobileView('form');
      return;
    }

    if (screen === 'drawer') {
      setShowProfileEditor(false);
      setShowBackupDrawer(true);
      return;
    }

    if (screen === 'profile') {
      setShowBackupDrawer(false);
      setShowProfileEditor(true);
    }
  }, []);

  const syncHistoryState = useCallback((screen: Screen, replace = false) => {
    const state = { screen };
    if (replace) {
      window.history.replaceState(state, '', window.location.href);
      return;
    }

    window.history.pushState(state, '', window.location.href);
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    setNavigationStackState((prev) => {
      const next = [...prev, screen];
      navigationStackRef.current = next;
      return next;
    });
    applyScreen(screen);
    syncHistoryState(screen);
  }, [applyScreen, syncHistoryState]);

  const navigateHome = useCallback(() => {
    const next = ['list'] as Screen[];
    navigationStackRef.current = next;
    setNavigationStackState(next);
    applyScreen('list');
    syncHistoryState('list', true);
  }, [applyScreen, syncHistoryState]);

  const goBack = useCallback(() => {
    // `window.history.length` only ever grows and never shrinks when you
    // navigate back within the same document, so after the very first
    // in-app navigation it stays >1 forever — it can't tell us whether
    // there's actually anywhere left to go in *our* screen stack. Our own
    // navigationStackRef is the source of truth for that.
    if (navigationStackRef.current.length > 1) {
      window.history.back();
      return true;
    }

    return false;
  }, []);

  const [navigationStackState, setNavigationStackState] = useState<Screen[]>(['list']);

  useEffect(() => {
    navigationStackRef.current = navigationStackState;
  }, [navigationStackState]);

  useEffect(() => {
    if (!window.history.state?.screen) {
      syncHistoryState('list', true);
    }

    const handlePopState = () => {
      const currentStack = navigationStackRef.current;
      if (currentStack.length <= 1) {
        applyScreen('list');
        return;
      }

      const next = currentStack.slice(0, -1);
      navigationStackRef.current = next;
      setNavigationStackState(next);
      applyScreen(next[next.length - 1]);
    };

    window.addEventListener('popstate', handlePopState);

    const handleBack = () => {
      // Same fix as goBack(): `window.history.length` never shrinks, so this
      // used to call history.back() forever and never exit the app — once
      // you'd navigated anywhere at all, pressing the hardware back button
      // on the root list screen did nothing instead of closing the app.
      if (navigationStackRef.current.length > 1) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    };

    const removeListenerPromise = CapacitorApp.addListener('backButton', handleBack);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      removeListenerPromise.then((listener) => listener.remove());
    };
  }, [applyScreen, syncHistoryState]);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('music_archive_songs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Normalize on every load, not just on import: this also self-heals
        // any songs that were saved before this fix and are missing fields
        // like `links`/`tags`, instead of crashing on every future launch.
        const normalized = normalizeSongs(parsed);
        setSongs(normalized);
        if (normalized.length > 0) {
          setActiveSongId(normalized[0].id);
        }
        // Persist the healed version so we don't need to re-normalize every load.
        if (JSON.stringify(normalized) !== stored) {
          localStorage.setItem('music_archive_songs', JSON.stringify(normalized));
        }
      } catch (err) {
        // Fallback to initial songs if parsing fails
        setSongs(INITIAL_SONGS);
        localStorage.setItem('music_archive_songs', JSON.stringify(INITIAL_SONGS));
        if (INITIAL_SONGS.length > 0) {
          setActiveSongId(INITIAL_SONGS[0].id);
        }
      }
    } else {
      // First time loading the app
      setSongs(INITIAL_SONGS);
      localStorage.setItem('music_archive_songs', JSON.stringify(INITIAL_SONGS));
      if (INITIAL_SONGS.length > 0) {
        setActiveSongId(INITIAL_SONGS[0].id);
      }
    }
  }, []);

  // 2. LocalStorage syncing helper
  const saveToStorage = (updatedSongs: Song[]) => {
    setSongs(updatedSongs);
    localStorage.setItem('music_archive_songs', JSON.stringify(updatedSongs));
  };

  // Active Song Lookup
  const activeSong = songs.find((s) => s.id === activeSongId) || null;

  // CRUD Actions
  const handleSaveSong = (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = Date.now();
    let updated: Song[];

    if (songData.id) {
      // Update existing
      updated = songs.map((s) => {
        if (s.id === songData.id) {
          return {
            ...s,
            title: songData.title,
            artist: songData.artist,
            genre: songData.genre,
            lyrics: songData.lyrics,
            links: songData.links,
            tags: songData.tags,
            notes: songData.notes,
            isFavorite: songData.isFavorite,
            updatedAt: now
          };
        }
        return s;
      });
      showToast(`"${songData.title}" başarıyla güncellendi.`);
    } else {
      // Create new
      const newSong: Song = {
        id: crypto.randomUUID(),
        title: songData.title,
        artist: songData.artist,
        genre: songData.genre,
        lyrics: songData.lyrics,
        links: songData.links,
        tags: songData.tags,
        notes: songData.notes,
        isFavorite: songData.isFavorite,
        createdAt: now,
        updatedAt: now
      };
      updated = [newSong, ...songs];
      setActiveSongId(newSong.id);
      showToast(`"${songData.title}" arşivinize eklendi.`);
    }

    saveToStorage(updated);
    setIsEditing(false);
    setEditingSong(null);
    setNavigationStackState((prev) => {
      const next = [...prev];
      if (next[next.length - 1] === 'form') {
        next[next.length - 1] = 'detail';
      } else if (next[next.length - 1] !== 'detail') {
        next.push('detail');
      }
      navigationStackRef.current = next;
      return next;
    });
    applyScreen('detail');
    syncHistoryState('detail', true);
  };

  const handleDeleteSong = (songId: string) => {
    const songToDelete = songs.find(s => s.id === songId);
    const updated = songs.filter((s) => s.id !== songId);
    saveToStorage(updated);

    if (updated.length > 0) {
      setActiveSongId(updated[0].id);
    } else {
      setActiveSongId(null);
    }

    showToast(`"${songToDelete?.title || 'Şarkı'}" arşivden silindi.`, 'info');
    navigateHome();
  };

  const handleToggleFavorite = (songId: string) => {
    const updated = songs.map((s) => {
      if (s.id === songId) {
        const nextFav = !s.isFavorite;
        showToast(nextFav ? `"${s.title}" favorilere eklendi.` : `"${s.title}" favorilerden çıkarıldı.`);
        return { ...s, isFavorite: nextFav };
      }
      return s;
    });
    saveToStorage(updated);
  };

  // Backups: Export JSON
  const handleExportBackup = () => {
    if (songs.length === 0) {
      showToast('Dışa aktarılacak şarkı bulunamadı.', 'error');
      return;
    }
    const dataStr = JSON.stringify(songs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `muzik-arsivi-yedek-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('Müzik arşivi yedeği indirildi.');
  };

  // Backups: Import JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          showToast('Geçersiz yedek formatı. Lütfen geçerli bir Şarkı Sözlerim JSON dosyası seçin.', 'error');
          return;
        }

        // Backfill missing/partial fields (links, tags, etc.) instead of
        // trusting the file's shape — a backup edited by hand, exported by
        // an older app version, or merged from another tool can easily be
        // missing fields the UI assumes always exist. Previously that would
        // crash the whole app on the very next render, and permanently on
        // every future launch since the bad data was already saved.
        const candidates = normalizeSongs(parsed);
        if (candidates.length === 0) {
          showToast('Geçersiz yedek formatı. Lütfen geçerli bir Şarkı Sözlerim JSON dosyası seçin.', 'error');
          return;
        }

        const skipped = parsed.length - candidates.length;
        const existingIds = new Set(songs.map(s => s.id));
        const newSongs = candidates.filter(s => !existingIds.has(s.id));
        const updated = [...songs, ...newSongs];

        saveToStorage(updated);
        if (updated.length > 0 && !activeSongId) {
          setActiveSongId(updated[0].id);
        }
        showToast(
          skipped > 0
            ? `${newSongs.length} yeni şarkı içe aktarıldı, ${skipped} kayıt eksik/geçersiz olduğu için atlandı.`
            : `${newSongs.length} yeni şarkı başarıyla içe aktarıldı!`
        );
      } catch (err) {
        showToast('Yedek dosyası okunamadı veya bozuk.', 'error');
      }
    };
    fileReader.readAsText(file);
    // Reset file input value to allow uploading same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Click on "Add New"
  const handleAddNewClick = () => {
    setEditingSong(null);
    setIsEditing(true);
    navigateTo('form');
  };

  // Click on "Edit" in Detail View
  const handleEditClick = (songToEdit: Song) => {
    setEditingSong(songToEdit);
    setIsEditing(true);
    navigateTo('form');
  };

  // Selection change
  const handleSelectSong = (songId: string) => {
    setActiveSongId(songId);
    setIsEditing(false);
    navigateTo('detail');
  };

  const handleCloseDrawer = () => {
    if (showBackupDrawer) {
      goBack();
      return;
    }
    setShowBackupDrawer(false);
  };

  const handleCloseProfileEditor = () => {
    if (showProfileEditor) {
      goBack();
      return;
    }
    setShowProfileEditor(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#070b13] bg-radial-[at_top_right,_var(--tw-gradient-stops)] from-emerald-950/15 via-slate-950 to-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-0 md:p-6 selection:bg-emerald-500/25 selection:text-emerald-300 overflow-hidden">
      
      {/* Invisible file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* App Shell: Becomes physical phone container on desktop, full-screen on mobile */}
      <div className="w-full h-[100dvh] md:h-[840px] md:max-w-[412px] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] bg-slate-950 flex flex-col relative md:ring-1 md:ring-slate-700/50 overflow-hidden">

        {/* İzcilik kamp ateşi ambiyansı: sabit, GPU-ucuz bir parıltı katmanı.
            Hiçbir görsel indirmiyor, sadece opacity/transform animasyonu
            kullanıyor; App Main Workspace'in altında kalıyor, sadece alt
            navigasyon çubuğu gibi yarı saydam/blur'lu alanlardan hafifçe
            sızıyor. */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <div className="campfire-glow absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="campfire-glow-slow absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-400/20 blur-2xl" />
          <Flame className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 text-orange-500/20" />
        </div>

        {/* Smartphone Camera Notch & Speaker Bar (Desktop Only) */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 items-center justify-center gap-1.5 px-3">
          <div className="w-10 h-1 bg-slate-900 rounded-full" />
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-850" />
        </div>

        {/* Smartphone Top Status Bar (Desktop Only) */}
        <div className="hidden md:flex h-9 bg-slate-950 shrink-0 items-center justify-between px-6 text-[10px] font-mono font-bold text-slate-400 select-none z-40">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>LTE</span>
            <span>100%</span>
          </div>
        </div>

        {/* App Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Compact Navigation Bar */}
          <header className="px-5 py-3 bg-slate-900/80 border-b border-slate-900 backdrop-blur-xl shrink-0 flex items-center justify-between z-30">
            {mobileView === 'list' ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-emerald-400">
                    <Library className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm font-display font-bold tracking-tight text-slate-100">
                    Koleksiyonum
                  </h1>
                  {profile.name && (
                    <p className="text-3xs text-slate-500 -mt-0.5 truncate max-w-[160px]">
                      Hoş geldin, {profile.name.split(' ')[0]}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  goBack();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 rounded-xl text-2xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                Listeye Dön
              </button>
            )}

            {/* Top Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  navigateTo('drawer');
                }}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer"
                title="Yedekleme ve Ayarlar"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {mobileView === 'list' && (
                <button
                  onClick={() => {
                    navigateTo('profile');
                  }}
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center cursor-pointer shrink-0"
                  title="Profilim"
                >
                  <span className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Profil" className="w-full h-full object-cover" />
                    ) : profile.name ? (
                      <span className="text-3xs font-display font-bold text-emerald-400">
                        {getInitials(profile.name)}
                      </span>
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </span>
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Content Views */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <SongForm
                    song={editingSong}
                    onSave={handleSaveSong}
                    onCancel={() => goBack()}
                  />
                </motion.div>
              ) : activeSong && mobileView === 'detail' ? (
                <motion.div
                  key={`detail-${activeSong.id}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <SongDetail
                    song={activeSong}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteSong}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="songs-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex flex-col"
                >
                  {songs.length > 0 ? (
                    <SongList
                      songs={songs}
                      activeSongId={activeSongId}
                      onSelectSong={handleSelectSong}
                      filter={filter}
                      setFilter={setFilter}
                      onAddNewClick={handleAddNewClick}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900 border border-slate-850 rounded-2xl m-4 overflow-y-auto">
                      <div className="relative mb-5 shrink-0">
                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 relative z-10 border border-orange-500/25">
                          <Flame className="w-8 h-8" />
                        </div>
                        <div className="campfire-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-500/10 rounded-full filter blur-xl" />
                      </div>

                      <h3 className="text-md font-display font-bold text-slate-100">
                        Şarkı Sözleriniz Boş
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                        Henüz hiç şarkı kaydetmediniz. Hemen yeni şarkı ekleyerek kendi özel şarkı arşivinizi oluşturun!
                      </p>
                      
                      <div className="flex flex-col gap-2 w-full max-w-xs mt-6 shrink-0">
                        <button
                          onClick={handleAddNewClick}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                        >
                          <Plus className="w-4 h-4" />
                          İlk Şarkımı Ekle
                        </button>
                        
                        <button
                          onClick={() => {
                            saveToStorage(INITIAL_SONGS);
                            if (INITIAL_SONGS.length > 0) {
                              setActiveSongId(INITIAL_SONGS[0].id);
                            }
                            showToast('Örnek şarkılar başarıyla geri yüklendi.');
                          }}
                          className="px-4 py-2 text-slate-300 font-bold bg-slate-800 hover:bg-slate-750 border border-slate-750 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Örnek Şarkıları Yükle
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Mobile Bottom Navigation Bar */}
          <nav className="h-14 bg-slate-900/90 border-t border-slate-900 backdrop-blur-md shrink-0 flex items-center justify-around px-4 z-40 select-none">
            <button
              onClick={() => {
                navigateHome();
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                mobileView === 'list' && !isEditing
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Library className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Koleksiyon</span>
            </button>

            <button
              onClick={handleAddNewClick}
              className="flex flex-col items-center justify-center -translate-y-3 shrink-0 cursor-pointer"
              title="Şarkı Ekle"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
            </button>

            <button
              onClick={() => {
                navigateTo('drawer');
              }}
              className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                showBackupDrawer
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Yedekler</span>
            </button>
          </nav>

          {/* Bottom Drawer Slide-up Sheet (Backup/Settings operations) */}
          <AnimatePresence>
            {showBackupDrawer && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCloseDrawer}
                  className="absolute inset-0 bg-slate-950 z-45"
                />

                {/* Drawer Content */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[28px] z-50 p-6 flex flex-col shadow-2xl"
                >
                  {/* Pull handle bar */}
                  <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mb-4" />

                  <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-2 mb-1.5">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    Yedekleme ve Ayarlar
                  </h3>
                  <p className="text-2xs text-slate-400 leading-normal mb-5">
                    Şarkı arşivinizi güvende tutmak için yedek alın veya daha önce aldığınız yedekleri geri yükleyin.
                  </p>

                  <button
                    onClick={() => {
                      navigateTo('profile');
                    }}
                    className="w-full flex items-center gap-3 p-3 mb-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                        {profile.photo ? (
                          <img src={profile.photo} alt="Profil" className="w-full h-full object-cover" />
                        ) : profile.name ? (
                          <span className="text-xs font-display font-bold text-emerald-400">
                            {getInitials(profile.name)}
                          </span>
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {profile.name || 'İsim eklenmedi'}
                      </p>
                      <p className="text-3xs text-slate-500">Profili düzenle</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </button>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/80 transition-all font-semibold text-xs text-slate-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        Yedekten İçe Aktar (JSON)
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        handleExportBackup();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/80 transition-all font-semibold text-xs text-slate-200 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" />
                        Yedeği İndir (JSON)
                      </span>
                    </button>

                    <div className="border-t border-slate-800/60 my-4" />

                    <button
                      onClick={() => {
                        if (confirm('Tüm mevcut şarkılarınız silinecek ve fabrika verileri yüklenecektir. Emin misiniz?')) {
                          saveToStorage(INITIAL_SONGS);
                          if (INITIAL_SONGS.length > 0) {
                            setActiveSongId(INITIAL_SONGS[0].id);
                          }
                          handleCloseDrawer();
                          showToast('Fabrika verileri başarıyla yüklendi.');
                        }
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/80 transition-all font-semibold text-xs text-slate-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        Fabrika Verilerine Sıfırla
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={handleCloseDrawer}
                    className="w-full text-center py-2.5 mt-5 bg-slate-800 hover:bg-slate-750 font-bold text-xs text-slate-300 rounded-xl transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>

                  {/* Visible build marker: the fastest way to confirm a newly
                      installed APK actually took effect on a device, instead
                      of silently reopening an old cached/stale build. */}
                  <p className="text-center text-3xs font-mono text-slate-600 mt-4 select-text">
                    Sürüm {APP_VERSION} · {BUILD_STAMP}
                  </p>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Profile Editor Sheet */}
          <AnimatePresence>
            {showProfileEditor && (
              <ProfileEditor
                profile={profile}
                onSave={handleSaveProfile}
                onClose={handleCloseProfileEditor}
              />
            )}
          </AnimatePresence>

          {/* Toast Notification (Nested inside the screen layout for app fidelity) */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-20 left-4 right-4 z-50 flex items-center gap-3 px-3.5 py-3 rounded-xl border shadow-xl blur-backdrop select-none"
                style={{
                  backgroundColor: toast.type === 'success' ? 'rgba(6, 78, 59, 0.92)' : toast.type === 'error' ? 'rgba(153, 27, 27, 0.92)' : 'rgba(30, 41, 59, 0.92)',
                  borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(148, 163, 184, 0.35)'
                }}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-slate-300 shrink-0" />}
                <span className="text-2xs font-semibold text-slate-100">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
