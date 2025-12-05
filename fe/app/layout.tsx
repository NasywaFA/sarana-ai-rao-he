import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarana AI | Empowering businesses with AI-driven solutions",
  description: "Empowering businesses with AI-driven solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #22c55e',
                padding: '16px',
                color: '#065f46',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #ef4444',
                padding: '16px',
                color: '#991b1b',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
