import React from 'react';
import { Zap, Languages, LogOut, Car, MapPin } from 'lucide-react';
import { Language, User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSimulatingNetwork: boolean;
}

const translations = {
  ar: {
    brandName: 'توصيلة',
    tagline: 'طريقك .. أسهل',
    becharNetwork: 'الشبكة نشطة',
    networkSlow: 'إنترنت ضعيف/محدود',
    mvpBadge: 'نسخة تجريبية مبسطة',
    explanation: 'ربط مباشر وموثوق بضغطة واحدة دون تعقيدات الخرائط',
    logout: 'خروج'
  },
  fr: {
    brandName: 'Tawsila',
    tagline: 'Votre route plus facile',
    becharNetwork: 'Réseau Actif',
    networkSlow: 'Réseau Faible',
    mvpBadge: 'Version MVP',
    explanation: 'Match direct rapide et numéro de téléphone direct sans cartes',
    logout: 'Déconnexion'
  }
};

export default function Header({ currentUser, onLogout, language, onLanguageChange, isSimulatingNetwork }: HeaderProps) {
  const t = translations[language];

  return (
    <header className="bg-transparent z-40 pt-4">
      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col items-center justify-center gap-6">
        {/* Brand logo */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center z-10">
            <img 
              src="/logo.png" 
              alt="توصيلة Logo" 
              className="w-full h-full object-contain drop-shadow-sm scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-slate-900', 'rounded-3xl', 'border-4', 'border-amber-500', 'w-24', 'h-24', 'shadow-sm');
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<span class="text-amber-500 font-black text-3xl">تو</span>';
                }
              }}
            />
          </div>
          <div className="-mt-2 z-20 text-center">
            <h1 id="app-brand-name" className="text-4xl font-black text-slate-900 tracking-tight">
               {language === 'ar' ? (
                 <>توصيلة</>
               ) : (
                 <>Taw<span className="text-amber-500">s</span>ila</>
               )}
            </h1>
            <p className="font-bold text-slate-500 text-sm mt-1">{isSimulatingNetwork ? t.networkSlow : t.becharNetwork}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="text-sm text-right">
                <span className="block font-black text-slate-900 leading-none">{currentUser.firstName} {currentUser.lastName}</span>
                <span className="text-xs uppercase font-bold text-slate-500">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-xl transition-colors"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => onLanguageChange(language === 'ar' ? 'fr' : 'ar')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-black rounded-2xl border-4 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 transition-transform active:scale-95 shadow-[0_4px_0_0_#0f172a]"
          >
            <Languages className="w-5 h-5 text-amber-500" />
            <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
