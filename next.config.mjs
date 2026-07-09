import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      'three', 
      '@radix-ui/react-icons'
    ],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: [resolve(__dirname, "loaders/glsl-loader.cjs")],
      type: "javascript/auto",
    });

    // `new Worker(new URL(..., import.meta.url))` causes webpack 5 to infer
    // publicPath from import.meta.url, which is undefined in Next.js's bundle
    // context. This produces /_next/undefined chunk URLs. Pin it explicitly.
    if (!isServer) {
      config.output.publicPath = "/_next/";
    }

    return config;
  },
};

export default nextConfig;
