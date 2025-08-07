import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { username } from "better-auth/plugins";

const generateUsername = (name: string) => {
	return `${name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.slice(0, 16)}_${Math.floor(Math.random() * 1000)}`;
};

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	plugins: [
		username({
			minUsernameLength: 3,
			maxUsernameLength: 20,
			usernameValidator: (username) => {
				return /^[a-zA-Z0-9._-]+$/.test(username);
			},
		}),
	],
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["slack", "github"],
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	socialProviders: {
		slack: {
			clientId: process.env.SLACK_CLIENT_ID!,
			clientSecret: process.env.SLACK_CLIENT_SECRET!,
			team: "T0266FRGM",
			mapProfileToUser: (profile) => {
				const username = generateUsername(
					profile.name || profile.display_name || "user",
				);

				return {
					username,
					displayUsername: username,
				};
			},
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			mapProfileToUser: (profile) => {
				const username = generateUsername(profile.login || "user");

				return {
					username,
					displayUsername: username,
				};
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
	},
});

export type Session = typeof auth.$Infer.Session;
