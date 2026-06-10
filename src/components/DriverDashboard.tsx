import React, { useState, useEffect } from 'react';
import { ToggleRight, ToggleLeft, Phone, MapPin, User, Check, X, ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, Language, Driver } from '../types';

interface DriverDashboardProps {
  isOnline: boolean;
  onToggleOnline: (online: boolean) => void;
  driverPhone: string;
  onChangeDriverPhone: (phone: string) => void;
  driverName: string;
  onChangeDriverName: (name: string) => void;
  pendingTrip: Trip | null;
  activeTrip: Trip | null;
  onAcceptTrip: (tripId: string) => void;
  onRejectTrip: (tripId: string) => void;
  onCompleteTrip: () => void;
  onTriggerCall: (phone: string, name: string) => void;
  language: Language;
}

const translations = {
  ar: {
    title: 'لوحة تحكم السائق 🚗',
    statusOnline: 'أنت متصل الآن • تنتظر الركاب',
    statusOffline: 'أنت غير متصل • لن تتلقى طلبات',
    turnOnline: 'تشغيل الاتصال (متصل)',
    turnOffline: 'إيقاف الاتصال (غير متصل)',
    setupTitle: 'بيانات السائق (تظهر للراكب عند القبول)',
    nameLabel: 'اسم السائق:',
    phoneLabel: 'رقم هاتف السائق:',
    newTripAlert: '⚠️ طلب رحلة وارد الآن!',
    incomingFrom: 'راكب طالب من المنطقة:',
    riderPhoneLabel: 'رقم هاتف الراكب:',
    riderNameLabel: 'اسم الراكب:',
    acceptBtn: 'قبول وتوصيل ✔️',
    rejectBtn: 'رفض الطلب ✖️',
    activeTripHeading: 'الرحلة الحالية قيد التوصيل',
    riderCallBtn: 'اتصال مباشر بالراكب 📞',
    riderLocation: 'مكان التقاء الراكب:',
    completeTripBtn: 'تم التوصيل بنجاح (إنهاء) 🎉',
    simulatorsTitle: 'توليد ركاب وهميين تلقائياً (للمعاينة والتجربة)',
    simulatorsDesc: 'محاكاة طلب جديد بعد 10 ثوانٍ تلقائياً إذا كنت متصلاً',
    placeholderDriverName: 'السائق أحمد'
  },
  fr: {
    title: 'Tableau de bord Chauffeur 🚗',
    statusOnline: 'Vous êtes EN LIGNE • En attente de passagers',
    statusOffline: 'Vous êtes HORS LIGNE • Aucun appel visible',
    turnOnline: 'Se connecter',
    turnOffline: 'Se déconnecter',
    setupTitle: 'Identité Chauffeur (Visible pour le client)',
    nameLabel: 'Nom du chauffeur:',
    phoneLabel: 'Téléphone du chauffeur:',
    newTripAlert: '⚠️ Nouvelle demande de course !',
    incomingFrom: 'Passager situé à :',
    riderPhoneLabel: 'Téléphone du passager:',
    riderNameLabel: 'Nom du passager:',
    acceptBtn: 'Accepter de livrer ✔',
    rejectBtn: 'Refuser ✖',
    activeTripHeading: 'Course en cours de transport',
    riderCallBtn: 'Appeler le passager 📞',
    riderLocation: 'Lieu de rendez-vous :',
    completeTripBtn: 'Course Terminée 🎉',
    simulatorsTitle: 'Générer des passagers factices (Démo)',
    simulatorsDesc: 'Génère une demande automatique après 10s si En Ligne',
    placeholderDriverName: 'Chauffeur Ahmed'
  }
};

const MOCK_PASSENGERS_POOL = [
  { name: 'ياسين بن سعيد', phone: '0655331122', location: 'حي السلام - أمام المسجد الكبير 🕌' },
  { name: 'كريمة', phone: '0740998877', location: 'بلاص وسط المدينة - قرب البنك المركزي 🏦' },
  { name: 'الحاج بلقاسم', phone: '0662445566', location: 'طريق محطة الحافلات - أمام السوق 🛒' },
  { name: 'عمر', phone: '0550112233', location: 'المستشفى المركزي - عند مدخل الاستعجالات 🚑' },
  { name: 'فاطمة الزهراء', phone: '0663778899', location: 'الجامعة - البوابة الرئيسية 🎓' }
];

export default function DriverDashboard({
  isOnline,
  onToggleOnline,
  driverPhone,
  onChangeDriverPhone,
  driverName,
  onChangeDriverName,
  pendingTrip,
  activeTrip,
  onAcceptTrip,
  onRejectTrip,
  onCompleteTrip,
  onTriggerCall,
  language
}: DriverDashboardProps) {
  const t = translations[language];

  // Simulator config: driver automatically receives simulated requests when online
  const [autoSimulateRiders, setAutoSimulateRiders] = useState(true);

  // Set default values if empty
  useEffect(() => {
    if (!driverName) onChangeDriverName('عمي أحمد');
    if (!driverPhone) onChangeDriverPhone('0655332211');
  }, []);

  // Simulator timer effect: generates a new simulated ride request if Online and Idle
  useEffect(() => {
    if (!autoSimulateRiders || !isOnline || pendingTrip || activeTrip) return;

    const timer = setTimeout(() => {
      // Pick a random mock passenger
      const index = Math.floor(Math.random() * MOCK_PASSENGERS_POOL.length);
      const randomRider = MOCK_PASSENGERS_POOL[index];

      // Add it as a pending trip globally using standard react trigger of local event
      // We will trigger a mock custom event or run a simulation callback.
      // E.g., Dispatch a custom event to the parent container
      const event = new CustomEvent('tawseela-mock-ride', {
        detail: {
          riderName: randomRider.name,
          riderPhone: randomRider.phone,
          location: randomRider.location
        }
      });
      window.dispatchEvent(event);
    }, 4000); // reduced from 8s to 4s for faster demo

    return () => clearTimeout(timer);
  }, [autoSimulateRiders, isOnline, pendingTrip, activeTrip]);

  return (
    <div id="driver-dashboard-container" className="bg-white min-h-[500px] rounded-3xl border-4 border-slate-900 overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Top Banner and State Indicator */}
      <div className={`p-6 transition-colors duration-300 border-b-4 border-slate-900 ${
        isOnline ? 'bg-slate-100 text-slate-950' : 'bg-neutral-100 text-neutral-900'
      }`}>
        <h3 id="driver-dashboard-heading" className="text-xl font-extrabold flex items-center justify-between">
          <span>{t.title}</span>
          <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full font-mono uppercase">
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </h3>
        <p className="text-xs font-semibold mt-1 opacity-80">
          {isOnline ? t.statusOnline : t.statusOffline}
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* OFFLINE AND IDLE VIEW: Driver Configuration and Online Switcher */}
          {!activeTrip && !pendingTrip && (
            <motion.div
              key="driver-config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center space-y-12 py-8"
            >
              {/* Massive Toggle Button */}
              <button
                id="toggle-online-btn"
                onClick={() => onToggleOnline(!isOnline)}
                className={`w-64 h-64 mx-auto rounded-full text-2xl font-extrabold uppercase shadow-[0_8px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none flex flex-col items-center justify-center gap-4 border-4 border-black transition-transform ${
                  isOnline
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-900 text-amber-500 animate-[pulse_2s_ease-in-out_infinite]'
                }`}
              >
                {isOnline ? (
                   <>
                     <X className="w-16 h-16 pointer-events-none" />
                     <span className="pointer-events-none">{language === 'ar' ? 'إيقاف' : 'Arrêter'}</span>
                   </>
                ) : (
                   <>
                     <Check className="w-16 h-16 pointer-events-none" />
                     <span className="pointer-events-none">{language === 'ar' ? 'متاح الآن' : 'Disponible'}</span>
                   </>
                )}
              </button>
            </motion.div>
          )}

          {/* INCOMING REQUEST CARD: PENDING STATE */}
          {pendingTrip && !activeTrip && (
            <motion.div
              key="pending-request"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-50 border-4 border-slate-900 p-6 rounded-3xl shadow-sm space-y-6 text-center"
            >
              <div className="animate-pulse inline-block bg-slate-900 text-amber-500 font-black text-sm px-6 py-2 rounded-full">
                {t.newTripAlert}
              </div>

              {/* Location Card block */}
              <div className="bg-white p-5 rounded-2xl border-4 border-slate-200 text-right space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <span>{t.riderPhoneLabel}</span>
                  </span>
                  <span id="pending-rider-name" className="font-mono text-slate-900 text-lg font-black">
                    {pendingTrip.riderPhone}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3.5 pt-2">
                <button
                  id="driver-accept-btn"
                  onClick={() => onAcceptTrip(pendingTrip.id)}
                  className="py-5 bg-amber-500 active:bg-amber-600 text-slate-900 font-extrabold uppercase rounded-2xl text-2xl flex items-center justify-center gap-3 border-4 border-slate-900 transition-transform active:scale-95"
                >
                  <Check className="w-8 h-8" />
                  <span>{t.acceptBtn}</span>
                </button>
                <button
                  id="driver-reject-btn"
                  onClick={() => onRejectTrip(pendingTrip.id)}
                  className="py-5 bg-red-600 active:bg-red-800 text-white font-extrabold uppercase rounded-2xl text-2xl flex items-center justify-center gap-3 border-4 border-slate-900 transition-transform active:scale-95"
                >
                  <X className="w-8 h-8" />
                  <span>{t.rejectBtn}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE TRIP CARD: ACCEPTED STATE */}
          {activeTrip && (
            <motion.div
              key="active-trip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-5"
            >
              <div className="bg-slate-50 border-4 border-slate-900 p-5 rounded-2xl text-slate-950 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <span className="text-sm font-extrabold text-slate-800">
                    {t.activeTripHeading}
                  </span>
                  <span className="text-xs bg-slate-900 text-amber-500 px-3 py-1 rounded font-bold uppercase tracking-wider">
                    CONNECTED
                  </span>
                </div>

                {/* Rider contact block */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center font-extrabold text-2xl border-2 border-slate-900">
                    ر
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">{t.riderPhoneLabel}</span>
                    <span id="active-rider-name" className="text-lg font-black">{activeTrip.riderPhone}</span>
                  </div>
                </div>

                {/* Direct rider phone display */}
                <div className="bg-white p-3.5 rounded-xl border-2 border-slate-900 flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-[10px] font-black text-neutral-400 block tracking-wider uppercase">{t.riderPhoneLabel}</span>
                    <span id="active-rider-phone" className="font-mono text-xl tracking-widest font-black text-black">
                      {activeTrip.riderPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION: Call Passenger Button */}
              <a
                id="driver-call-rider-btn"
                href={`tel:${activeTrip.riderPhone}`}
                className="w-full py-6 bg-slate-900 active:bg-slate-800 text-amber-500 font-extrabold uppercase text-2xl rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-97 border-4 border-slate-900 hover:bg-slate-800 hover:text-white"
              >
                <Phone className="w-6 h-6 animate-pulse" />
                <span>{t.riderCallBtn}</span>
              </a>

              {/* ACTION: Complete Ride Button */}
              <button
                id="driver-complete-ride-btn"
                onClick={onCompleteTrip}
                className="w-full py-4 bg-neutral-900 active:bg-neutral-800 text-white font-extrabold uppercase text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-97 border-2 border-slate-900"
              >
                <span>{t.completeTripBtn}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CONTROLS ONLINE / OFFLINE BAR */}
      <div className="bg-slate-100 px-6 py-5 border-t-4 border-slate-900 flex items-center justify-between text-sm font-black uppercase text-slate-900 tracking-wider">
        <span>📍 تطبيق توصيلة</span>
        <span className="flex items-center gap-2">
          <Check className="w-6 h-6 text-amber-600" />
          {isOnline ? (language === 'ar' ? 'البحث عن ركاب...' : 'Recherche rando...') : (language === 'ar' ? 'متوقف مؤقتاً' : 'En pause')}
        </span>
      </div>
    </div>
  );
}
