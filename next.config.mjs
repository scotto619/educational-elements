/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Personal-use PWA, not linked anywhere on the site — access directly by URL.
      { source: '/dinner-planner', destination: '/dinner-planner/index.html' },
      { source: '/dinner-planner/', destination: '/dinner-planner/index.html' },
    ];
  },
};

export default nextConfig;
