import { signInSlack } from "@/lib/auth-client";
import Image from "next/image";

export const SlackSigninButton = () => {
	return (
		<button
			type="button"
			onClick={signInSlack}
			className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-white transition w-full bg-gray-800/90 hover:bg-gray-800 border-2 border-gray-700 hover:border-gray-600"
		>
			<Image src="/slack.svg" alt="Slack" width={24} height={24} />
			<span>Slack</span>
		</button>
	);
};
