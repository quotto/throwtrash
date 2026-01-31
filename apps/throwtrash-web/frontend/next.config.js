/** @type {import('next').NextConfig} */
const path = require("path");
const frontendStage = process.env.FRONTEND_STAGE || '';
const basePath = frontendStage ? `/${frontendStage}` : '';

const nextConfig = {
    output: 'export',
    basePath,
    assetPrefix: basePath || undefined,
    trailingSlash: true,
    turbopack: {
        root: path.resolve(__dirname, "../../..")
    }
};

module.exports = nextConfig;
