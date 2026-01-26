"use client";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { clientEnv } from "@config-client";

// Debug: Verificar variables de entorno
console.log('🔧 Firebase Config Debug:', {
  apiKey: clientEnv.FIREBASE.API_KEY ? '✅ Set' : '❌ Missing',
  authDomain: clientEnv.FIREBASE.AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
  projectId: clientEnv.FIREBASE.PROJECT_ID ? '✅ Set' : '❌ Missing',
});

// Configuración usando variables de entorno
const firebaseConfig = {
  apiKey: clientEnv.FIREBASE.API_KEY,
  authDomain: clientEnv.FIREBASE.AUTH_DOMAIN,
  projectId: clientEnv.FIREBASE.PROJECT_ID,
  storageBucket: clientEnv.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: clientEnv.FIREBASE.MESSAGING_SENDER_ID,
  appId: clientEnv.FIREBASE.APP_ID,
};

// Inicializar Firebase
export const FirebaseApp = initializeApp(firebaseConfig);

// Exportar Auth
export const FirebaseAuth = getAuth(FirebaseApp);
