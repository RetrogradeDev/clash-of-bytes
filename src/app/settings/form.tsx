"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { id, se } from "date-fns/locale";
import { CatIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, use } from "react";

const InputField = ({
	label,
	id,
	error,
	...props
}: {
	label: string;
	id: string;
	error: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
	return (
		<div className="mb-4">
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-purple-400 read-only:text-gray-500 read-only:cursor-not-allowed read-only:focus:border-gray-500"
				{...props}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
			{props.readOnly && (
				<p className="text-sm text-gray-500 mt-1">
					This field is read-only and cannot be changed.
				</p>
			)}
		</div>
	);
};

export default function Settings() {
	const { data: session } = useSession();
	const router = useRouter();
	const [linkedAccounts, setLinkedAccounts] = useState<
		{ provider: string; id: string; createdAt: Date }[]
	>([]);

	const [username, setUsername] = useState("");
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [hasChanges, setHasChanges] = useState(false);

	const saveChanges = async () => {
		if (!session) return;

		if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
			setUsernameError(
				"Username can only contain letters, numbers, dots, underscores, and hyphens",
			);
			return;
		}

		const result = await authClient.updateUser({
			name: username,
		});

		console.log("result", result);
		if (result.error) {
			setUsernameError(
				result.error.message || "An error occurred while saving changes.",
			);
			return;
		}

		setHasChanges(false);
		setUsernameError(null);
	};

	// For some reason this is needed
	let redirectId = useRef<number | null>(null);

	// Redirect if not authenticated
	useEffect(() => {
		if (!session) {
			redirectId.current = setTimeout(() => {
				router.push("/auth/signin?redirect=/submit");
			}, 1500) as unknown as number;
		} else {
			console.log(redirectId);
			// Clear redirect if session is available
			if (redirectId.current) {
				clearTimeout(redirectId.current);
				redirectId.current = null;
			}

			setUsername(session.user.name);
			authClient.listAccounts().then((accounts) => {
				if (accounts.error) {
					console.error("Error fetching linked accounts:", accounts.error);
					return;
				}

				setLinkedAccounts(
					accounts.data
						.map((account) => ({
							provider: account.provider,
							id: account.id,
							createdAt: account.createdAt,
						}))
						.filter((account) => account.provider !== "credential"),
				);
			});
		}
	}, [session, router]);

	useEffect(() => {
		// Check if username has changed
		if (session && session.user.name !== username) {
			setHasChanges(true);
		} else {
			setHasChanges(false);
		}
	}, [username, session]);

	if (!session) {
		return null;
	}

	return (
		<div>
			<div>
				<h1 className="text-2xl font-bold mb-2">Account</h1>
				<InputField
					label="Username"
					id="username"
					type="text"
					placeholder="johndoe"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					error={usernameError}
				/>
				<InputField
					label="Email"
					id="email"
					type="email"
					readOnly
					value={session.user.email}
					error={null}
				/>
			</div>
			<div>
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-2xl font-bold">Linked Accounts</h1>
					<button
						type="button"
						className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded transition"
						onClick={() => {
							let accountType = prompt(
								"Enter the account type to link (slack/github):",
							)?.trim();
							// TODO

							if (
								!accountType ||
								(accountType !== "slack" && accountType !== "github")
							) {
								alert(
									"Invalid account type. Please enter 'slack' or 'github'.",
								);
								return;
							}

							authClient
								.linkSocial({ provider: accountType })
								.then((result) => {
									if (result.error) {
										console.error("Error linking account:", result.error);
										alert(
											"An error occurred while linking your account. Please try again later.",
										);
										return;
									}
								});
						}}
					>
						<PlusIcon className="w-4 h-4 inline-block mr-1" />
						Link Account
					</button>
				</div>
				{linkedAccounts.length > 0 ? (
					<ul className="list-disc pl-5 mt-3">
						{linkedAccounts.map((account) => (
							<li
								key={account.provider}
								className="mb-3 flex items-center justify-between bg-white/10 border border-white/20 rounded-lg px-4 py-3"
							>
								<div className="flex items-center gap-3">
									<span className="font-semibold capitalize text-purple-400">
										{account.provider}
									</span>
									<span className="text-gray-300 text-sm">
										Added on{" "}
										{new Date(account.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
								<button
									type="button"
									className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
									onClick={async () => {
										if (
											confirm(
												`Are you sure you want to unlink your ${account.provider} account?`,
											)
										) {
											try {
												const result = await authClient.unlinkAccount({
													providerId: account.provider,
													accountId: account.id,
												});
												if (result.error) {
													throw new Error(result.error.message);
												}

												setLinkedAccounts((prev) =>
													prev.filter(
														(acc) => acc.provider !== account.provider,
													),
												);
											} catch (error) {
												console.error("Error unlinking account:", error);
												alert(
													"An error occurred while unlinking your account. Please try again later.",
												);
											}
										}
									}}
								>
									Unlink
								</button>
							</li>
						))}
					</ul>
				) : (
					<div className="flex flex-col items-center justify-center h-64 bg-white/10 border border-white/20 rounded-lg p-6">
						<CatIcon className="w-16 h-16 text-gray-500 mx-auto mt-10" />
						<h2 className="text-xl font-semibold text-gray-300 text-center mt-5">
							No Linked Accounts
						</h2>
						<p className="text-gray-500 text-center mt-2">
							Start by linking your accounts to enhance your experience.
						</p>
					</div>
				)}
			</div>

			{hasChanges && (
				<div className="fixed bottom-5 left-5 right-5 bg-gray-800 p-4 flex justify-between items-center rounded-xl border border-gray-700">
					<span className="text-white">
						You have unsaved changes to your account settings.
					</span>
					<button
						type="button"
						className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
						onClick={saveChanges}
					>
						Save Changes
					</button>
				</div>
			)}
		</div>
	);
}
