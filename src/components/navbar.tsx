"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export function Navbar() {
	const { data: session, isPending } = useSession();

	return (
		<nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="text-2xl font-bold text-white">
						⚡ Clash of Bytes
					</Link>

					{/* Navigation Links */}
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

					{/* Auth Section */}
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
