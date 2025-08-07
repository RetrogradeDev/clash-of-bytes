"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { id, se } from "date-fns/locale";
import { CatIcon, Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState, use } from "react";
import {
	FieldError,
	SubmitHandler,
	useForm,
	UseFormRegister,
} from "react-hook-form";

interface IFormValues {
	username: string;
	name: string;
	email: string;
}

const InputField = ({
	id,
	label,
	register,
	registerProps,
	error,
	...props
}: {
	id: "username" | "name" | "email";
	label: string;
	register: UseFormRegister<IFormValues>;
	error?: string;
	registerProps: {
		required?: boolean;
		readOnly?: boolean;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	};
} & React.InputHTMLAttributes<HTMLInputElement>) => {
	return (
		<div className="mb-4">
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-purple-400 read-only:text-gray-500 read-only:cursor-not-allowed read-only:focus:border-gray-500"
				{...register(id, registerProps)}
				{...props}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
			{registerProps.readOnly && (
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

const makeErrorVerbose = (error?: FieldError) => {
	if (!error) return "";

	const errorTarget = error.ref?.id || error.ref?.name || "field";

	switch (error.type) {
		case "required":
			return "This field is required.";
		case "minLength":
			const minLength = 3; // TODO: Find form validation minLength
			return `Minimum length is ${minLength} characters.`;
		case "maxLength":
			const maxLength = 20; // TODO: Find form validation maxLength
			return `Maximum length is ${maxLength} characters.`;
		case "pattern":
			if (errorTarget === "username")
				return "Username can only contain letters, numbers, and underscores.";
			return "Invalid format.";
		default:
			return error.message || "An unexpected error occurred.";
	}
};

export default function Settings() {
	const { data: session } = useSession();
	const router = useRouter();
	const [linkedAccounts, setLinkedAccounts] = useState<
		{ provider: string; id: string; createdAt: Date }[]
	>([]);
	const [dialog, setDialog] = useState<React.ReactNode | null>(null);

	const {
		register,
		formState: { errors },
		setError,
		setValue,
		handleSubmit,
	} = useForm<IFormValues>({
		mode: "onBlur",
		criteriaMode: "all",
		reValidateMode: "onBlur",
		defaultValues: {
			username: session?.user.username || "",
			name: session?.user.name || "",
			email: session?.user.email || "",
		},
	});

	const onSubmit: SubmitHandler<IFormValues> = async (data) => {
		await saveChanges(data);
	};

	const [isLoading, setIsLoading] = useState(false);

	const saveChanges = async (data: IFormValues) => {
		if (!session) return;
		setIsLoading(true);

		let toUpdate: { username?: string; name?: string } = {};
		if (!errors.username && data.username !== session.user.username) {
			toUpdate.username = data.username;
		}
		if (!errors.name && data.name !== session.user.name) {
			toUpdate.name = data.name;
		}

		const result = await authClient.updateUser(toUpdate);

		setIsLoading(false);

		console.log("result", result);
		if (result.error) {
			if (toUpdate.username && toUpdate.name) {
				// Retry both
				let result = await authClient.updateUser({
					name: toUpdate.name,
				});

				if (result.error) {
					setError("name", {
						type: "manual",
						message:
							result.error.message || "An error occurred while saving changes.",
					});
				}

				result = await authClient.updateUser({
					username: toUpdate.username,
				});

				if (result.error) {
					setError("username", {
						type: "manual",
						message:
							result.error.message || "An error occurred while saving changes.",
					});
				}
			} else if (toUpdate.username) {
				setError("username", {
					type: "manual",
					message:
						result.error.message || "An error occurred while saving changes.",
				});
			} else if (toUpdate.name) {
				setError("name", {
					type: "manual",
					message:
						result.error.message || "An error occurred while saving changes.",
				});
			}

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

			setValue("username", session.user.username!);
			setValue("name", session.user.name);
			setValue("email", session.user.email);

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

	if (!session) {
		return null;
	}

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<h1 className="text-2xl font-bold mb-2">Account</h1>
				<InputField
					label="Username"
					id="username"
					type="text"
					placeholder="johndoe"
					register={register}
					error={makeErrorVerbose(errors.username)}
					registerProps={{
						required: true,
						minLength: 3,
						maxLength: 20,
						pattern: /^[a-zA-Z0-9_]+$/,
					}}
				/>
				<InputField
					label="Display Name"
					id="name"
					type="text"
					placeholder="John Doe"
					register={register}
					error={makeErrorVerbose(errors.name)}
					registerProps={{
						required: true,
						minLength: 3,
						maxLength: 20,
					}}
				/>
				<InputField
					label="Email"
					id="email"
					type="email"
					readOnly
					register={register}
					registerProps={{ readOnly: true }}
				/>

				<button
					type="submit"
					className="px-4 py-2 mb-6 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded"
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
			</form>
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

			{dialog && dialog}
		</div>
	);
}
