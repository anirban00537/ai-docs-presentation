import type { Metadata } from "next";
import { Poppins, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const libre = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Butterfast - AI Doc Application",
    template: "%s | Butterfast",
  },
  description:
    "Create stunning docs effortlessly with Butterfast, an AI-powered doc application. Design, customize, and share professional docs in minutes.",
  keywords: [
    "AI doc",
    "doc builder",
    "AI cards",
    "doc maker",
    "card creator",
    "AI-powered docs",
    "doc software",
    "card design",
  ],
  authors: [{ name: "Butterfast" }],
  creator: "Butterfast",
  publisher: "Butterfast",
  applicationName: "Butterfast",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Butterfast",
    title: "Butterfast - AI Doc Application",
    description:
      "Create stunning docs effortlessly with Butterfast, an AI-powered doc application.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Butterfast - AI Doc Application",
    description:
      "Create stunning docs effortlessly with Butterfast, an AI-powered doc application.",
    creator: "@butterfast",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${poppins.variable} ${libre.variable} font-sans antialiased h-full`}>
        <Providers>{children}</Providers>
        {/* Umami Analytics */}
        <Script
          defer
          src="https://u11.butterfast.com/script.js"
          data-website-id="fa1ed556-8ffd-4d22-899d-3ce2b258b594"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
