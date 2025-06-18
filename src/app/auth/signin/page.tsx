"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState } from "react";
import { UserLockIcon } from "lucide-react";

import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const result = await signIn.email(
				{ email, password },
				{
					onSuccess: () => {
						const redirectUrl = new URLSearchParams(window.location.search).get(
							"redirect",
						);

						if (redirectUrl) {
							window.location.href = redirectUrl;
						} else {
							router.push("/");
						}
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
							<UserLockIcon className="w-8 h-8 text-white ml-1" />
						</div>
						<h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
						<p className="text-purple-300">Sign in to your account</p>
					</div>
					<form onSubmit={handleSubmit} className="space-y-6">
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
								placeholder="Enter your password"
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
							{isLoading ? "Signing In..." : "Sign In"}
						</button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-white/60">
							Don't have an account?{" "}
							<Link
								href="/auth/signup"
								className="text-purple-400 hover:text-purple-300 font-semibold"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
