'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const C = {
  bg: '#FFFFFF',
  accent: '#C9A84C',
  navy: '#102A43',
  muted: '#6B7280',
};

const NAV_LINKS = [
  { href: '/', label: 'Rankings' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/compare', label: 'Compare' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/states', label: 'States' },
  { href: '/mortgage', label: 'Mortgage' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/newsletter', label: 'Newsletter' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: C.bg,
      borderBottom: '1px solid rgba(16,42,67,0.1)',
      boxShadow: '0 2px 12px rgba(16,42,67,0.06)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        height: '56px',
      }}>
        {/* Brand */}
        <Link href="/" style={{
          textDecoration: 'none',
          marginRight: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '17px',
            fontWeight: 700,
            color: C.navy,
            letterSpacing: '-0.3px',
          }}>
            Prefab<span style={{ color: C.accent }}>Intel</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  textDecoration: 'none',
                  padding: '0 14px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? C.accent : C.navy,
                  borderBottom: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = C.accent;
                    (e.currentTarget as HTMLElement).style.borderBottomColor = `${C.accent}66`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = C.navy;
                    (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
                  }
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
