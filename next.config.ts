import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['nodemailer', 'googleapis', 'google-auth-library'],
};

export default nextConfig;
