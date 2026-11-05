import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title =
    searchParams.get('title') ||
    'Heavy-Duty UK Steel Stillages, Cantilever Racks & Post Pallets';
  const subtitle =
    searchParams.get('subtitle') ||
    'Engineered in British Box-Section Steel • Certified SWL • Nationwide HGV Pallet Delivery';
  const badge = searchParams.get('badge') || 'DIRECT UK FACTORY STEEL FABRICATION';
  const sku = searchParams.get('sku') || 'UKCA / PUWER 1998';
  const swl = searchParams.get('swl') || '1,000kg–1,500kg SWL';
  const price = searchParams.get('price') || '5%–10% Bulk Trade Tiers';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0F2342',
          color: '#FFFFFF',
          padding: '56px 64px',
          borderBottom: '16px solid #145DA0',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand & Badge Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                backgroundColor: '#145DA0',
                border: '3px solid #F2E3CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '24px',
                color: '#FFFFFF',
              }}
            >
              SSS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#FFFFFF',
                }}
              >
                STILLAGE STORAGE SOLUTIONS
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#F2E3CE',
                  letterSpacing: '0.15em',
                }}
              >
                STILLAGESTORAGESOLUTIONS.CO.UK • BRITISH ENGINEERED STEEL
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#145DA0',
              border: '2px solid #F2E3CE',
              color: '#F2E3CE',
              padding: '8px 18px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </div>
        </div>

        {/* Center Title & Engineering Subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '1020px',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: title.length > 55 ? '48px' : '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFFFFF',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#CBD5E1',
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom Specification Pill Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(255,255,255,0.18)',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: '20px' }}>
            <div
              style={{
                backgroundColor: '#09162B',
                border: '1px solid rgba(242,227,206,0.4)',
                padding: '10px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' }}>
                SPECIFICATION REF
              </span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#F2E3CE' }}>{sku}</span>
            </div>

            <div
              style={{
                backgroundColor: '#09162B',
                border: '1px solid rgba(242,227,206,0.4)',
                padding: '10px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' }}>
                LOAD CAPACITY
              </span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#2DD4BF' }}>{swl}</span>
            </div>

            <div
              style={{
                backgroundColor: '#09162B',
                border: '1px solid rgba(242,227,206,0.4)',
                padding: '10px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' }}>
                ONLINE TRADE PRICING
              </span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{price}</span>
            </div>
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#F2E3CE',
            }}
          >
            Tel: 01978 800 500
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
