import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'BuildProof - Smart Contract Security Verifier',
  description:
    'Instantly verify and analyze the security of any smart contract on the blockchain with our advanced verification engine.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preload"
          href="https://fonts.reown.com/KHTeka-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}
