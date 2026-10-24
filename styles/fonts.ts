import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

// Self-hosted by next/font at build time: no request leaves the page.
// Each exposes a CSS variable; styles/tokens.css maps them onto the roles
// display, sans and mono, so swapping a typeface is a one-line change there.
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-space-grotesk",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const fontVariables = `${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`;
