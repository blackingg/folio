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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      use: [resolve(__dirname, "loaders/glsl-loader.cjs")],
      type: "javascript/auto",
    });
    return config;
  },
};

export default nextConfig;
