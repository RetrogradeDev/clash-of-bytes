"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { id, se } from "date-fns/locale";
import { CatIcon, Loader2, PlusIcon } from "lucide-react";
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

const Dialog = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-md">
				{children}
			</div>
		</div>
	);
};

const ConfirmDialog = ({
	title,
	message,
	onConfirm,
	onCancel,
}: {
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}) => {
	return (
		<Dialog>
			<h2 className="text-lg font-bold mb-4">{title}</h2>
			<p className="mb-6">{message}</p>
			<div className="flex justify-end space-x-3">
				<button
					className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
					onClick={onConfirm}
				>
					Confirm
				</button>
			</div>
		</Dialog>
	);
};

const AlertDialog = ({
	title,
	message,
	onConfirm,
}: {
	title: string;
	message: string;
	onConfirm: () => void;
}) => {
	return (
		<Dialog>
			<h2 className="text-lg font-bold mb-4">{title}</h2>
			<p className="mb-6">{message}</p>
			<div className="flex justify-end space-x-3">
				<button
					className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
					onClick={onConfirm}
				>
					OK
				</button>
			</div>
		</Dialog>
	);
};

const OptionDialog = ({
	title,
	message,
	onConfirm,
	onCancel,
	options,
}: {
	title: string;
	message: string;
	onConfirm: (option: string) => void;
	onCancel: () => void;
	options: { label: string; value: string }[];
}) => {
	return (
		<Dialog>
			<h2 className="text-lg font-bold mb-4">{title}</h2>
			<p className="mb-6">{message}</p>
			<div className="flex justify-end space-x-3">
				{options.map((option) => (
					<button
						key={option.value}
						className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
						onClick={() => onConfirm(option.value)}
					>
						{option.label}
					</button>
				))}
				<button
					className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
		</Dialog>
	);
};

export default function Settings() {
	const { data: session } = useSession();
	const router = useRouter();
	const [linkedAccounts, setLinkedAccounts] = useState<
		{ provider: string; id: string; createdAt: Date }[]
	>([]);
	const [dialog, setDialog] = useState<React.ReactNode | null>(null);

	const [username, setUsername] = useState("");
	const [name, setName] = useState("");
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string | null>(null);

	const [hasChanges, setHasChanges] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const saveChanges = async () => {
		if (!session) return;
		setIsLoading(true);
		setUsernameError(null);
		setNameError(null);

		let usernameErr = "";
		let nameErr = "";

		if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
			usernameErr =
				"Username can only contain letters, numbers, dots, underscores, and hyphens";
		}

		if (username.length < 3 || username.length > 20) {
			usernameErr = "Username must be between 3 and 20 characters";
		}

		if (username !== session.user.username) {
			const res = await authClient.isUsernameAvailable({ username });

			if (!res.data?.available) {
				usernameErr = "Username is already taken, please choose another.";
			}
		}

		if (name.trim() === "") {
			nameErr = "Display name cannot be empty.";
		}

		if (name.length < 3 || name.length > 50) {
			nameErr = "Display name must be between 3 and 50 characters.";
		}

		if (usernameErr || nameErr) {
			setUsernameError(usernameErr);
			setNameError(nameErr);
		}

		let toUpdate: { username?: string; name?: string } = {};
		if (!usernameErr) {
			toUpdate.username = username;
		}
		if (!nameErr) {
			toUpdate.name = name;
		}

		const result = await authClient.updateUser(toUpdate);

		setIsLoading(false);
		setHasChanges(false);

		console.log("result", result);
		if (result.error) {
			let error =
				result.error.message || "An error occurred while saving changes.";
			setUsernameError(error.charAt(0).toUpperCase() + error.slice(1)); // some stupid person decided to use lowercase error messages
			setNameError(error.charAt(0).toUpperCase() + error.slice(1));
			return;
		}
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

			setUsername(session.user.username!);
			setName(session.user.name);
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
		if (
			session &&
			(session.user.name !== name || session.user.username !== username)
		) {
			setHasChanges(true);
		} else {
			setHasChanges(false);
		}
	}, [username, name, session]);

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
					label="Display Name"
					id="name"
					type="text"
					placeholder="John Doe"
					value={name}
					onChange={(e) => setName(e.target.value)}
					error={nameError}
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
						onClick={async () => {
							const selectAccountType = () =>
								new Promise<string | null>((resolve) => {
									setDialog(
										<OptionDialog
											title="Link Account"
											message="Select the account type to link:"
											options={[
												{ label: "Slack", value: "slack" },
												{ label: "GitHub", value: "github" },
											]}
											onConfirm={(option) => {
												setDialog(null);
												resolve(option);
											}}
											onCancel={() => {
												setDialog(null);
												resolve(null);
											}}
										/>,
									);
								});

							const accountType = await selectAccountType();

							if (!accountType) {
								return; // User cancelled
							}

							if (accountType !== "slack" && accountType !== "github") {
								setDialog(
									<AlertDialog
										title="Invalid Account Type"
										message="Please enter a valid account type (slack/github)."
										onConfirm={() => setDialog(null)}
									/>,
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
										const confirmUnlink = () =>
											new Promise<boolean>((resolve) => {
												setDialog(
													<ConfirmDialog
														title="Unlink Account"
														message={`Are you sure you want to unlink your ${account.provider} account?`}
														onConfirm={() => {
															setDialog(null);
															resolve(true);
														}}
														onCancel={() => {
															setDialog(null);
															resolve(false);
														}}
													/>,
												);
											});

										const continueUnlink = await confirmUnlink();
										if (continueUnlink) {
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
												setDialog(
													<AlertDialog
														title="Error Unlinking Account"
														message={
															"An error occurred while unlinking your account: " +
															(error as Error).message
														}
														onConfirm={() => setDialog(null)}
													/>,
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
						className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded"
						onClick={saveChanges}
						disabled={isLoading}
					>
						{isLoading ? (
							<span>
								<Loader2 className="w-4 h-4 animate-spin inline-block" />
								<span className="ml-2">Saving...</span>
							</span>
						) : (
							"Save Changes"
						)}
					</button>
				</div>
			)}

			{dialog && dialog}
		</div>
	);
}
