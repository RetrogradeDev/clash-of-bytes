import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const signInSlack = () => {
	return authClient.signIn.social({
		provider: "slack",
	});
};

export const { signIn, signOut, signUp, useSession } = authClient;
