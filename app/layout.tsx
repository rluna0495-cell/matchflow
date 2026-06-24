import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/components/modal-provider";
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchFlow",
  description: "Sports Ticketing Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className="h-full"
    >
      <body
        className={`${inter.className} min-h-screen bg-[#09090B] text-white antialiased`}
      >
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}