import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Schedule 1 Mixer - Game-Accurate Mixing Calculator",
  description: "A deterministic mixing system calculator for the Schedule 1 video game. Build mixes, look up recipes, and explore ingredients with 100% game-accurate data.",
  keywords: ["Schedule 1", "Schedule I", "mixing calculator", "recipe guide", "game guide"],
  authors: [{ name: "Schedule 1 Mixer" }],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Schedule 1 Mixer - Game-Accurate Mixing Calculator",
    description: "Build mixes, look up recipes, and explore ingredients with 100% game-accurate data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-zinc-950 text-white min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

