import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Universal Language Learner',
  description: 'Intelligent phrase-by-phrase translation tool for language learning',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
