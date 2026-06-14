'use client';

import { useState, useEffect } from 'react';
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
  const [authProvider, setAuthProvider] = useState<'local' | 'google'>('local');
  const [securityStep, setSecurityStep] = useState<'idle' | 'verification' | 'success'>('idle');
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isSecurityReady = 
    securityData.currentPassword.length > 0 &&
    securityData.newPassword.length > 0 &&
    securityData.newPassword === securityData.confirmPassword;

  useEffect(() => {
    if (securityStep === 'verification' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [securityStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpdatePasswordClick = () => {
    setSecurityStep('verification');
    setTimeLeft(300);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setSecurityStep('success');
    }
  };

  return (
    <div className="space-y-10 w-full pb-10">
      
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-serif font-medium text-[#594246] dark:text-[#f8f0f5] tracking-wide">Mi perfil</h1>
        <p className="text-[#594246]/70 dark:text-[#f0d8e8]/90 text-sm mt-1 font-medium">Administra tu información personal y de seguridad.</p>
      </div>

      {/* 1. Información Personal Card */}
      <div className="bg-white/90 dark:bg-[#2d0a1e]/40 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F2778D] via-[#F2B6C1] to-[#F2D0D3]"></div>
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#F2D0D3] to-[#F2778D] dark:from-[#e8688a]/40 dark:to-[#f0a0c0]/40 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white dark:border-[#2d0a1e] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Flower2 className="w-12 h-12 text-white/90 dark:text-[#f0a0c0]" />
            </div>
            {/* Camera icon badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#2d0a1e] rounded-full border border-[#EBEAE8] dark:border-[#e8688a]/30 shadow-sm flex items-center justify-center transition-colors group-hover:bg-[#FAF9F6] dark:group-hover:bg-[#e8688a]/20">
              <Camera className="w-4 h-4 text-[#594246] dark:text-[#f0a0c0]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#632034] dark:text-[#f0a0c0]">{initialPersonalData.fullName}</h2>
            <p className="text-[#594246]/70 dark:text-[#f0d8e8]/80 text-sm font-medium">{initialPersonalData.email}</p>
            <button className="text-[#F2778D] dark:text-[#e8688a] font-bold text-xs mt-2 hover:underline transition-all">
              Cambiar foto
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Nombre completo</label>
            <input 
              type="text"
              value={personalData.fullName}
              onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
              className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Correo electrónico</label>
            <input 
              type="email"
              value={personalData.email}
              readOnly
              className="w-full bg-[#EBEAE8]/40 border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#594246]/70 font-medium cursor-not-allowed shadow-inner"
              onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
              className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Número de teléfono</label>
            <input 
              type="tel"
              value={personalData.phone}
              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
              className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Fecha de nacimiento <span className="text-[#632034]/50 dark:text-[#f8f0f5]/50 font-normal">(opcional)</span></label>
            <input 
              type="date"
              value={personalData.birthdate}
              onChange={(e) => setPersonalData({...personalData, birthdate: e.target.value})}
              className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
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
      <div className="bg-white/90 dark:bg-[#2d0a1e]/40 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 p-6 lg:p-10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-bold text-[#632034] dark:text-[#f0a0c0]">Seguridad</h2>
          {/* Toggle for testing purposes */}
          <button 
            onClick={() => setAuthProvider(prev => prev === 'local' ? 'google' : 'local')}
            className="text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-gray-500 font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            Modo: {authProvider}
          </button>
        </div>

        {authProvider === 'google' ? (
          <div className="max-w-3xl mx-auto bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl p-8 flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 bg-white dark:bg-[#2d0a1e] rounded-full shadow-sm flex items-center justify-center mb-6 border border-[#EBEAE8] dark:border-[#e8688a]/30">
              {/* Google Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#632034] dark:text-[#f8f0f5] mb-2">Cuenta administrada por Google</h3>
            <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm font-medium mb-8 max-w-md">
              Tu contraseña es administrada por Google. Para cambiarla, visita tu cuenta de Google.
            </p>
            <a 
              href="https://myaccount.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-transparent border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#632034] dark:text-[#f0a0c0] hover:bg-[#FAF9F6] dark:hover:bg-white/5 hover:border-[#F2D0D3] dark:hover:border-[#e8688a]/50 transition-all duration-300"
            >
              Gestionar en Google
            </a>
          </div>
        ) : (
          <div className="relative z-10 w-full">
            {securityStep === 'idle' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div>
                    <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Contraseña actual</label>
                    <input 
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/30 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium placeholder:text-[#594246]/30 dark:placeholder:text-[#f0d8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Nueva contraseña</label>
                    <input 
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/30 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium placeholder:text-[#594246]/30 dark:placeholder:text-[#f0d8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Confirmar nueva contraseña</label>
                    <input 
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/30 rounded-2xl px-5 py-4 text-[#632034] dark:text-[#f0d8e8] font-medium placeholder:text-[#594246]/30 dark:placeholder:text-[#f0d8e8]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#594246]/60 dark:text-[#f0d8e8]/60 italic">
                  * Por seguridad, te enviaremos un código de verificación de 6 dígitos a tu correo antes de aplicar los cambios.
                </p>

                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!isSecurityReady}
                    onClick={handleUpdatePasswordClick}
                    className={`px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm w-full md:w-auto
                      ${isSecurityReady 
                        ? 'bg-transparent border-2 border-[#632034] dark:border-[#f0a0c0] text-[#632034] dark:text-[#f0a0c0] hover:bg-[#632034] dark:hover:bg-[#f0a0c0] hover:text-white dark:hover:text-[#2d0a1e] hover:shadow-md' 
                        : 'bg-transparent border-2 border-[#EBEAE8] dark:border-[#e8688a]/20 text-[#594246]/40 dark:text-[#f8f0f5]/30 cursor-not-allowed shadow-none'}
                    `}
                  >
                    Actualizar contraseña
                  </button>
                </div>
              </motion.div>
            )}

            {securityStep === 'verification' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-3xl mx-auto">
                <div className="bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-[#632034] dark:text-[#f8f0f5] mb-2">Verifica tu identidad</h3>
                  <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm font-medium mb-6">
                    Hemos enviado un código de 6 dígitos a <span className="font-bold text-[#632034] dark:text-[#f0a0c0]">{personalData.email}</span>.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-[#632034] dark:text-[#f8f0f5] font-bold text-sm mb-2">Código de verificación</label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-white dark:bg-[#2d0a1e] border border-[#EBEAE8] dark:border-[#e8688a]/30 rounded-xl px-5 py-4 text-center text-2xl tracking-[0.5em] font-bold text-[#632034] dark:text-[#f0d8e8] placeholder:text-[#594246]/20 dark:placeholder:text-[#f0d8e8]/20 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] dark:focus:ring-[#e8688a]/50 focus:border-[#F2D0D3] dark:focus:border-[#e8688a]/50 transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <span className="text-sm font-bold text-[#594246]/60 dark:text-[#f0d8e8]/60">
                      El código expira en <span className="text-[#632034] dark:text-[#f0a0c0]">{formatTime(timeLeft)}</span>
                    </span>
                    <button 
                      className="text-sm font-bold text-[#F2778D] dark:text-[#e8688a] hover:underline"
                      onClick={() => setTimeLeft(300)}
                    >
                      Reenviar código
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSecurityStep('idle')}
                      className="flex-1 py-3.5 rounded-xl font-bold bg-transparent border-2 border-[#EBEAE8] dark:border-[#e8688a]/30 text-[#632034] dark:text-[#f0a0c0] hover:bg-white dark:hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                      className={`flex-1 py-3.5 rounded-xl font-bold transition-all border-2
                        ${verificationCode.length === 6
                          ? 'bg-[#632034] dark:bg-[#f0a0c0] border-transparent text-white dark:text-[#2d0a1e] hover:bg-[#F2778D] dark:hover:bg-white hover:shadow-md'
                          : 'bg-[#EBEAE8] dark:bg-white/5 border-transparent text-[#594246]/40 dark:text-[#f8f0f5]/30 cursor-not-allowed'}
                      `}
                    >
                      Verificar y cambiar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {securityStep === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto">
                <div className="bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-emerald-500/30">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#632034] dark:text-[#f8f0f5] mb-2">¡Contraseña actualizada!</h3>
                  <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm font-medium mb-8">
                    Tu contraseña ha sido cambiada exitosamente. Usa tu nueva contraseña la próxima vez que inicies sesión.
                  </p>
                  <button 
                    onClick={() => {
                      setSecurityStep('idle');
                      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setVerificationCode("");
                    }}
                    className="px-8 py-3.5 rounded-xl font-bold bg-[#632034] dark:bg-[#e8688a]/20 text-white dark:text-[#f0a0c0] hover:bg-[#F2778D] dark:hover:bg-[#e8688a] dark:hover:text-[#f8f0f5] transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Volver a Seguridad
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* 3. Mis Direcciones Card */}
      <div className="bg-white/90 dark:bg-[#2d0a1e]/40 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] dark:shadow-[0_8px_32px_rgba(232,104,138,0.15)] border border-[#EBEAE8] dark:border-[#e8688a]/20 p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-[#632034] dark:text-[#f0a0c0]">Mis direcciones</h2>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F2778D] dark:bg-[#e8688a] text-white dark:text-[#f8f0f5] rounded-2xl font-bold transition-all duration-300 hover:bg-[#632034] dark:hover:bg-[#f0a0c0] dark:hover:text-[#2d0a1e] hover:shadow-md shadow-sm">
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
          {/* Address 1 */}
          <div className="bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors hover:border-[#F2D0D3]/50 dark:hover:border-[#e8688a]/50">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-[#F2778D] dark:text-[#f0a0c0]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#632034] dark:text-[#f8f0f5]">Casa</h3>
                  <span className="px-3 py-1 bg-[#F2D0D3]/40 dark:bg-[#e8688a]/20 text-[#632034] dark:text-[#f0a0c0] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Predeterminada
                  </span>
                </div>
                <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm font-medium">Av. Larco 1234, Miraflores. Lima</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <button className="w-10 h-10 rounded-full border border-[#EBEAE8] dark:border-[#e8688a]/30 flex items-center justify-center text-[#594246]/50 dark:text-[#f8f0f5]/50 hover:bg-white dark:hover:bg-white/10 hover:text-[#632034] dark:hover:text-[#f0a0c0] transition-colors bg-transparent">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-[#EBEAE8] dark:border-[#e8688a]/30 flex items-center justify-center text-[#594246]/50 dark:text-[#f8f0f5]/50 hover:bg-[#ffebee] dark:hover:bg-red-500/10 hover:border-[#ffcdd2] dark:hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-transparent">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Address 2 */}
          <div className="bg-[#FAF9F6] dark:bg-white/5 border border-[#EBEAE8] dark:border-[#e8688a]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors hover:border-[#F2D0D3]/50 dark:hover:border-[#e8688a]/50">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-[#594246]/40 dark:text-[#f8f0f5]/40" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#632034] dark:text-[#f8f0f5]">Trabajo</h3>
                </div>
                <p className="text-[#594246]/70 dark:text-[#f0d8e8]/70 text-sm font-medium">Jr. De la Unión 456, Cercado de Lima</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <button className="w-10 h-10 rounded-full border border-[#EBEAE8] dark:border-[#e8688a]/30 flex items-center justify-center text-[#594246]/50 dark:text-[#f8f0f5]/50 hover:bg-white dark:hover:bg-white/10 hover:text-[#632034] dark:hover:text-[#f0a0c0] transition-colors bg-transparent">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-[#EBEAE8] dark:border-[#e8688a]/30 flex items-center justify-center text-[#594246]/50 dark:text-[#f8f0f5]/50 hover:bg-[#ffebee] dark:hover:bg-red-500/10 hover:border-[#ffcdd2] dark:hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-transparent">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Logout Section */}
      <div className="pt-6">
        <button className="flex items-center gap-2 text-red-500/80 font-bold hover:text-red-600 transition-colors bg-white/50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-red-100 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>

    </div>
  );
}
