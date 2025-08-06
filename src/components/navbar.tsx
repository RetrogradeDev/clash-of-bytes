"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LogOutIcon, SettingsIcon, User2Icon } from "lucide-react";

const ProfileDropdown = ({ userName }: { userName: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	const clickHandler = (e: MouseEvent) => {
		if (
			isOpen &&
			!document
				.getElementById("profile-dropdown-button")
				?.contains(e.target as Node)
		) {
			console.log("ew");
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("click", clickHandler);
		return () => {
			document.removeEventListener("click", clickHandler);
		};
	}, [isOpen]);

	return (
		<div className="relative mr-[-1rem]">
			<button
				type="button"
				id="profile-dropdown-button"
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center space-x-2 p-4 ${
					isOpen ? "bg-gray-500/20" : "hover:bg-gray-500/20"
				}`}
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				{/* TODO: add avatar */}
				<span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
					<span className="text-white font-bold">
						{userName.charAt(0).toUpperCase()}
					</span>
				</span>
				<span className="text-sm text-gray-400">@{userName}</span>
			</button>

			{isOpen && (
				<div className="absolute right-0 w-48 bg-gray-500/20 rounded-none rounded-bl-lg shadow-lg border-l border-b border-gray-800">
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
							className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 w-full"
							onClick={() => signOut()}
						>
							<LogOutIcon className="w-4 h-4 mr-2" />
							Sign Out
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session, isPending } = useSession();

	return (
		<nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
			<div className="w-full px-4">
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
					<div className="md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="text-white/80 hover:text-white transition-colors p-2"
							aria-label="Toggle menu"
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
						</button>

						{isOpen && (
							<div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-white/10 p-4 space-y-4">
								<Link
									href="/"
									className="block text-white/80 hover:text-white transition-colors py-2"
									onClick={() => setIsOpen(false)}
								>
									Home
								</Link>
								<Link
									href="/puzzles"
									className="block text-white/80 hover:text-white transition-colors py-2"
									onClick={() => setIsOpen(false)}
								>
									Puzzles
								</Link>
								<Link
									href="/submit"
									className="block text-white/80 hover:text-white transition-colors py-2"
									onClick={() => setIsOpen(false)}
								>
									Submit Puzzle
								</Link>
								<Link
									href="/leaderboard"
									className="block text-white/80 hover:text-white transition-colors py-2"
									onClick={() => setIsOpen(false)}
								>
									Leaderboard
								</Link>
							</div>
						)}
					</div>

					<div className="flex items-center space-x-4">
						{isPending ? (
							<div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
						) : session ? (
							<ProfileDropdown userName={session.user.name} />
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
