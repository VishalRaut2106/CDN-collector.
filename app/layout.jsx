import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata = {
  title: "CDN Collection Generator",
  description: "Search and generate CDN links for your favorite libraries",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  )
}
