"use client";

import { Input, Label, Button, Checkbox } from "@components";
import { Mail, Lock, ArrowLeft, ShoppingBag, Gift, Heart } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

      {/* LEFT SIDE — Info */}
      <div className="flex flex-col justify-center space-y-6 px-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white font-bold">
              EB
            </span>
            Estilos Boom
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Moda para mujeres con estilo
          </p>

          <p className="mt-4 text-gray-700">
            Únete a nuestra comunidad y descubre las últimas tendencias en moda femenina
          </p>
        </div>

        <div className="space-y-4">

          {/* BENEFIT 1 */}
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="font-semibold">Compras Fáciles</p>
              <p className="text-sm text-gray-600">
                Navega, selecciona y compra tus prendas favoritas en minutos
              </p>
            </div>
          </div>

          {/* BENEFIT 2 */}
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold">Ofertas Exclusivas</p>
              <p className="text-sm text-gray-600">
                Accede a descuentos especiales y promociones para miembros
              </p>
            </div>
          </div>

          {/* BENEFIT 3 */}
          <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">Recompensas</p>
              <p className="text-sm text-gray-600">
                Acumula puntos con cada compra y obtén beneficios increíbles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Login Form */}
      <div className="bg-white shadow-xl rounded-3xl p-8 border border-rose-100">
        
        {/* TABS */}
        <div className="flex border-b mb-6">
          <button className="flex-1 py-2 text-center border-b-2 border-pink-500 font-semibold text-pink-600">
            Iniciar Sesión
          </button>

          <Link
            href="/auth/register"
            className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700"
          >
            Registrarse
          </Link>
        </div>

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center shadow">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-center text-lg font-semibold">
          ¡Bienvenida de nuevo!
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Ingresa tus datos para acceder a tu cuenta
        </p>

        {/* FORM */}
        <form
  className="space-y-5"
  onSubmit={(e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString().trim().toLowerCase() || "";
    const password = form.get("password")?.toString().trim() || "";

    // Validamos credenciales admin
    const isAdmin = email === "admin" && password === "12345";

    if (isAdmin) {
      localStorage.setItem("role", "admin");
      window.location.href = "/admin/dashboard";
      return;
    }

    // Usuario normal
    localStorage.setItem("role", "user");
    window.location.href = "/";
  }}
>
  {/* Email */}
  <div>
    <Label>Correo electrónico</Label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        name="email"
        placeholder="admin"
        className="pl-10 h-11"
      />
    </div>
  </div>

  {/* Password */}
  <div>
    <Label>Contraseña</Label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input 
        type="password"
        name="password"
        placeholder="12345"
        className="pl-10 h-11"
      />
    </div>
  </div>

  <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-3 rounded-xl">
    Iniciar Sesión
  </Button>
</form>


        {/* BACK LINK */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>

    </div>
  );
}
