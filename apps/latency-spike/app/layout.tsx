import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders Service Demo',
  description: 'Demo app with latency spike bug',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
