/** @type {import('next').NextConfig} */
const nextConfig = { typescript: { ignoreBuildErrors: true }, images: { unoptimized: true }, webpack: (config) => { config.resolve.alias['@'] = process.cwd(); return config; } };
export default nextConfig;
