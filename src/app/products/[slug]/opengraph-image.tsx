import { ImageResponse } from 'next/og';
import { getProductBySlug } from '@/lib/data/products';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const title = product?.title || 'Wefik World Digital Product';
  const tagline = product?.tagline || 'Production-ready code and commercial licensing.';
  const price = product?.is_free
    ? 'FREE'
    : `₹${((product?.price_inr || 0) / 100).toLocaleString('en-IN')}`;

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
          padding: '70px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#4F741B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A3E635',
                fontSize: '28px',
                fontWeight: 900,
              }}
            >
              W
            </div>
            <span style={{ color: '#FFFFFF', fontSize: '30px', fontWeight: 800 }}>
              wefik<span style={{ color: '#4F741B' }}>.world</span>
            </span>
          </div>

          <div
            style={{
              background: '#4F741B',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: '14px',
              fontSize: '26px',
              fontWeight: 800,
            }}
          >
            {price}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '52px',
              fontWeight: 900,
              lineHeight: 1.15,
              maxWidth: '960px',
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p style={{ color: '#A0AEC0', fontSize: '24px', maxWidth: '850px', margin: 0 }}>
            {tagline}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: '#A3E635',
            fontSize: '18px',
            fontWeight: 700,
            borderTop: '1px solid #333',
            paddingTop: '20px',
            width: '100%',
          }}
        >
          <span>100% Human-Written</span>
          <span>•</span>
          <span>Commercial License</span>
          <span>•</span>
          <span>Instant Download</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
