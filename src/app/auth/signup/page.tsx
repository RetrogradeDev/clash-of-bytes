"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState } from "react";
import { AtomIcon } from "lucide-react";

import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (!username || !email || !password || !confirmPassword) {
			setError("All fields are required");
			setIsLoading(false);
			return;
		}

		if (username.length < 3 || username.length > 20) {
			setError("Username must be between 3 and 20 characters");
			setIsLoading(false);
			return;
		}

		if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
			setError(
				"Username can only contain letters, numbers, dots, underscores, and hyphens",
			);
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const result = await signUp.email(
				{ email, password, name: username },
				{
					onSuccess: () => {
						router.push("/");
					},
					onError: (ctx) => {
						setError(ctx.error.message);
					},
				},
			);
		} catch (error) {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="min-h-[70vh] flex items-center justify-center">
				<div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 w-full max-w-md">
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<AtomIcon className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">
							Join the Arena
						</h1>
						<p className="text-purple-300">
							Create your account to start solving puzzles
						</p>
					</div>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-white mb-2"
							>
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Choose a username"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-white mb-2"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Enter your email"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-white mb-2"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Create a password"
							/>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-white mb-2"
							>
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Confirm your password"
							/>
						</div>

						{error && (
							<div className="text-red-400 text-sm text-center">{error}</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-lg font-semibold transition-colors"
						>
							{isLoading ? "Creating Account..." : "Create Account"}
						</button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-white/60">
							Already have an account?{" "}
							<Link
								href="/auth/signin"
								className="text-purple-400 hover:text-purple-300 font-semibold"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
