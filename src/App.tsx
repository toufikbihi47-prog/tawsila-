import React, { useState, useEffect } from 'react';
import { Trip, Language, User } from './types';
import Header from './components/Header';
import RiderDashboard from './components/RiderDashboard';
import DriverDashboard from './components/DriverDashboard';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import InAppCall from './components/InAppCall';
import { getCurrentUser, setCurrentUser as dbSetCurrentUser, getTrips, saveTrips, updateUserRating } from './lib/db';
import { Heart } from 'lucide-react';

const STORAGE_KEYS = {
  CURRENT_TRIP: 'tawseela_current_trip',
  DRIVER_ONLINE: 'tawseela_driver_online',
  LANGUAGE: 'tawseela_language',
};

const translations = {
  ar: { creatorCredit: 'توصيلة - صُمم للسرعة والعملية 🌍' },
  fr: { creatorCredit: 'Tawsila - Conçu pour la rapidité et l\'efficacité 🌍' }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved as Language) || 'ar';
  });

  // Cross-tab Current Trip State for simple MVP
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRIP);
    return saved ? JSON.parse(saved) : null;
  });

  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVER_ONLINE);
    return saved ? saved === 'true' : true;
  });

  const [activeCall, setActiveCall] = useState<{ phone: string; name: string } | null>(null);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === STORAGE_KEYS.CURRENT_TRIP) {
        setCurrentTrip(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === STORAGE_KEYS.DRIVER_ONLINE) {
        setIsDriverOnline(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePersistedTrip = (trip: Trip | null) => {
    setCurrentTrip(trip);
    if (trip) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TRIP, JSON.stringify(trip));
      try {
        const tripsStr = localStorage.getItem('app_trips');
        let trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
        trips = trips.filter(t => t.id !== trip.id);
        trips.push(trip);
        localStorage.setItem('app_trips', JSON.stringify(trips));
      } catch (e) {
        console.error(e);
      }
    } else {
      if (currentTrip && (currentTrip.status === 'pending' || currentTrip.status === 'accepted')) {
        try {
          const tripsStr = localStorage.getItem('app_trips');
          let trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
          trips = trips.map(t => t.id === currentTrip.id ? { ...t, status: 'completed' as const } : t);
          localStorage.setItem('app_trips', JSON.stringify(trips));
        } catch (e) {
          console.error(e);
        }
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TRIP);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const handleToggleDriverOnline = (online: boolean) => {
    if (currentUser?.role !== 'driver' || !currentUser.isActive) return;
    setIsDriverOnline(online);
    localStorage.setItem(STORAGE_KEYS.DRIVER_ONLINE, String(online));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    dbSetCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    dbSetCurrentUser(null);
  };

  const handleRequestRide = (phone: string, name: string, location: string, autoSimulate: boolean) => {
    if (!currentUser) return;
    
    // Find active drivers in the mock database
    const usersStr = localStorage.getItem('app_users');
    let activeDrivers: User[] = [];
    if (usersStr) {
      const users = JSON.parse(usersStr) as User[];
      
      // Determine busy drivers (drivers who have an active and not yet ended trip)
      const busyDriverIds = new Set<string>();
      if (currentTrip && currentTrip.driverId && (currentTrip.status === 'pending' || currentTrip.status === 'accepted')) {
        busyDriverIds.add(currentTrip.driverId);
      }
      
      try {
        const tripsStr = localStorage.getItem('app_trips');
        if (tripsStr) {
          const trips = JSON.parse(tripsStr) as Trip[];
          trips.forEach(t => {
            if (t.driverId && (t.status === 'pending' || t.status === 'accepted')) {
              busyDriverIds.add(t.driverId);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      // Filter out busy drivers
      activeDrivers = users.filter((u) => u.role === 'driver' && u.isActive && !busyDriverIds.has(u.id));
    }

    if (activeDrivers.length === 0) {
      // No active drivers available
      const newTrip: Trip = {
        id: Math.random().toString(36).substring(2, 11),
        riderId: currentUser.id,
        riderPhone: phone || currentUser.phone,
        riderName: name || `${currentUser.firstName} ${currentUser.lastName}`,
        riderLocationDescription: location,
        status: 'rejected',
        createdAt: Date.now()
      };
      updatePersistedTrip(newTrip);
      return;
    }

    // Connect to the closest (first) active driver who is not busy
    const closestDriver = activeDrivers[0];
    
    const newTrip: Trip = {
      id: Math.random().toString(36).substring(2, 11),
      riderId: currentUser.id,
      riderPhone: phone || currentUser.phone,
      riderName: name || `${currentUser.firstName} ${currentUser.lastName}`,
      riderLocationDescription: location,
      status: 'accepted',
      driverId: closestDriver.id,
      driverName: `${closestDriver.firstName} ${closestDriver.lastName}`,
      driverPhone: closestDriver.phone,
      createdAt: Date.now()
    };
    updatePersistedTrip(newTrip);
  };

  const handleCancelRide = () => {
    if (currentTrip) {
      try {
        const tripsStr = localStorage.getItem('app_trips');
        let trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
        trips = trips.map(t => t.id === currentTrip.id ? { ...t, status: 'rejected' as const } : t);
        localStorage.setItem('app_trips', JSON.stringify(trips));
      } catch (e) {
        console.error(e);
      }
    }
    updatePersistedTrip(null);
  };

  const handleAcceptTrip = (tripId: string) => {
    if (!currentTrip || currentTrip.id !== tripId || !currentUser) return;
    updatePersistedTrip({
      ...currentTrip,
      driverId: currentUser.id,
      driverName: `${currentUser.firstName} ${currentUser.lastName}`,
      driverPhone: currentUser.phone,
      status: 'accepted'
    });
  };

  const handleRejectTrip = (tripId: string) => {
    if (!currentTrip || currentTrip.id !== tripId) return;
    updatePersistedTrip({ ...currentTrip, status: 'rejected' });
  };

  const handleCompleteTrip = () => {
    if (currentTrip) {
      updatePersistedTrip({ ...currentTrip, status: 'completed' });
    }
  };

  const handleRateDriver = (driverId: string, rating: number) => {
    updateUserRating(driverId, rating);
  };

  useEffect(() => {
    const handleMockRide = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { riderName, riderPhone, location } = customEvent.detail;
      updatePersistedTrip({
        id: Math.random().toString(36).substring(2, 11),
        riderId: 'mock_rider',
        riderName,
        riderPhone,
        riderLocationDescription: location,
        status: 'pending',
        createdAt: Date.now()
      });
    };
    window.addEventListener('tawseela-mock-ride', handleMockRide);
    return () => window.removeEventListener('tawseela-mock-ride', handleMockRide);
  }, []);

  const renderContent = () => {
    if (!currentUser) {
      return <AuthScreen language={language} onLogin={handleLogin} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminDashboard language={language} />;
    }

    if (currentUser.role === 'driver') {
      if (!currentUser.isActive) {
        return (
          <div className="max-w-md mx-auto mt-20 p-8 bg-white border-4 border-amber-500 rounded-3xl text-center shadow-sm">
            <h2 className="text-2xl font-black text-amber-600 mb-4">
              {language === 'ar' ? 'الحساب قيد المراجعة' : 'Compte en attente'}
            </h2>
            <p className="font-bold text-neutral-600">
              {language === 'ar' ? 'يرجى الانتظار حتى يقوم المسؤول بتفعيل حساب السائق الخاص بك.' : 'Veuillez patienter jusqu\'à ce que l\'administrateur active votre compte chauffeur.'}
            </p>
          </div>
        );
      }
      return (
        <div className="max-w-2xl mx-auto space-y-4">
          <DriverDashboard
            isOnline={isDriverOnline}
            onToggleOnline={handleToggleDriverOnline}
            driverPhone={currentUser.phone}
            onChangeDriverPhone={() => {}}
            driverName={`${currentUser.firstName} ${currentUser.lastName}`}
            onChangeDriverName={() => {}}
            pendingTrip={currentTrip && currentTrip.status === 'pending' ? currentTrip : null}
            activeTrip={currentTrip && currentTrip.status === 'accepted' ? currentTrip : null}
            onAcceptTrip={handleAcceptTrip}
            onRejectTrip={handleRejectTrip}
            onCompleteTrip={handleCompleteTrip}
            onTriggerCall={(phone, name) => setActiveCall({ phone, name })}
            language={language}
          />
        </div>
      );
    }

    // Default: rider
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <RiderDashboard
          currentTrip={currentTrip}
          onRequestRide={handleRequestRide}
          onCancelRide={handleCancelRide}
          onTriggerCall={(phone, name) => setActiveCall({ phone, name })}
          onRateDriver={handleRateDriver}
          language={language}
        />
      </div>
    );
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-amber-200">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={handleLanguageChange}
        isSimulatingNetwork={false}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t-2 border-neutral-200 py-6 text-center text-xs font-bold text-neutral-500">
        <p className="flex items-center justify-center gap-1">
          <span>{t.creatorCredit}</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
        </p>
      </footer>

      {activeCall && (
        <InAppCall
          phoneNumber={activeCall.phone}
          calleeName={activeCall.name}
          role={currentUser?.role === 'driver' ? 'driver' : 'rider'}
          onEndCall={() => setActiveCall(null)}
          language={language}
        />
      )}
    </div>
  );
}
