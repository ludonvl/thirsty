import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

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
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
