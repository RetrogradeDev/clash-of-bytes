import { signIn } from "@/lib/auth-client";
import Image from "next/image";

export const OAuthButton = ({
	name,
	provider,
	image,
}: {
	name: string;
	provider: "slack" | "github";
	image: string;
}) => {
	return (
		<button
			type="button"
			onClick={() => signIn.social({ provider })}
			className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition w-full bg-gray-800/90 hover:bg-gray-800 border-2 border-gray-700 hover:border-gray-600"
		>
			<Image src={image} alt={name} width={24} height={24} />
			<span>{name}</span>
		</button>
	);
};

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
			<OAuthButton name="GitHub" provider="github" image="/github.svg" />
			<OAuthButton name="Slack" provider="slack" image="/slack.svg" />
		</div>
	);
};
