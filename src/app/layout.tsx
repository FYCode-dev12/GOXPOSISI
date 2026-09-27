import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eksposisi Alkitab",
    template: "%s — Eksposisi Alkitab",
  },
  description:
    "Tulisan eksposisi Alkitab pasal per pasal, dimulai dari Kitab Roma.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Eksposisi Alkitab",
    title: "Eksposisi Alkitab",
    description:
      "Tulisan eksposisi Alkitab pasal per pasal, dimulai dari Kitab Roma.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
