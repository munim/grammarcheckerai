import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_TURNSTILE_ENABLED: process.env.NEXT_PUBLIC_TURNSTILE_ENABLED || 'true',
  },
};

export default nextConfig;
