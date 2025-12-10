"use client";

import { useEffect } from "react";

export default function AdminDashboard() {
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      window.location.href = "/auth/login";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold p-6">Panel de Administración</h1>
    </div>
  );
}
