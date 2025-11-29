import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import Header from '../components/Header'
import { ErrorBoundary } from '../components/ErrorBoundary'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: import.meta.env.VITE_APP_NAME || 'Receipts Tracker',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: import.meta.env.VITE_APP_FAVICON || '/favicon.ico',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorBoundary>
          <Header />
          {children}
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}
