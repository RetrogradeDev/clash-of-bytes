import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	socialProviders: {
		slack: {
			clientId: process.env.SLACK_CLIENT_ID!,
			clientSecret: process.env.SLACK_CLIENT_SECRET!,
			team: "T0266FRGM",
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
	},
});

export type Session = typeof auth.$Infer.Session;
