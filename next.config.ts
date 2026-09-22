import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // These pages covered products that are no longer sold, so they used to
    // redirect to product slugs that are now unpublished — a dead end. Send
    // them to the catalogue instead.
    return ['product-heroee8.html', 'product-solar.html', 'product-ev.html', 'product-ems.html']
      .map(source => ({ source: `/${source}`, destination: '/products.html', permanent: true }))
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
