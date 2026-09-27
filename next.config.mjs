/** @type {import('next').NextConfig} */
const nextConfig = { typescript: { ignoreBuildErrors: true }, images: { unoptimized: true }, turbopack: { resolveAlias: { "@": "." } } };
export default nextConfig;
