/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const API_URL = process.env.API_URL || 'http://localhost:8459';
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`
      }
    ]
  }
}

export default nextConfig
