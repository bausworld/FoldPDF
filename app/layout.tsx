import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

/* ─── SEO Metadata ───────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'FoldPDF — Free PDF Splitter & Merger | 100% Private, No Uploads',
    template: '%s | FoldPDF by Pixel & Purpose',
  },
  description:
    'Split PDFs into individual pages, merge multiple PDFs into one, and reorder pages — all instantly in your browser. No file uploads, no tracking, no data collection. Completely free. Upgrade to Pro for unlimited files.',
  generator: 'FoldPDF by Pixel & Purpose',
  applicationName: 'FoldPDF',
  keywords: [
    'PDF splitter', 'PDF merger', 'split PDF online', 'merge PDF online',
    'reorder PDF pages', 'free PDF tool', 'privacy PDF tool', 'client-side PDF',
    'no upload PDF', 'browser PDF editor', 'combine PDF', 'extract PDF pages',
    'PDF splitter free', 'PDF merge free', 'offline PDF tool',
  ],
  authors: [{ name: 'Pixel & Purpose', url: 'https://pixel-and-purpose.com' }],
  creator: 'Pixel & Purpose',
  publisher: 'Pixel & Purpose',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'FoldPDF — Free PDF Splitter & Merger | No Uploads, 100% Private',
    description:
      'Split, merge, and reorder PDF pages instantly in your browser. No file uploads, no tracking. Free forever — Pro unlocks unlimited files for just $5.',
    url: 'https://pixel-and-purpose.com/pdf',
    siteName: 'FoldPDF',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://pixel-and-purpose.com/pdf/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FoldPDF — Free, private PDF splitter and merger by Pixel & Purpose',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoldPDF — Free PDF Splitter & Merger | No Uploads, 100% Private',
    description:
      'Split, merge, and reorder PDFs instantly in your browser. No uploads, no tracking. Free forever.',
    site: '@pixelandpurpose',
    creator: '@pixelandpurpose',
    images: ['https://pixel-and-purpose.com/pdf/og-image.png'],
  },
  alternates: {
    canonical: 'https://pixel-and-purpose.com/pdf',
  },
  category: 'technology',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a8a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

/* ─── JSON-LD Structured Data ────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://pixel-and-purpose.com/pdf#app',
      name: 'FoldPDF',
      url: 'https://pixel-and-purpose.com/pdf',
      description:
        'Split PDFs into individual pages, merge multiple PDFs into one, and reorder pages — all instantly in your browser. No uploads. No tracking. 100% private.',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern browser with JavaScript enabled.',
      inLanguage: 'en',
      isAccessibleForFree: true,
      featureList: [
        'Split PDF into individual pages',
        'Merge multiple PDFs into one file',
        'Drag-and-drop page reordering',
        'Instant browser-based processing — no uploads',
        'Privacy-first: no tracking, no data collection',
        'Download results instantly',
      ],
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          name: 'Free Tier',
          description: 'Up to 3 PDF files and 10 pages per session.',
        },
        {
          '@type': 'Offer',
          price: '5.00',
          priceCurrency: 'USD',
          name: 'Pro — One-Time',
          description: 'Unlimited PDFs and pages, drag-and-drop page reordering.',
        },
      ],
      creator: {
        '@type': 'Organization',
        name: 'Pixel & Purpose',
        url: 'https://pixel-and-purpose.com',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://pixel-and-purpose.com/pdf#website',
      url: 'https://pixel-and-purpose.com/pdf',
      name: 'FoldPDF by Pixel & Purpose',
      description: 'Free, privacy-first online PDF tools.',
      publisher: {
        '@type': 'Organization',
        name: 'Pixel & Purpose',
        url: 'https://pixel-and-purpose.com',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://pixel-and-purpose.com/pdf?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is FoldPDF really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. FoldPDF is free for up to 3 files and 10 pages per session. Upgrade to Pro for just $5 (one-time) to unlock unlimited files and pages.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my PDF files uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All PDF processing happens entirely in your browser using pdf-lib. Your files never leave your device and are never uploaded to any server.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I split a PDF into individual pages?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Upload your PDF to FoldPDF, select the pages you want to extract, then click "Split". Each selected page downloads as its own PDF file instantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I merge multiple PDFs into one?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Upload all the PDFs you want to combine, optionally reorder pages by dragging them (Pro), then click "Merge". The combined PDF downloads immediately.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the Pro plan include?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'FoldPDF Pro is a one-time $5 payment that unlocks unlimited PDFs and pages, drag-and-drop page reordering, and priority processing.',
          },
        },
      ],
    },
  ],
}

/* ─── Root Layout ────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${_inter.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}

        {/* ── Google Analytics (GA4) ──────────────────────────────────────
            ADMIN: Measurement ID is G-DJJ8DH7V93
            To disable in dev, wrap with: if (process.env.NODE_ENV === 'production')
        ────────────────────────────────────────────────────────────────── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DJJ8DH7V93"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DJJ8DH7V93', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* ── Smartlook Session Recording ─────────────────────────────────
            ADMIN: Project key is 454af33c5257d4aded20a39d4238ff22cb7943b7
            Region: EU. Disable by removing these two Script blocks.
        ────────────────────────────────────────────────────────────────── */}
        <Script id="smartlook-init" strategy="afterInteractive">
          {`
            window.smartlook||(function(d) {
              var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
              var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
              c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';h.appendChild(c);
            })(document);
            smartlook('init', '454af33c5257d4aded20a39d4238ff22cb7943b7', { region: 'eu' });
          `}
        </Script>
      </body>
    </html>
  )
}

