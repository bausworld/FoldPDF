import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'FoldPDF — Free PDF Splitter & Merger | No Uploads, 100% Private'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d1f1f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: '"Inter", system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Teal accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1a8a8a 0%, #13b5b5 100%)',
          }}
        />

        {/* Privacy badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(26, 138, 138, 0.15)',
            border: '1px solid rgba(26, 138, 138, 0.4)',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#1a8a8a',
            }}
          />
          <span style={{ color: '#1a8a8a', fontSize: '18px', letterSpacing: '0.05em' }}>
            100% PRIVATE · NO FILE UPLOADS
          </span>
        </div>

        {/* Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          {/* PDF icon */}
          <div
            style={{
              width: '72px',
              height: '80px',
              background: 'linear-gradient(145deg, #1a8a8a 0%, #0e5e5e 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '18px',
                height: '18px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '3px 0 0 0',
              }}
            />
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>PDF</span>
          </div>
          <span
            style={{
              color: '#ffffff',
              fontSize: '80px',
              fontWeight: 800,
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            FoldPDF
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#a0b8b8',
            fontSize: '32px',
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: '800px',
            marginBottom: '56px',
          }}
        >
          Split, merge, and reorder PDF pages instantly in your browser.
          {' '}
          <span style={{ color: '#ffffff' }}>Free forever.</span>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Split PDFs', 'Merge PDFs', 'Reorder Pages', 'No Uploads', 'Free Tool'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  color: '#c0d4d4',
                  fontSize: '20px',
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '96px',
            color: '#4a6a6a',
            fontSize: '20px',
          }}
        >
          pixel-and-purpose.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
