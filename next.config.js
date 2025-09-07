/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: process.env.NODE_ENV !== "production",
  images: {
    remotePatterns: [
      {
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
        hostname:
          process.env.NODE_ENV === "production"
            ? "TalentHive.onrender.com"
            : "localhost",
        port: process.env.NODE_ENV === "production" ? "" : "4003",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
