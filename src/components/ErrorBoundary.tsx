import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last line of defense: the app previously had no error boundary anywhere,
 * so any unexpected render error (bad imported data, a future regression,
 * etc.) turned into a permanent blank screen with no way to recover except
 * manually clearing browser/app storage and losing the whole song archive.
 * This gives the user a real screen with a way out instead.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Şarkı Sözlerim - yakalanmamış hata:', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  handleResetData = () => {
    if (
      window.confirm(
        'Tüm şarkı arşiviniz cihazdan silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?'
      )
    ) {
      localStorage.removeItem('music_archive_songs');
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[100dvh] bg-[#070b13] text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-base font-bold text-slate-100">Bir şeyler ters gitti</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uygulama beklenmeyen bir hatayla karşılaştı. Şarkı arşiviniz güvende; aşağıdan tekrar
              deneyebilir veya sorun devam ederse arşivi sıfırlayabilirsiniz.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Tekrar Dene
              </button>
              <button
                onClick={this.handleResetData}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-rose-400 font-bold bg-slate-950 hover:bg-slate-850 border border-rose-900/40 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Arşivi Sıfırla
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
