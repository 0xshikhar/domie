import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domainName = params.domain;

  // TODO: Fetch actual domain data
  const domain = {
    name: domainName,
    price: '2.5',
    currency: 'ETH',
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          />
          <span
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Domie
          </span>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
          }}
        >
          {/* Domain Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 24,
            }}
          >
            {domain.name}
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 24,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: '#3b82f6',
                fontWeight: 600,
              }}
            >
              Premium Domain
            </span>
          </div>

          {/* Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {domain.price}
            </span>
            <span
              style={{
                fontSize: 36,
                color: '#9ca3af',
              }}
            >
              {domain.currency}
            </span>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 40,
              padding: '16px 48px',
              backgroundColor: '#3b82f6',
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 600,
              color: 'white',
            }}
          >
            View on Domie
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            color: '#6b7280',
            fontSize: 18,
          }}
        >
          <span>✓ Verified Owner</span>
          <span>•</span>
          <span>✓ Instant Transfer</span>
          <span>•</span>
          <span>✓ Secure Purchase</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
