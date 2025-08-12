import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.slack-edge.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "ca.slack-edge.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
