import type { Metadata } from "next";
import {
  Abril_Fatface,
  Caveat,
  Dancing_Script,
  Inter,
  Lato,
  Merriweather,
  Montserrat,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
  Ubuntu,
  Great_Vibes,
  Lora,
} from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const abrilFatface = Abril_Fatface({
  variable: "--font-abril-fatface",
  subsets: ["latin"],
  weight: ["400"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body
        className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${openSans.variable} ${montserrat.variable} ${lato.variable} ${playfair.variable} ${merriweather.variable} ${raleway.variable} ${ubuntu.variable} ${greatVibes.variable} ${dancingScript.variable} ${caveat.variable} ${abrilFatface.variable} ${lora.variable} font-sans antialiased h-full`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
