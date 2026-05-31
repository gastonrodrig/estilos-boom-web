'use client';

import { useState } from 'react';
import { Camera, Flower2, Plus, MapPin, Edit2, Trash2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  // --- Personal Info State ---
  const initialPersonalData = {
    fullName: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+51 987 654 321",
    birthdate: "1995-03-15",
  };
  const [personalData, setPersonalData] = useState(initialPersonalData);

  const isPersonalInfoChanged = 
    personalData.fullName !== initialPersonalData.fullName ||
    personalData.email !== initialPersonalData.email ||
    personalData.phone !== initialPersonalData.phone ||
    personalData.birthdate !== initialPersonalData.birthdate;

  // --- Security State ---
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isSecurityReady = 
    securityData.currentPassword.length > 0 &&
    securityData.newPassword.length > 0 &&
    securityData.newPassword === securityData.confirmPassword;

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
              onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
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
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-10">
        <h2 className="text-xl font-bold text-[#632034] mb-6">Seguridad</h2>
        <div className="space-y-6 max-w-xl">
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Contraseña actual</label>
            <input 
              type="password"
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium placeholder:text-[#594246]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Nueva contraseña</label>
            <input 
              type="password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium placeholder:text-[#594246]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[#632034] font-bold text-sm mb-2">Confirmar nueva contraseña</label>
            <input 
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl px-5 py-4 text-[#632034] font-medium placeholder:text-[#594246]/30 focus:outline-none focus:ring-2 focus:ring-[#F2D0D3] focus:border-[#F2D0D3] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button 
            disabled={!isSecurityReady}
            className={`px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-sm
              ${isSecurityReady 
                ? 'bg-transparent border-2 border-[#632034] text-[#632034] hover:bg-[#632034] hover:text-white hover:shadow-md' 
                : 'bg-transparent border-2 border-[#EBEAE8] text-[#594246]/40 cursor-not-allowed shadow-none'}
            `}
          >
            Actualizar contraseña
          </button>
        </div>
      </div>

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
          {/* Address 1 */}
          <div className="bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors hover:border-[#F2D0D3]/50">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-[#F2778D]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#632034]">Casa</h3>
                  <span className="px-3 py-1 bg-[#F2D0D3]/40 text-[#632034] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Predeterminada
                  </span>
                </div>
                <p className="text-[#594246]/70 text-sm font-medium">Av. Larco 1234, Miraflores. Lima</p>
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

          {/* Address 2 */}
          <div className="bg-[#FAF9F6] border border-[#EBEAE8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors hover:border-[#F2D0D3]/50">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-[#594246]/40" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-[#632034]">Trabajo</h3>
                </div>
                <p className="text-[#594246]/70 text-sm font-medium">Jr. De la Unión 456, Cercado de Lima</p>
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
