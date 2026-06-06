/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:8020/api/:path*`,
      },
    ]
  },
}


module.exports = nextConfig
