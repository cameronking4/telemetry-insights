import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Failure Demo',
  description: 'Demo app with missing dependency bug',
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
