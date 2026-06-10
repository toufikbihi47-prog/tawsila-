import React, { useState, useEffect } from 'react';
import { Phone, Navigation, Shield, User, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Language, TripStatus } from '../types';

interface RiderDashboardProps {
  currentTrip: Trip | null;
  onRequestRide: (riderPhone: string, riderName: string, location: string, autoSimulate: boolean) => void;
  onCancelRide: () => void;
  onTriggerCall: (phone: string, name: string) => void;
  onRateDriver: (driverId: string, rating: number) => void;
  language: Language;
}

const translations = {
  ar: {
    welcome: 'مرحباً بك في توصيلة',
    setupTitle: 'بيانات الراكب الأساسية (لتسهيل الاتصال)',
    nameLabel: 'اسم الراكب (ثنائي أو لقب):',
    phoneLabel: 'رقم الهاتف:',
    placeholderName: 'محمد أمين',
    requestBtn: 'إبحث عن سائق',
    requestBtnActive: 'جاري البحث عن سائق...',
    cancelBtn: 'إلغاء الطلب',
    statusSearching: 'جاري البحث عن أقرب سائق متصل...',
    statusPending: 'تم العثور على سائق! بانتظار قبوله للرحلة...',
    statusAccepted: 'تم قبول طلبك بنجاح! اتصل بالسائق فوراً:',
    statusRejected: 'تم رفض الطلب أو السائق مشغول حالياً. حاول مجدداً.',
    driverPhoneLabel: 'رقم هاتف السائق:',
    driverNameLabel: 'اسم السائق الموجه لك:',
    callDriverBtn: 'اتصال مباشر بالسائق 📞',
    onlineNotice: 'بدون خرائط ثقيلة • استهلاك منخفض للإنترنت • سهل القراءة',
    driverSimToggle: 'تفعيل محاكاة قبول السائق تلقائياً (للمعاينة الفردية)',
    driverSimActive: 'محاكي السائق نشط - سيتم الرد خلال ثوانٍ',
    driverSimInactive: 'سيتعين على سائق حقيقي قراءة وقبول طلبك',
    retryBtn: 'تفقد وتجربة سائق آخر',
    tripCompleted: 'اكتملت الرحلة',
    rateDriver: 'قيم السائق',
    submitRating: 'تأكيد التقييم',
    ratingSuccess: 'شكراً لتقييمك!'
  },
  fr: {
    welcome: 'Bienvenue sur Tawsila',
    setupTitle: 'Informations Passager (Requis pour l\'appel)',
    nameLabel: 'Nom du passager:',
    phoneLabel: 'Numéro de téléphone:',
    placeholderName: 'Mohamed Amine',
    requestBtn: 'Chercher un chauffeur',
    requestBtnActive: 'Recherche en cours...',
    cancelBtn: 'Annuler la demande',
    statusSearching: 'Recherche du chauffeur le plus proche...',
    statusPending: 'Chauffeur trouvé ! Attente de sa confirmation...',
    statusAccepted: 'Demande acceptée ! Appelez le chauffeur immédiatement:',
    statusRejected: 'Chauffeur occupé ou à décliné. Réessayez.',
    driverPhoneLabel: 'Téléphone du chauffeur:',
    driverNameLabel: 'Nom du chauffeur:',
    callDriverBtn: 'Appeler le chauffeur 📞',
    onlineNotice: 'Pas de cartes • Faible consommation de données • Facile à lire',
    driverSimToggle: 'Activer la simulation chauffeur automatique',
    driverSimActive: 'Simulateur Actif - Acceptation en 3s',
    driverSimInactive: 'Un vrai chauffeur doit accepter votre demande',
    retryBtn: 'Essayer un autre chauffeur',
    tripCompleted: 'Course Terminée',
    rateDriver: 'Évaluer le chauffeur',
    submitRating: 'Soumettre l\'évaluation',
    ratingSuccess: 'Merci pour votre évaluation !'
  }
};

export default function RiderDashboard({ currentTrip, onRequestRide, onCancelRide, onTriggerCall, onRateDriver, language }: RiderDashboardProps) {
  const t = translations[language];

  // Form states, prepopulated for immediate Algerian MVP feel
  const [riderName, setRiderName] = useState('أبو بكر');
  const [riderPhone, setRiderPhone] = useState('0661559988');
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (currentTrip?.status === 'completed') {
      setHasRated(false);
      setRating(0);
    }
  }, [currentTrip?.status]);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderPhone.trim()) return;
    onRequestRide(riderPhone, riderName || 'راغب في التوصيل', 'موقع الراكب المباشر', autoSimulate);
  };

  const handleRate = () => {
    if (rating > 0 && currentTrip?.driverId) {
      onRateDriver(currentTrip.driverId, rating);
      setHasRated(true);
      setTimeout(() => {
        onCancelRide(); // clears trip
      }, 2000);
    }
  };

  const isRiderIdle = !currentTrip || currentTrip.status === 'idle';

  return (
    <div id="rider-dashboard-container" className="bg-white min-h-[500px] rounded-3xl border-4 border-slate-900 overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-slate-100 border-b-4 border-slate-900 p-6">
        <h3 id="rider-welcome-heading" className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <span>{t.welcome}</span>
        </h3>
        <p className="text-sm font-bold text-slate-800 mt-2">{t.onlineNotice}</p>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* IDLE VIEW: Input details and Request Button */}
          {isRiderIdle && (
            <motion.div
              key="rider-idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center space-y-12 py-8"
            >
              {/* Huge Request Button */}
              <button
                id="request-ride-btn"
                type="button"
                onClick={handleRequest}
                className="w-64 h-64 mx-auto bg-slate-900 active:bg-slate-800 text-amber-500 rounded-full text-2xl font-extrabold uppercase shadow-[0_8px_0_0_#0f172a] active:translate-y-2 active:shadow-none flex flex-col items-center justify-center gap-4 border-4 border-black transition-transform"
              >
                <Navigation className="w-16 h-16 pointer-events-none" />
                <span className="pointer-events-none">{t.requestBtn}</span>
              </button>

              {/* Minimal Config (Phone) */}
              <div className="w-full bg-white p-5 rounded-3xl border-4 border-slate-900 shadow-sm space-y-4">
                <div className="flex gap-3">
                  <input
                    type="tel"
                    id="input-rider-phone"
                    className="flex-1 font-mono text-xl font-black tracking-wider bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 focus:outline-slate-900 focus:border-slate-900 text-center text-slate-950"
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE TRIP STATES (Searching, Pending, Accepted, Rejected) */}
          {!isRiderIdle && currentTrip && (
            <motion.div
              key="rider-active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6 space-y-6"
            >
              {/* Trip status header badge */}
              <div className="inline-block px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider bg-slate-900 text-amber-500 shadow-sm">
                {currentTrip.status === 'searching' && t.statusSearching}
                {currentTrip.status === 'pending' && t.statusPending}
                {currentTrip.status === 'accepted' && t.statusAccepted}
                {currentTrip.status === 'rejected' && t.statusRejected}
              </div>

              {/* Huge pulsating request visualization during search */}
              {(currentTrip.status === 'searching' || currentTrip.status === 'pending') && (
                <div className="relative flex items-center justify-center my-10">
                  <motion.div
                    animate={{ scale: [1, 2.5, 1], opacity: [0.15, 0, 0.15] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="absolute w-24 h-24 rounded-full bg-slate-700"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute w-24 h-24 rounded-full bg-slate-600"
                  />
                  <div className="w-24 h-24 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center font-bold text-lg border-4 border-black z-10">
                    <Navigation className="w-8 h-8 animate-bounce text-amber-500" />
                  </div>
                </div>
              )}

              {/* ACCEPTED STATE: Huge Direct Phone numbers */}
              {currentTrip.status === 'accepted' && (
                <div className="space-y-5 my-4">
                  <div className="bg-slate-50 border-4 border-slate-900 p-5 rounded-2xl text-slate-950 space-y-4 shadow-sm">
                    {/* Driver Card Info */}
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center font-extrabold text-2xl border-2 border-black">
                        أ
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">{t.driverNameLabel}</span>
                        <div className="flex items-center gap-2">
                          <span id="matched-driver-name" className="text-lg font-black">{currentTrip.driverName || 'سائق توصيلة'}</span>
                          {/* If we had driver rating here we'd show it, but currentTrip only has driverName/Phone */}
                        </div>
                      </div>
                    </div>

                    {/* Driver direct phone number row */}
                    <div className="bg-white p-3.5 rounded-xl border-2 border-slate-900 flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-neutral-400 block tracking-wider uppercase">{t.driverPhoneLabel}</span>
                        <span id="matched-driver-phone" className="font-mono text-xl tracking-widest font-black text-black">
                          {currentTrip.driverPhone}
                        </span>
                      </div>
                      <span className="text-amber-700 text-xs font-bold bg-amber-100/50 border border-amber-200 px-2 py-0.5 rounded">
                        {language === 'ar' ? 'متصل الآن' : 'En ligne'}
                      </span>
                    </div>
                  </div>

                  {/* Immediate Dial Action button */}
                  <a
                    id="rider-call-driver-btn"
                    href={`tel:${currentTrip.driverPhone || '0661223344'}`}
                    className="w-full py-6 bg-slate-900 active:bg-slate-800 text-amber-500 font-extrabold uppercase text-2xl rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-97 border-4 border-slate-900 hover:bg-slate-800 hover:text-white"
                  >
                    <Phone className="w-6 h-6 animate-pulse" />
                    <span>{t.callDriverBtn}</span>
                  </a>
                </div>
              )}

              {/* REJECTED STATE: Retry button */}
              {currentTrip.status === 'rejected' && (
                <div className="bg-red-50 border-2 border-red-300 p-5 rounded-2xl space-y-4 my-2">
                  <div className="flex justify-center text-red-600">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                  <p className="text-sm font-bold text-red-900">{t.statusRejected}</p>
                  <button
                    id="rider-retry-search-btn"
                    onClick={onCancelRide}
                    className="w-full py-3 bg-neutral-900 text-white font-extrabold uppercase rounded-xl text-sm transition-colors hover:bg-neutral-800"
                  >
                    {t.retryBtn}
                  </button>
                </div>
              )}

              {/* Details of request description */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 text-right shadow-sm">
                <div className="flex justify-between items-center text-[11px] text-slate-700/60 font-mono font-bold">
                  <span>TRIP ID: {currentTrip.id.substring(0, 10).toUpperCase()}</span>
                  <span>STATUS: {currentTrip.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Cancel Button */}
              {currentTrip.status !== 'accepted' && currentTrip.status !== 'rejected' && currentTrip.status !== 'completed' && (
                <button
                  id="cancel-ride-btn"
                  onClick={onCancelRide}
                  className="w-full py-4 border-4 border-slate-300 bg-white text-slate-900 font-extrabold uppercase rounded-2xl text-lg hover:text-red-700 hover:border-red-500 hover:bg-red-50 transition-all active:scale-95"
                >
                  {t.cancelBtn}
                </button>
              )}

              {/* COMPLETED STATE: Rating UI */}
              {currentTrip.status === 'completed' && (
                <div className="bg-amber-50 border-4 border-amber-400 p-6 rounded-3xl mt-4 text-center space-y-6">
                  <h4 className="text-2xl font-black text-slate-900">{t.tripCompleted} 🎉</h4>
                  
                  {hasRated ? (
                    <div className="text-emerald-600 font-bold text-xl py-4 flex flex-col items-center gap-3">
                      <Shield className="w-12 h-12" />
                      {t.ratingSuccess}
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 font-bold">{t.rateDriver}</p>
                      <div className="flex justify-center gap-2 my-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`w-12 h-12 flex items-center justify-center text-3xl transition-transform ${
                              rating >= star ? 'scale-110 text-amber-500' : 'text-slate-300 hover:scale-110'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleRate}
                        disabled={rating === 0}
                        className={`w-full py-4 text-white font-extrabold uppercase rounded-2xl text-xl transition-all ${
                          rating > 0 
                            ? 'bg-slate-900 shadow-md transform hover:-translate-y-1' 
                            : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {t.submitRating}
                      </button>

                      <button
                        onClick={onCancelRide}
                        className="w-full py-2 text-slate-500 font-bold hover:text-slate-900"
                      >
                        تخطي
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info Box */}
      <div className="bg-slate-100 px-6 py-5 border-t-4 border-slate-900 flex items-center justify-between text-sm text-slate-900 font-black uppercase tracking-wider">
        <span>📍 متوفر في منطقتك</span>
        <span>بساطة • أمان • وضوح ألوان</span>
      </div>
    </div>
  );
}
