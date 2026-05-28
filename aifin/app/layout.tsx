import { Inter, IBM_Plex_Mono } from "next/font/google"
import type { Metadata, Viewport } from "next"

// TypeScript may complain about side-effect CSS imports in some setups.
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FININTEL — AI-Powered Financial Intelligence Platform",
  description:
    "The autonomous financial research system. Multi-agent AI platform for market analysis, portfolio intelligence, earnings research, and risk evaluation.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="dark" attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
