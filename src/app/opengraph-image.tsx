import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'wefik.world — Digital Product Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#202124',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#4F741B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A3E635',
              fontSize: '32px',
              fontWeight: 900,
            }}
          >
            W
          </div>
          <span style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 800 }}>
            wefik<span style={{ color: '#4F741B' }}>.world</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span
            style={{
              color: '#A3E635',
              fontSize: '20px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Curated by Wefik Agency Engineers
          </span>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '60px',
              fontWeight: 900,
              lineHeight: 1.1,
              maxWidth: '900px',
              margin: 0,
            }}
          >
            Production-Grade Themes, Plugins & Codebases for Ambitious Builders
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            color: '#A0AEC0',
            fontSize: '20px',
            borderTop: '1px solid #333',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <span>WordPress Themes</span>
          <span>•</span>
          <span>Performance Plugins</span>
          <span>•</span>
          <span>Next.js Starters</span>
          <span>•</span>
          <span>Commercial Licenses</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
