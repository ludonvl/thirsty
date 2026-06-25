import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

// Applied before paint so the page never flashes the wrong theme. Mirrors the
// resolve() logic in useTheme: stored choice wins, else the OS preference.
const themeScript = `(function(){try{var t=localStorage.getItem('thirsty.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

// Inter drives the whole interface.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Display serif used for the "Thirsty" wordmark.
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "Thirsty — préparez vos cocktails",
  description:
    "Cherchez un cocktail à la voix ou au clavier et obtenez sa préparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
