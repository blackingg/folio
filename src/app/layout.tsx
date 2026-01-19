import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  description: DATA.description,
  openGraph: {
    title: `${DATA.name}'s portfolio`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/me.png",
        width: 1200,
        height: 630,
        alt: DATA.name,
      },
    ],
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
  twitter: {
    title: `${DATA.name}`,
    card: "summary_large_image",
    description: DATA.description,
    site: DATA.url,
    creator: DATA.name,
    images: "/me.png",
  },
  keywords: [
    "Odetunde Mubarak",
    "Mubarak Odetunde",
    "whoisblxck",
    "Frontend Engineer",
    "Web3 Nigeria",
    "Portfolio",
    "Resume",
    "Software Engineer",
    "React Developer",
    "Next.js Developer",
    "JavaScript Developer",
    "TypeScript Developer",
    "React-Native Developer",
  ],
  verification: {
    google: "QTqDGYmpPo7-0b7C75zH5Pl-kHEkOlyFiJfNvwh2IMo",
    yandex: "",
  },
  other: {
    "google-site-verification": "QTqDGYmpPo7-0b7C75zH5Pl-kHEkOlyFiJfNvwh2IMo",
    "p:domain_verify": "7eddf1ac81450b5dbd263d6fefeda5a0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Odetunde Mubarak",
              alternateName: "whoisblxck",
              url: "https://www.whoisblxck.xyz/",
              image: "https://www.whoisblxck.xyz/me.png",
              sameAs: [
                "https://www.instagram.com/whoisblxck_/",
                "https://www.instagram.com/createblack.x/",
                "https://www.linkedin.com/in/mubarak-odetunde-258494236/",
                "https://x.com/whoisBlxck/",
              ],
              jobTitle: DATA.description,
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-3xl mx-auto pt-12 sm:pt-24 pb-20 sm:pb-32 px-6",
          fontSans.variable,
        )}
      >
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
