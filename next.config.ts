// ✅ final next.config.ts (no webpack config)
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "images.pexels.com" },
            { protocol: "https", hostname: "img.clerk.com" },
            { protocol: "https", hostname: "res.cloudinary.com" },
        ],
    },
};

export default nextConfig;
