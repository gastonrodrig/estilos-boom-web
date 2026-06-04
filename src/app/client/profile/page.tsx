'use client';

import { useState, useEffect } from 'react';
import { Camera, Flower2, Plus, MapPin, Edit2, Trash2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/hooks/auth/use-auth-store';
import { useClientPersonStore } from '@/hooks/client/use-client-person-store';
import { AddressInput } from '@/core/models';

export default function ProfilePage() {
  const { startPasswordReset, email, firstName, lastName, phone } = useAuthStore();
  const { startLoadingMyAddresses } = useClientPersonStore();
  
  const [myAddresses, setMyAddresses] = useState<AddressInput[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // --- Personal Info State ---
  const initialPersonalData = {
    fullName: (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : "Usuario",
    email: email || "",
    phone: phone || "",
    birthdate: "", // TODO: Add birthdate to auth store if needed
  };
  const [personalData, setPersonalData] = useState(initialPersonalData);

  // Sync state if auth store loads data later
  useEffect(() => {
    setPersonalData({
      fullName: (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : "Usuario",
      email: email || "",
      phone: phone || "",
      birthdate: "",
    });
  }, [firstName, lastName, email, phone]);

  // Load addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      const addresses = await startLoadingMyAddresses();
      setMyAddresses(addresses);
      setIsLoadingAddresses(false);
    };
    loadAddresses();
  }, []);

  const isPersonalInfoChanged = 
    personalData.fullName !== initialPersonalData.fullName ||
    personalData.email !== initialPersonalData.email ||
    personalData.phone !== initialPersonalData.phone ||
    personalData.birthdate !== initialPersonalData.birthdate;

  // --- Security State ---
  // MOCK: Esto vendría del contexto de autenticación real
  const authProvider: 'LOCAL' | 'GOOGLE' = 'LOCAL'; 
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleResetPassword = async () => {
    setIsSendingReset(true);
    const success = await startPasswordReset({ email: personalData.email });
    setIsSendingReset(false);
    
    if (success) {
      setIsResetEmailSent(true);
      setTimeout(() => setIsResetEmailSent(false), 5000);
    }
  };

  return (
    <div className="space-y-10 w-full pb-10">
      
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">Mi perfil</h1>
        <p className="text-[#594246]/70 text-sm mt-1 font-medium">Administra tu información personal y de seguridad.</p>
      </div>

      {/* 1. Información Personal Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2778D] via-[#F2B6C1] to-[#F2D0D3]"></div>
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#F2D0D3] to-[#F2778D] flex items-center justify-center shadow-inner overflow-hidden border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Flower2 className="w-12 h-12 text-white/90" />
            </div>
            {/* Camera icon badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-[#EBEAE8] shadow-sm flex items-center justify-center transition-colors group-hover:bg-[#FAF9F6]">
              <Camera className="w-4 h-4 text-[#594246]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#632034]">{initialPersonalData.fullName}</h2>
            <p className="text-[#594246]/70 text-sm font-medium">{initialPersonalData.email}</p>
            <button className="text-[#F2778D] font-bold text-xs mt-2 hover:underline transition-all">
              Cambiar foto
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Nombre completo</label>
            <input 
              type="text"
              value={personalData.fullName}
              onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Correo electrónico</label>
            <input 
              type="email"
              value={personalData.email}
              readOnly
              className="w-full bg-[#EBEAE8]/40 border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#594246]/70 font-medium cursor-not-allowed shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Número de teléfono</label>
            <input 
              type="tel"
              value={personalData.phone}
              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Fecha de nacimiento <span className="text-[#632034]/50 font-normal">(opcional)</span></label>
            <input 
              type="date"
              value={personalData.birthdate}
              onChange={(e) => setPersonalData({...personalData, birthdate: e.target.value})}
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button 
            disabled={!isPersonalInfoChanged}
            className={`px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm
              ${isPersonalInfoChanged 
                ? 'bg-[#632034] text-white hover:bg-[#F2778D] hover:shadow-md' 
                : 'bg-[#EBEAE8] text-[#594246]/40 cursor-not-allowed shadow-none'}
            `}
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {/* 2. Seguridad Card */}
      {authProvider === 'LOCAL' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-10">
          <h2 className="text-xl font-bold text-[#632034] mb-6">Seguridad</h2>
          <div className="max-w-xl">
            <p className="text-[#594246]/70 text-sm font-medium mb-6">
              Para proteger tu cuenta, te enviaremos un enlace seguro a tu correo electrónico registrado ({personalData.email}) para que puedas restablecer tu contraseña.
            </p>
            
            <button 
              onClick={handleResetPassword}
              disabled={isResetEmailSent || isSendingReset}
              className={`px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm
                ${isResetEmailSent 
                  ? 'bg-green-50 border-2 border-green-200 text-green-700 cursor-default shadow-none' 
                  : 'bg-transparent border-2 border-[#632034] text-[#632034] hover:bg-[#632034] hover:text-white hover:shadow-md'}
                ${isSendingReset ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSendingReset ? 'Enviando enlace...' : isResetEmailSent ? 'Enlace enviado al correo' : 'Restablecer contraseña'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Mis Direcciones Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-[#632034]">Mis direcciones</h2>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F2778D] text-white rounded-2xl font-bold transition-all duration-300 hover:bg-[#632034] hover:shadow-md shadow-sm">
            <Plus className="w-5 h-5" />
            Agregar nueva dirección
          </button>
        </div>

        <div className="space-y-4">
          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2778D]"></div>
            </div>
          ) : myAddresses.length === 0 ? (
            <div className="text-center py-10 bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl">
              <MapPin className="w-8 h-8 text-[#594246]/20 mx-auto mb-3" />
              <p className="text-[#594246]/60 font-medium">Aún no tienes direcciones guardadas.</p>
            </div>
          ) : (
            myAddresses.map((address, index) => (
              <div key={index} className="bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors hover:border-[#F2D0D3]/50">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <MapPin className={`w-5 h-5 ${address.is_default ? 'text-[#F2778D]' : 'text-[#594246]/40'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-[#632034]">Dirección {index + 1}</h3>
                      {address.is_default && (
                        <span className="px-3 py-1 bg-[#F2D0D3]/40 text-[#632034] text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-[#594246]/70 text-sm font-medium">
                      {address.address_line}
                      {address.district && `, ${address.district}`}
                      {address.province && `, ${address.province}`}
                      {address.department && `, ${address.department}`}
                    </p>
                    {address.reference && (
                      <p className="text-[#594246]/50 text-xs mt-1">Ref: {address.reference}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button className="w-10 h-10 rounded-full border border-[#EBEAE8] flex items-center justify-center text-[#594246]/50 hover:bg-white hover:text-[#632034] transition-colors bg-transparent">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-[#EBEAE8] flex items-center justify-center text-[#594246]/50 hover:bg-[#ffebee] hover:border-[#ffcdd2] hover:text-red-500 transition-colors bg-transparent">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Logout Section */}
      <div className="pt-6">
        <button className="flex items-center gap-2 text-red-500/80 font-bold hover:text-red-600 transition-colors bg-white/50 px-6 py-3 rounded-2xl border border-red-100 hover:bg-red-50">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>

    </div>
  );
}
