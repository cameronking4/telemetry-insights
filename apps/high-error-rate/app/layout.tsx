import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Service Demo',
  description: 'Demo app with high error rate bug',
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
