/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the app at pixel-and-purpose.com/pdf
  basePath: '/pdf',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
