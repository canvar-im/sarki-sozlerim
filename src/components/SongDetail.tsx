import React, { useState, useEffect, useRef } from 'react';
import { Song, PLATFORMS } from '../types';
import { createLyricsDocxBlob } from '../utils/wordLyrics';
import {
  Heart,
  Edit2,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  Eye,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SongDetailProps {
  song: Song;
  onEditClick: (song: Song) => void;
  onDeleteClick: (songId: string) => void;
  onToggleFavorite: (songId: string) => void;
}

export default function SongDetail({
  song,
  onEditClick,
  onDeleteClick,
  onToggleFavorite
}: SongDetailProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl'>('lg');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(15); // pixels per second
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showChordsModal, setShowChordsModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Stop scrolling if song changes
  useEffect(() => {
    setIsScrolling(false);
    setConfirmDelete(false);
    setShowChordsModal(false);
    setShowLinksModal(false);
  }, [song]);

  // Auto Scroll Engine
  useEffect(() => {
    if (isScrolling) {
      const container = lyricsContainerRef.current;
      if (!container) return;

      const intervalMs = 50; // 20 updates per second
      const step = (scrollSpeed / 1000) * intervalMs; // pixels to scroll per interval

      let accumulatedScroll = container.scrollTop;

      scrollIntervalRef.current = window.setInterval(() => {
        accumulatedScroll += step;
        container.scrollTop = Math.floor(accumulatedScroll);

        // Check if reached bottom
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= maxScroll - 1) {
          setIsScrolling(false);
        }
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);

  // Handlers
  const handleScrollToggle = () => {
    setIsScrolling(!isScrolling);
  };

  const handleResetScroll = () => {
    setIsScrolling(false);
    if (lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTop = 0;
    }
  };

  const handleWordExport = async () => {
    const blob = await createLyricsDocxBlob(song);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.title} - ${song.artist}.docx`.replace(/[\\/:*?"<>|]/g, '_');
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const changeFontSize = (direction: 'up' | 'down') => {
    const sizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl')[] = ['sm', 'base', 'lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(fontSize);
    
    if (direction === 'up' && currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  // Font size Tailwind class mapper
  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed md:text-lg md:leading-loose',
    xl: 'text-lg leading-loose md:text-xl md:leading-loose',
    '2xl': 'text-xl leading-loose md:text-2xl md:leading-loose'
  }[fontSize];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Scroll Indicator */}
      {isScrolling && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-[pulse_1.5s_infinite] z-20" />
      )}

      {/* Top Header Panel */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex flex-col gap-3 shrink-0">
        {/* Genre and Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
            {song.genre}
          </span>
          <div className="flex gap-1 flex-wrap">
            {song.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-850/60 rounded-md text-[10px] font-medium">
                #{tag}
              </span>
            ))}
            {song.tags.length > 3 && (
              <span className="px-1.5 py-0.5 bg-slate-950 text-slate-500 border border-slate-850/60 rounded-md text-[10px] font-medium">
                +{song.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Title, Artist, and Actions Grid */}
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-display font-bold text-slate-100 tracking-tight truncate select-text">
              {song.title}
            </h1>
            <p className="text-xs font-medium text-slate-400 select-text mt-0.5">
              {song.artist}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 shrink-0 self-center flex-wrap justify-end">
            {song.lyrics.trim() && (
              <button
                onClick={handleWordExport}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
                title="Sözleri Word dosyası olarak indir"
              >
                <FileDown className="w-4 h-4" />
              </button>
            )}

            {song.notes && (
              <button
                onClick={() => setShowChordsModal(true)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
                title="Akorlar"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}

            {song.links.length > 0 && (
              <button
                onClick={() => setShowLinksModal(true)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-all cursor-pointer"
                title="Müzik Bağlantıları"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(song.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                song.isFavorite
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={song.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onEditClick(song)}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              title="Şarkıyı Düzenle"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Double-confirmation Delete Button */}
            {confirmDelete ? (
              <div className="flex items-center bg-rose-950/40 border border-rose-900/40 rounded-xl overflow-hidden shadow-lg animate-[fadeIn_0.2s_ease-out]">
                <button
                  onClick={() => {
                    onDeleteClick(song.id);
                    setConfirmDelete(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-2 transition-colors cursor-pointer"
                >
                  Sil
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] font-bold px-2 py-2 transition-colors cursor-pointer"
                >
                  İptal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-900/40 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                title="Şarkıyı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reader Layout Controls (Font size & Auto Scroll settings) */}
      <div className="px-6 py-3.5 bg-slate-900/70 border-b border-slate-800/40 shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Font size settings */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg flex items-center gap-1 text-slate-400">
            <Type className="w-4 h-4 mr-1 text-emerald-500" />
            <button
              onClick={() => changeFontSize('down')}
              className="px-2 py-0.5 hover:bg-slate-800 hover:text-slate-100 rounded text-xs font-bold cursor-pointer"
              title="Yazıyı Küçült"
            >
              A-
            </button>
            <span className="w-10 text-center text-xs font-mono font-bold text-slate-300 uppercase">
              {fontSize}
            </span>
            <button
              onClick={() => changeFontSize('up')}
              className="px-2 py-0.5 hover:bg-slate-800 hover:text-slate-100 rounded text-xs font-bold cursor-pointer"
              title="Yazıyı Büyüt"
            >
              A+
            </button>
          </div>
        </div>

        {/* Auto Scroll settings */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Hız</span>
            <input
              type="range"
              min="5"
              max="60"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-16 md:w-24 accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-300 w-8 text-right">
              {scrollSpeed}px
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleScrollToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isScrolling
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-inner'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
              }`}
              title={isScrolling ? 'Kaydırmayı Duraklat' : 'Otomatik Kaydır'}
            >
              {isScrolling ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Durdur
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Kaydır
                </>
              )}
            </button>

            <button
              onClick={handleResetScroll}
              className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Sözleri Başa Al"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Container with Lyrics */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Lyrics display column */}
        <div
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto px-6 pt-8 pb-8 md:px-8 select-text font-sans scroll-smooth"
        >
          {song.lyrics.trim() ? (
            <pre className={`whitespace-pre-wrap font-sans text-slate-200 ${fontSizeClass} transition-all duration-200 select-text font-medium text-center md:text-left md:pl-4 border-l-0 md:border-l border-emerald-500/10`}>
              {song.lyrics}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 italic">
              <Eye className="w-8 h-8 mb-2 text-slate-600" />
              Bu şarkının sözleri henüz eklenmemiş.
            </div>
          )}
        </div>
      </div>

      {/* Müzik Bağlantıları Drawer Sheet */}
      <AnimatePresence>
        {showLinksModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinksModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide-up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[28px] z-50 p-6 flex flex-col shadow-2xl max-h-[75dvh] select-none"
            >
              {/* Pull handle bar */}
              <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mb-4 shrink-0" />

              <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-2 mb-1.5 shrink-0">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                Müzik Bağlantıları
              </h3>
              <p className="text-2xs text-slate-400 leading-normal mb-4 shrink-0">
                Şarkıyı dinlemek için resmi platform adreslerinden birini seçebilirsiniz.
              </p>

              <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                {song.links.map((link) => {
                  const platMeta = PLATFORMS[link.platform];
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold border ${platMeta.color} transition-all shadow-sm active:scale-98`}
                    >
                      <span className="truncate mr-2">{link.label || platMeta.name}</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  );
                })}
              </div>

              <button
                onClick={() => setShowLinksModal(false)}
                className="w-full text-center py-2.5 mt-3 bg-slate-800 hover:bg-slate-750 font-bold text-xs text-slate-300 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Kapat
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Akorlar Drawer Sheet */}
      <AnimatePresence>
        {showChordsModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChordsModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-40 cursor-pointer"
            />

            {/* Slide-up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-[28px] z-50 p-6 flex flex-col shadow-2xl h-[75dvh] max-h-[75dvh]"
            >
              {/* Pull handle bar */}
              <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mb-4 shrink-0" />

              <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-2 mb-3 shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Akorlar
              </h3>

              <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-2xl border border-slate-850/60 select-text font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {song.notes}
              </div>

              <button
                onClick={() => setShowChordsModal(false)}
                className="w-full text-center py-2.5 mt-4 bg-slate-800 hover:bg-slate-750 font-bold text-xs text-slate-300 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Kapat
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
