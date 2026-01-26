// src/app/layout.tsx
import "./globals.css";
import { ReduxProvider } from "./providers/redux-provider";
import { AuthProvider } from "./providers/auth-provider";

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-white">
        <ReduxProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
