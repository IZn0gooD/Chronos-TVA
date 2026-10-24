import type { Metadata, Viewport } from "next";
import { StudioLoader } from "@/components/graphics/theatre/studio-loader";
import { MotionProvider } from "@/components/motion/motion-provider";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/styles/fonts";
import "./globals.css";

// No metadataBase: the production domain is not known, and a fictional one
// must not be declared. Open Graph images resolve once a domain exists.
export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} / ${siteConfig.designation}`,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#171914",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.locale} className={`${fontVariables} no-js h-full`} suppressHydrationWarning>
      <head>
        {/* Flags a scripted page before first paint, so the entrance choreography can start from its hidden state without a flash. Without JavaScript the class stays `no-js` and everything is visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.replace('no-js','js');try{var d=document.documentElement;if(localStorage.getItem('chronos:motion')==='paused')d.dataset.motion='paused';if(sessionStorage.getItem('chronos:boot-seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches||d.dataset.motion==='paused')d.dataset.boot='skip'}catch(e){}",
          }}
        />
      </head>
      <body id="top" className="flex min-h-full flex-col">
        <MotionProvider>
          <StudioLoader />
          {/* The site chrome lives in app/(site)/layout.tsx; the lab routes in app/(lab) draw their own. */}
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
