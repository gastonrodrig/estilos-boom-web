import "./globals.css";
import { ReduxProvider } from "@/providers/redux-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { RoleGuard } from "@/guards/role-guard";
import { UserFlowGuard } from "@/guards/user-flow-guard";
import { Montserrat, Vidaloka } from "next/font/google";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estilos Boom",
  description: "Tienda de moda femenina - Estilos Boom",
  icons: {
    icon: "/metadata-icon.ico",
    shortcut: "/metadata-icon.ico",
  },
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const vidaloka = Vidaloka({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vidaloka",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`min-h-screen flex flex-col bg-white ${montserrat.variable} ${vidaloka.variable}`}>
        <ReduxProvider>
          <AuthProvider>
            <UserFlowGuard>
              <RoleGuard>
                {children}
              </RoleGuard>
            </UserFlowGuard>
            <Toaster
              position="bottom-center"
              gutter={8}
              toastOptions={{
                style: {
                  background: "#f2b6c1",
                  fontWeight: 300,
                },
              }}
            />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
