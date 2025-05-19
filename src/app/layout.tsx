'use client';

import '../index.css';
import '../i18n/config';
import { Providers } from './Providers';

// Metadata must be exported from a server component, not a client component
// Since we need to use client features, we'll set these as regular HTML in the return
// export const metadata = {
//   title: 'VT Tracker - Manage Your Contacts',
//   description: 'VT Tracker helps you manage your contacts with ease.',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>VT Tracker - Manage Your Contacts</title>
        <meta name="description" content="VT Tracker helps you manage your contacts with ease." />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 