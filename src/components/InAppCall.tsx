import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, User, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';

interface InAppCallProps {
  phoneNumber: string;
  calleeName: string;
  role: 'rider' | 'driver';
  onEndCall: () => void;
  language: Language;
}

const translations = {
  ar: {
    calling: 'جاري الاتصال...',
    connected: 'مكالمة نشطة',
    ending: 'جاري إنهاء المكالمة...',
    rider: 'راكب',
    driver: 'سائق',
    unmute: 'كتم',
    muted: 'مكتوم',
    speaker: 'مكبر الصوت',
    endCall: 'إنهاء المكالمة',
    secure: 'اتصال مباشر وسريع'
  },
  fr: {
    calling: 'Appel en cours...',
    connected: 'Appel en cours',
    ending: 'Fin de l\'appel...',
    rider: 'Passager',
    driver: 'Chauffeur',
    unmute: 'Muet',
    muted: 'Sourdine',
    speaker: 'Haut-parleur',
    endCall: 'Raccrocher',
    secure: 'Connexion directe et rapide'
  }
};

export default function InAppCall({ phoneNumber, calleeName, role, onEndCall, language }: InAppCallProps) {
  const [copied, setCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const t = translations[language];

  // Copy number helper
  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Simulate ringtone for 2.5 seconds, then connect
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2500);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="in-app-call-overlay" className="fixed inset-0 bg-neutral-900 text-white z-50 flex flex-col justify-between p-6 md:p-10 font-sans select-none">
      {/* Top Status */}
      <div className="text-center pt-8">
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono tracking-wider mb-2 text-emerald-400">
          TAWSILA CALLING SYSTEM
        </span>
        <h2 className="text-3xl font-bold tracking-tight mt-4 break-words px-4">
          {calleeName || (role === 'rider' ? 'السائق متاح' : 'الراكب طالب')}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="font-mono text-xl tracking-widest text-neutral-300">
            {phoneNumber}
          </p>
          <button 
            id="copy-phone-btn"
            onClick={handleCopy} 
            className="text-xs bg-white/20 active:bg-white/40 px-2 py-0.5 rounded transition-all text-neutral-300 font-sans"
          >
            {copied ? (language === 'ar' ? 'تم النسخ!' : 'Copié!') : (language === 'ar' ? 'نسخ' : 'Copier')}
          </button>
        </div>
        <div className="text-sm font-medium text-neutral-400 mt-4 h-6">
          {isConnected ? (
            <span className="text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              {t.connected} ({formatDuration(callDuration)})
            </span>
          ) : (
            <span className="text-neutral-400 animate-pulse">{t.calling}</span>
          )}
        </div>
      </div>

      {/* Pulsing Center Avatar & Animated Rings */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          {/* Wave circles */}
          {!isMuted && (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute w-28 h-28 rounded-full border-2 border-amber-500/30"
              />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.6 }}
                className="absolute w-28 h-28 rounded-full border-2 border-amber-500/40"
              />
            </>
          )}

          <div className="w-28 h-28 rounded-full bg-neutral-800 border-4 border-amber-500 flex items-center justify-center z-10">
            <User className="w-14 h-14 text-amber-500" />
          </div>
        </div>

        {/* Local dial instructions for network-less scenarios */}
        <p className="text-sm font-bold text-neutral-300 text-center max-w-xs mt-12 bg-neutral-800 p-4 rounded-xl border-2 border-neutral-600">
          {t.secure}
        </p>
      </div>

      {/* Dial Controls & Hang up */}
      <div className="pb-10 flex flex-col items-center gap-8">
        <div className="flex justify-center gap-8">
          {/* Mute Button */}
          <button
            id="toggle-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border transition-all ${
              isMuted 
                ? 'bg-red-500/20 text-red-400 border-red-500' 
                : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            id="toggle-speaker-btn"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border transition-all ${
              isSpeaker 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
            }`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Hang Up Button */}
        <button
          id="hang-up-btn"
          onClick={onEndCall}
          className="w-72 py-4 bg-red-600 active:bg-red-700 rounded-full flex items-center justify-center gap-3 font-semibold text-lg hover:shadow-lg transition-transform active:scale-95 text-white btn-high-contrast"
        >
          <PhoneOff className="w-5 h-5" />
          <span>{t.endCall}</span>
        </button>
      </div>
    </div>
  );
}
