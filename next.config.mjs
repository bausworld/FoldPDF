/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
    // Set NEXT_PUBLIC_BASE_PATH=/pdf in Netlify env vars for production.
    // Leave unset locally so localhost:3000 works without any prefix.
    basePath,
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

export default nextConfig