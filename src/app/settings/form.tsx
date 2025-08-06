"use client";

import { authClient, useSession } from "@/lib/auth-client";
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
				<h1 className="text-2xl font-bold">Linked Accounts</h1>
				<span>Comming Soon!</span>
				{/* TODO */}
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
