import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries({
      'product-heroee8.html': 'heroee8-aio',
      'product-solar.html': 'solar-rooftop-industrial',
      'product-ev.html': 'dc-fast-charger-180kw',
      'product-ems.html': '24scloud-ems',
    }).map(([source, slug]) => ({ source: `/${source}`, destination: `/products/${slug}`, permanent: true }))
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ] }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cocmcinqcywqrqdxwdof.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;
