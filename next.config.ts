import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // These pages covered products that are no longer sold, so they used to
    // redirect to product slugs that are now unpublished — a dead end. Send
    // them to the catalogue instead.
    const retired = ['product-heroee8.html', 'product-solar.html', 'product-ev.html', 'product-ems.html']
      .map(source => ({ source: `/${source}`, destination: '/products.html', permanent: true }))
    // The home page lives in a static file at /index.html, but its public URL
    // should be the bare domain. Send /index.html to / so the file name never
    // shows in the address bar — relative "index.html" logo links on every
    // page land here and bounce back to the clean root.
    return [...retired, { source: '/index.html', destination: '/', permanent: true }]
  },
  async rewrites() {
    // Serve that same static home page at / without changing the URL. This is a
    // rewrite, not a redirect, so the bare domain stays clean. (Processed after
    // the redirect above, so / → /index.html here does not re-trigger it — no
    // loop.)
    return [{ source: '/', destination: '/index.html' }]
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
