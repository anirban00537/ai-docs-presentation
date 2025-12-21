import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Butterfast - AI Presentation Application",
    template: "%s | Butterfast",
  },
  description:
    "Create stunning presentations effortlessly with Butterfast, an AI-powered presentation application. Design, customize, and share professional presentations in minutes.",
  keywords: [
    "AI presentation",
    "presentation builder",
    "AI slides",
    "presentation maker",
    "slide creator",
    "AI-powered presentations",
    "presentation software",
    "slide design",
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
    title: "Butterfast - AI Presentation Application",
    description:
      "Create stunning presentations effortlessly with Butterfast, an AI-powered presentation application.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Butterfast - AI Presentation Application",
    description:
      "Create stunning presentations effortlessly with Butterfast, an AI-powered presentation application.",
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
      <body className={`${poppins.variable} font-sans antialiased h-full`}>
        <Providers>{children}</Providers>
        <Script
          src="https://u11.butterfast.com/script.js"
          data-website-id="209eb502-c264-4656-be5b-83dfaa534736"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
