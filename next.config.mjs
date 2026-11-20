import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    ...(isDevServer
      ? {
          distDir: '.next-dev',
          typescript: {
            tsconfigPath: 'tsconfig.dev.json',
          },
        }
      : {}),
    outputFileTracingRoot: __dirname,
    // Allow Contentful CDN asset images
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.ctfassets.net',
        },
      ],
    },
  };
}
