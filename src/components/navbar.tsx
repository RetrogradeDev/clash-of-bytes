"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session, isPending } = useSession();

	return (
		<nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link
						href="/"
						className="text-2xl font-bold text-white hidden md:block"
					>
						⚡ Clash of Bytes
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
							<div className="flex items-center space-x-4">
								<Link
									href={`/profile/${session.user.name}`}
									className="text-white/80 hover:text-white transition-colors"
								>
									@{session.user.name}
								</Link>
								<button
									onClick={() => signOut()}
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
								>
									Sign Out
								</button>
							</div>
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
