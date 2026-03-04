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
    // Redirect bare root to /pdf so localhost:3000 doesn't show a blank 404
    async redirects() {
        return [
            {
                source: '/',
                destination: '/pdf',
                basePath: false,
                permanent: false,
            },
        ];
    },
}

export default nextConfig