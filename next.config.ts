import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/create-payment-intent',
        destination: '/app/create-payment-intent'
      },
      {
        source: '/webhook',
        destination: '/app/webhook'
      }
    ];
  }
}

export default nextConfig 