import { SlackSigninButton } from "./slack-signin";

export const SocialAuthButtons = () => {
	return (
		<div className="flex flex-col gap-4 mt-4">
			<div className="flex items-center justify-between">
				<span className="h-0.5 w-full bg-gray-700 rounded-full mx-2" />
				<p className="text-gray-400 text-center whitespace-nowrap">
					Or continue with:
				</p>
				<span className="h-0.5 w-full bg-gray-700 rounded-full mx-2" />
			</div>
			<SlackSigninButton />
		</div>
	);
};
