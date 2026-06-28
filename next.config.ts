import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img3.restaurantguru.com" },
      { protocol: "https", hostname: "img02.restaurantguru.com" },
      { protocol: "https", hostname: "1014042311.rsc.cdn77.org" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
