import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Trash2, User } from 'lucide-react';
import { UserProfile } from '../types';
import { resizeImageToAvatar, getInitials } from '../utils/profile';

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [photo, setPhoto] = useState<string | null>(profile.photo);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const resized = await resizeImageToAvatar(file);
      setPhoto(resized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fotoğraf işlenemedi.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave({ name: name.trim(), photo });
    onClose();
  };

  const initials = getInitials(name);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
          <User className="w-4 h-4 text-emerald-400" />
          Profilim
        </h3>
        <p className="text-2xs text-slate-400 leading-normal mb-5">
          İsminizi ve fotoğrafınızı ekleyin, uygulama sizin için kişiselleşsin. Bu bilgiler yalnızca bu cihazda saklanır.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoPick}
          accept="image/*"
          className="hidden"
        />

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
                ) : initials ? (
                  <span className="text-2xl font-display font-bold text-emerald-400">{initials}</span>
                ) : (
                  <User className="w-9 h-9 text-slate-600" />
                )}
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg transition-all cursor-pointer disabled:opacity-60"
              title="Fotoğraf seç"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          {photo && (
            <button
              onClick={() => setPhoto(null)}
              className="mt-3 flex items-center gap-1 text-2xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Fotoğrafı Kaldır
            </button>
          )}
          {error && <p className="mt-2 text-2xs text-rose-400 text-center">{error}</p>}
        </div>

        <label className="text-2xs font-semibold text-slate-400 mb-1.5 block">İsim</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adınızı girin"
          maxLength={40}
          className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500/50 outline-none text-sm text-slate-100 placeholder:text-slate-600 mb-6 transition-colors"
        />

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 text-center py-2.5 bg-slate-800 hover:bg-slate-750 font-bold text-xs text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="flex-1 text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 font-bold text-xs text-slate-950 rounded-xl transition-all cursor-pointer"
          >
            Kaydet
          </button>
        </div>
      </motion.div>
    </>
  );
}
