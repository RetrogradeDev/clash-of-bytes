"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import Image from "next/image";
import { LogOutIcon, SettingsIcon, User2Icon } from "lucide-react";

const ProfileDropdown = ({
	name,
	userName,
}: {
	name: string;
	userName: string;
}) => {
	return (
		<div className="relative group">
			<div
				className="cursor-pointer flex items-center space-x-2 p-4 group-hover:bg-[#212121] hover:bg-[#212121]"
				tabIndex={0}
				aria-haspopup="true"
			>
				<span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
					<span className="text-white font-bold">
						{name.charAt(0).toUpperCase()}
					</span>
				</span>
				<span className="text-sm text-gray-400">{name}</span>
			</div>
			<div className="hidden group-hover:block group-focus-within:block absolute top-16 right-0 w-48 bg-[#212121] rounded-none rounded-bl-lg shadow-xl border-l border-b border-gray-600 z-50">
				<div className="py-2">
					<Link
						href={`/profile/${userName}`}
						className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
					>
						<User2Icon className="w-4 h-4 mr-2" />
						Profile
					</Link>
					<Link
						href="/settings"
						className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
					>
						<SettingsIcon className="w-4 h-4 mr-2" />
						Settings
					</Link>
					<button
						className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 w-full text-left"
						onClick={() => signOut()}
					>
						<LogOutIcon className="w-4 h-4 mr-2" />
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
};

export function Navbar() {
	const { data: session, isPending } = useSession();

	return (
		<nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
			<div className="w-full">
				<div className="flex items-center justify-between h-16">
					<Link
						href="/"
						className="text-white hidden md:flex items-center space-x-2"
					>
						<Image
							src="/web-app-manifest-192x192.png"
							alt="Clash of Bytes"
							width={32}
							height={32}
							className="rounded-md"
						/>
						<span className="text-2xl font-bold">Clash of Bytes</span>
					</Link>

					{/* Desktop navigation */}
					<div className="hidden md:flex items-center space-x-6">
						<Link
							href="/puzzles"
							className="text-white/80 hover:text-white transition-colors"
						>
							Puzzles
						</Link>
						<Link
							href="/submit"
							className="text-white/80 hover:text-white transition-colors"
						>
							Submit Puzzle
						</Link>
						<Link
							href="/leaderboard"
							className="text-white/80 hover:text-white transition-colors"
						>
							Leaderboard
						</Link>
					</div>
					{/* Mobile navigation */}
					<div className="md:hidden group">
						<div
							className="text-white/80 hover:text-white transition-colors p-6"
							aria-label="Toggle menu"
							aria-haspopup="true"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</div>

						<div className="hidden group-focus-within:block group-hover:block absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-white/10 p-4 space-y-4">
							<Link
								href="/"
								className="block text-white/80 hover:text-white transition-colors py-2"
							>
								Home
							</Link>
							<Link
								href="/puzzles"
								className="block text-white/80 hover:text-white transition-colors py-2"
							>
								Puzzles
							</Link>
							<Link
								href="/submit"
								className="block text-white/80 hover:text-white transition-colors py-2"
							>
								Submit Puzzle
							</Link>
							<Link
								href="/leaderboard"
								className="block text-white/80 hover:text-white transition-colors py-2"
							>
								Leaderboard
							</Link>
						</div>
					</div>

					<div className="flex items-center space-x-4">
						{isPending ? (
							<div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
						) : session ? (
							<ProfileDropdown
								name={session.user.name}
								userName={session.user.username!}
							/>
						) : (
							<div className="flex items-center space-x-2">
								<Link
									href={`/auth/signin?redirect=${window.location.pathname}`}
									className="text-white/80 hover:text-white transition-colors"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
