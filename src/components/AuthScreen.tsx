import React, { useState } from 'react';
import { User, Language } from '../types';
import { getUsers, saveUsers, setCurrentUser } from '../lib/db';
import { LogIn, UserPlus, Car, User as UserIcon } from 'lucide-react';

interface AuthScreenProps {
  language: Language;
  onLogin: (user: User) => void;
}

const translations = {
  ar: {
    loginTitle: 'تسجيل الدخول',
    registerTitle: 'حساب جديد',
    firstName: 'الاسم',
    lastName: 'اللقب',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    submit: 'دخول',
    toggleRegister: 'ليس لديك حساب؟ إنشاء حساب',
    toggleLogin: 'لديك حساب؟ تسجيل الدخول',
    adminNotice: 'للدخول كمسؤول، استخدم admin@tawsila.com',
    riderRole: 'راكب',
    driverRole: 'سائق',
    selectRole: 'اختر نوع الحساب'
  },
  fr: {
    loginTitle: 'Connexion',
    registerTitle: 'Créer un compte',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    submit: 'Entrer',
    toggleRegister: 'Pas de compte ? Créer un compte',
    toggleLogin: 'Déjà un compte ? Connexion',
    adminNotice: 'Pour vous connecter en tant qu\'admin, utilisez admin@tawsila.com',
    riderRole: 'Passager',
    driverRole: 'Chauffeur',
    selectRole: 'Choisissez votre compte'
  }
};

export default function AuthScreen({ language, onLogin }: AuthScreenProps) {
  const t = translations[language];
  const [isRegister, setIsRegister] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'rider' | 'driver'>('rider');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    
    // Check if user exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      setCurrentUser(existingUser);
      onLogin(existingUser);
    } else {
      if (!isRegister) {
        alert(language === 'ar' ? 'المستخدم غير موجود. الرجاء التسجيل.' : 'Utilisateur non trouvé. Veuillez vous inscrire.');
        return;
      }

      const role = email.toLowerCase() === 'admin@tawsila.com' ? 'admin' : selectedRole;

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive: role === 'admin' ? true : (role === 'rider' ? true : false) // Drivers need activation, Riders active by default
      };

      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border-4 border-slate-900 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-3">
          {isRegister ? <UserPlus className="w-6 h-6 text-amber-500" /> : <LogIn className="w-6 h-6 text-amber-500" />}
          {isRegister ? t.registerTitle : t.loginTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="mb-6 space-y-3">
              <label className="block text-sm font-black text-slate-900 text-center mb-2">{t.selectRole}</label>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('rider')}
                  className={`flex items-center justify-center gap-4 p-4 rounded-2xl border-4 transition-all ${
                    selectedRole === 'rider' 
                      ? 'bg-amber-400 border-slate-900 shadow-[0_4px_0_0_#0f172a] translate-y-0 text-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <UserIcon className="w-8 h-8" strokeWidth={2.5} />
                  <span className="font-black text-lg uppercase">{t.riderRole}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('driver')}
                  className={`flex items-center justify-center gap-4 p-4 rounded-2xl border-4 transition-all ${
                    selectedRole === 'driver' 
                      ? 'bg-amber-400 border-slate-900 shadow-[0_4px_0_0_#0f172a] translate-y-0 text-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Car className="w-8 h-8" strokeWidth={2.5} />
                  <span className="font-black text-lg uppercase">{t.driverRole}</span>
                </button>
              </div>
            </div>
          )}

          {isRegister && (
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <label className="block text-sm font-bold text-slate-900 mb-1">{t.firstName}</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full font-bold bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 focus:outline-slate-900 focus:border-slate-900 text-slate-950"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-bold text-slate-900 mb-1">{t.lastName}</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full font-bold bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 focus:outline-slate-900 focus:border-slate-900 text-slate-950"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-bold bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 focus:outline-slate-900 focus:border-slate-900 text-slate-950"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">{t.phone}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full font-mono text-lg font-black tracking-wider bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 focus:outline-slate-900 focus:border-slate-900 text-center text-slate-950"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 mt-6 bg-amber-500 active:bg-amber-600 text-slate-900 font-extrabold uppercase rounded-2xl text-xl flex items-center justify-center gap-2 border-4 border-slate-900 transition-transform active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_#0f172a]"
          >
            {t.submit}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-bold text-slate-700 hover:text-amber-600"
          >
            {isRegister ? t.toggleLogin : t.toggleRegister}
          </button>
          
          <p className="text-xs font-bold text-neutral-400 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
            {t.adminNotice}
          </p>
        </div>
      </div>
    </div>
  );
}
