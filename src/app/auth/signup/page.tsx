"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState } from "react";
import { AtomIcon } from "lucide-react";

import { signUp } from "@/lib/auth-client";
import { SocialAuthButtons } from "@/components/social-auth";
import { useForm } from "react-hook-form";

interface IFormValues {
	username: string;
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export default function SignUpPage() {
	const {
		register,
		handleSubmit,
		setError,
		getValues,
		formState: { errors },
	} = useForm<IFormValues>();
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	const submitHandler = async (data: IFormValues) => {
		setIsLoading(true);

		if (data.password !== data.confirmPassword) {
			setError("confirmPassword", {
				type: "manual",
				message: "Passwords do not match",
			});
			setIsLoading(false);
			return;
		}

		try {
			await signUp.email(
				{
					email: data.email,
					password: data.password,
					username: data.username,
					name: data.name,
				},
				{
					onSuccess: () => {
						router.push("/");
						setTimeout(() => {
							window.location.href = "/";
						}, 500);
					},
					onError: (ctx) => {
						setError("root", { type: "manual", message: ctx.error.message });
					},
				},
			);
		} catch (error) {
			setError("root", {
				type: "manual",
				message: "An unexpected error occurred",
			});
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
					<form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
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
								{...register("username", {
									required: "Username is required",
									minLength: {
										value: 3,
										message: "Username must be at least 3 characters",
									},
									maxLength: {
										value: 20,
										message: "Username cannot exceed 20 characters",
									},
									pattern: {
										value: /^[a-zA-Z0-9_]+$/,
										message:
											"Username can only contain letters, numbers, and underscores",
									},
								})}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="johndoe"
							/>
							{errors.username && (
								<p className="text-red-400 text-sm mt-1">
									{errors.username.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-white mb-2"
							>
								Display Name
							</label>
							<input
								id="name"
								type="text"
								{...register("name", {
									required: "Display name is required",
									minLength: {
										value: 2,
										message: "Display name must be at least 2 characters",
									},
									maxLength: {
										value: 50,
										message: "Display name cannot exceed 50 characters",
									},
								})}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="John Doe"
							/>
							{errors.name && (
								<p className="text-red-400 text-sm mt-1">
									{errors.name.message}
								</p>
							)}
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
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
										message: "Invalid email address",
									},
								})}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="johndoe@example.com"
							/>
							{errors.email && (
								<p className="text-red-400 text-sm mt-1">
									{errors.email.message}
								</p>
							)}
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
								{...register("password", {
									required: "Password is required",
									minLength: {
										value: 6,
										message: "Password must be at least 6 characters",
									},
									maxLength: {
										value: 100,
										message: "Password cannot exceed 100 characters",
									},
								})}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Create a password"
							/>
							{errors.password && (
								<p className="text-red-400 text-sm mt-1">
									{errors.password.message}
								</p>
							)}
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
								{...register("confirmPassword", {
									required: "Confirm Password is required",
									validate: (value) => {
										const password = getValues("password");
										return value === password || "Passwords do not match";
									},
								})}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								placeholder="Confirm your password"
							/>
							{errors.confirmPassword && (
								<p className="text-red-400 text-sm mt-1">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						{errors.root && (
							<div className="text-red-400 text-sm text-center">
								{errors.root.message}
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-lg font-semibold transition-colors"
						>
							{isLoading ? "Creating Account..." : "Create Account"}
						</button>
					</form>

					<SocialAuthButtons />

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
