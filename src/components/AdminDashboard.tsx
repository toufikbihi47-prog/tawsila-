import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { getUsers, saveUsers } from '../lib/db';
import { ShieldAlert, CheckCircle, XCircle, Trash2, Shield, Car, User as UserIcon, UserPlus } from 'lucide-react';

interface AdminDashboardProps {
  language: Language;
}

const translations = {
  ar: {
    dashboardTitle: 'لوحة تحكم الإدارة',
    totalUsers: 'إجمالي المستخدمين',
    activeDrivers: 'السائقين النشطين',
    pendingDrivers: 'سائقين بانتظار التفعيل',
    name: 'الاسم',
    role: 'الدور',
    status: 'الحالة',
    actions: 'الإجراءات',
    makeDriver: 'ترقية لسائق',
    activate: 'تفعيل',
    deactivate: 'إيقاف',
    delete: 'حذف',
    rider: 'راكب',
    driver: 'سائق',
    admin: 'مسؤول',
    active: 'نشط',
    pending: 'قيد الانتظار',
    addNewDriver: 'إضافة سائق جديد',
    firstName: 'الاسم الأول',
    lastName: 'اللقب',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني (اختياري للصلاحية)',
    add: 'إضافة',
    driverAddedSuccess: 'تم إضافة وتفعيل السائق بنجاح',
  },
  fr: {
    dashboardTitle: 'Tableau de bord Admin',
    totalUsers: 'Utilisateurs totaux',
    activeDrivers: 'Chauffeurs actifs',
    pendingDrivers: 'Chauffeurs en attente',
    name: 'Nom',
    role: 'Rôle',
    status: 'Statut',
    actions: 'Actions',
    makeDriver: 'Promouvoir Chauffeur',
    activate: 'Activer',
    deactivate: 'Désactiver',
    delete: 'Supprimer',
    rider: 'Passager',
    driver: 'Chauffeur',
    admin: 'Admin',
    active: 'Actif',
    pending: 'En attente',
    addNewDriver: 'Ajouter un nouveau chauffeur',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Numéro de téléphone',
    email: 'Email (optionnel pour l\'accès)',
    add: 'Ajouter',
    driverAddedSuccess: 'Chauffeur ajouté et activé avec succès',
  }
};

export default function AdminDashboard({ language }: AdminDashboardProps) {
  const t = translations[language];
  const [users, setUsersList] = useState<User[]>([]);
  
  // Add driver state
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newDriverFirstName, setNewDriverFirstName] = useState('');
  const [newDriverLastName, setNewDriverLastName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsersList(getUsers());
  }, []);

  const updateUsers = (newUsers: User[]) => {
    setUsersList(newUsers);
    saveUsers(newUsers);
  };

  const setRole = (userId: string, role: 'rider' | 'driver' | 'admin') => {
    const updated = users.map(u => u.id === userId ? { ...u, role, isActive: role === 'admin' } : u);
    updateUsers(updated);
  };

  const toggleActive = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
    updateUsers(updated);
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    updateUsers(updated);
    setDeletingUserId(null);
    setSuccessMessage(language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverFirstName || !newDriverLastName || !newDriverPhone) return;

    const newDriver: User = {
      id: "admin_added_" + Math.random().toString(36).substr(2, 9),
      firstName: newDriverFirstName,
      lastName: newDriverLastName,
      phone: newDriverPhone,
      email: newDriverEmail || `${newDriverPhone}@tawsila.local`,
      role: 'driver',
      isActive: true // active by default when added by admin
    };

    const newUsers = [...users, newDriver];
    updateUsers(newUsers);
    
    setNewDriverFirstName('');
    setNewDriverLastName('');
    setNewDriverPhone('');
    setNewDriverEmail('');
    setIsAddingMode(false);
    
    setSuccessMessage(t.driverAddedSuccess);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {successMessage && (
        <div className="bg-emerald-50 border-4 border-emerald-500 text-emerald-900 px-5 py-4 rounded-2xl flex items-center justify-between font-bold shadow-sm animate-pulse">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-2xl leading-none text-emerald-700 hover:text-emerald-900 ml-4 font-black">×</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-slate-900" />
          <h2 className="text-3xl font-black text-slate-950">{t.dashboardTitle}</h2>
        </div>
        <button 
          onClick={() => setIsAddingMode(!isAddingMode)}
          className="flex items-center gap-2 bg-slate-900 text-amber-500 hover:bg-slate-800 px-4 py-2 rounded-xl font-bold transition-all"
        >
          <UserPlus className="w-5 h-5" />
          {t.addNewDriver}
        </button>
      </div>

      {isAddingMode && (
        <form onSubmit={handleAddDriver} className="bg-amber-50 border-4 border-amber-200 p-6 rounded-2xl mb-8 space-y-4">
          <h3 className="font-black text-amber-900 text-xl border-b-2 border-amber-200 pb-2">{t.addNewDriver}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-1">{t.firstName}</label>
              <input required value={newDriverFirstName} onChange={e => setNewDriverFirstName(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-1">{t.lastName}</label>
              <input required value={newDriverLastName} onChange={e => setNewDriverLastName(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-1">{t.phone}</label>
              <input required type="tel" value={newDriverPhone} onChange={e => setNewDriverPhone(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold font-mono text-left dir-ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-1">{t.email}</label>
              <input type="email" value={newDriverEmail} onChange={e => setNewDriverEmail(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 outline-none font-bold" />
            </div>
          </div>
          <button type="submit" className="w-full md:w-auto bg-amber-500 text-slate-900 font-black px-8 py-3 rounded-xl mt-4 hover:bg-amber-400 transition-colors">
            {t.add}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border-4 border-slate-900 shadow-[0_4px_0_0_#0f172a]">
          <div className="text-4xl font-black text-slate-900 mb-2">{users.length}</div>
          <div className="text-sm font-bold text-slate-600">{t.totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-4 border-blue-800 shadow-[0_4px_0_0_#1e40af]">
          <div className="text-4xl font-black text-blue-800 mb-2">
            {users.filter(u => u.role === 'driver' && u.isActive).length}
          </div>
          <div className="text-sm font-bold text-blue-600">{t.activeDrivers}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-4 border-amber-500 shadow-[0_4px_0_0_#b45309]">
          <div className="text-4xl font-black text-amber-600 mb-2">
            {users.filter(u => u.role === 'driver' && !u.isActive).length}
          </div>
          <div className="text-sm font-bold text-amber-700">{t.pendingDrivers}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-4 border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-100 border-b-4 border-neutral-200">
              <tr>
                <th className="p-4 font-black text-neutral-600">{t.name}</th>
                <th className="p-4 font-black text-neutral-600">Email / Phone</th>
                <th className="p-4 font-black text-neutral-600">{t.role}</th>
                <th className="p-4 font-black text-neutral-600">{t.status}</th>
                <th className="p-4 font-black text-neutral-600 border-l border-neutral-200">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-neutral-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <div>{user.firstName} {user.lastName}</div>
                        {user.role === 'driver' && user.ratingCount ? (
                          <div className="text-xs text-amber-500 font-bold mt-0.5">
                            ★ {(user.ratingSum! / user.ratingCount).toFixed(1)} ({user.ratingCount})
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-neutral-800">{user.email}</div>
                    <div className="text-xs font-mono font-bold text-neutral-500">{user.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      user.role === 'driver' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      {user.role === 'driver' && <Car className="w-3 h-3" />}
                      {user.role === 'rider' && <UserIcon className="w-3 h-3" />}
                      {t[user.role]}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === 'driver' ? (
                      <span className={`inline-flex items-center gap-1 font-bold text-sm ${user.isActive ? 'text-amber-600' : 'text-slate-500'}`}>
                        {user.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {user.isActive ? t.active : t.pending}
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-bold text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 border-l border-neutral-100 flex gap-2 flex-wrap">
                    {user.role === 'rider' && (
                      <button 
                        onClick={() => setRole(user.id, 'driver')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition-colors border border-blue-200"
                      >
                        {t.makeDriver}
                      </button>
                    )}
                    {user.role === 'driver' && (
                      <button 
                        onClick={() => toggleActive(user.id)}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors border ${
                          user.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {user.isActive ? t.deactivate : t.activate}
                      </button>
                    )}
                    {user.role !== 'admin' && (
                      <div className="flex items-center gap-1.5">
                        {deletingUserId === user.id ? (
                          <>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors border border-red-700 animate-pulse"
                            >
                              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm'}
                            </button>
                            <button 
                              onClick={() => setDeletingUserId(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-300"
                            >
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setDeletingUserId(user.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-lg transition-colors border border-red-200 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t.delete}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-neutral-500 font-bold">
              لا يوجد مستخدمين مسجلين
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
