import type { Metadata } from "next";
import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { TrophyIcon, StarIcon, CodeIcon, UsersIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
	title: "Clash of Bytes - Leaderboard",
	description: "View the top users and puzzles in Clash of Bytes.",
};

async function getLeaderboardData() {
	const totalUsers = await prisma.user.count();
	const totalPuzzles = await prisma.puzzle.count();

	// Get top solvers by total number of solutions
	const topSolvers = await prisma.user.findMany({
		select: {
			name: true,
			solutions: {
				select: {
					score: true,
					puzzle: {
						select: {
							mode: true,
							title: true,
						},
					},
				},
			},
		},
		orderBy: {
			solutions: {
				_count: "desc",
			},
		},
		take: 10,
	});

	// Get most voted puzzles
	const topPuzzles = await prisma.puzzle.findMany({
		select: {
			id: true,
			title: true,
			description: true,
			createdAt: true,
			mode: true,
			author: {
				select: {
					name: true,
				},
			},
			votes: true,
			solutions: {
				select: {
					score: true,
				},
				orderBy: {
					score: "asc",
				},
			},
		},
		orderBy: {
			votes: {
				_count: "desc",
			},
		},
		take: 5,
	});

	return {
		totalUsers,
		totalPuzzles,
		topSolvers,
		topPuzzles,
	};
}

export default async function LeaderboardPage() {
	const { totalUsers, totalPuzzles, topSolvers, topPuzzles } =
		await getLeaderboardData();

	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="space-y-8">
				<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
					<div className="text-center">
						<div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<TrophyIcon className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-4xl font-bold text-white mb-2">
							🏆 Leaderboard
						</h1>
						<p className="text-purple-300">
							Top performers in the Clash of Bytes arena
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold text-white mb-2">
							<UsersIcon className="inline w-5 h-5 mr-2" />
							Active Users
						</h3>
						<p className="text-3xl font-bold text-purple-400">{totalUsers}</p>
					</div>
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold text-white mb-2">
							<CodeIcon className="inline w-5 h-5 mr-2" />
							Total Puzzles
						</h3>
						<p className="text-3xl font-bold text-blue-400">{totalPuzzles}</p>
					</div>
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold text-white mb-2">
							<StarIcon className="inline w-5 h-5 mr-2" />
							Top Puzzle Votes
						</h3>
						<p className="text-3xl font-bold text-blue-400">
							{topPuzzles[0]?.votes.length || 0}
						</p>
					</div>
				</div>

				<div className="space-y-6">
					<h2 className="text-2xl font-bold text-white">🚀 Top Solvers</h2>
					<div className="space-y-4">
						{topSolvers.map((solver: any, index: number) => (
							<Link
								href={`/profile/${solver.name}`}
								key={solver.name}
								className="bg-gray-900/30 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-colors block"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
												index === 0
													? "bg-gradient-to-br from-yellow-500 to-orange-500"
													: index === 1
													? "bg-gradient-to-br from-gray-400 to-gray-600"
													: index === 2
													? "bg-gradient-to-br from-orange-600 to-yellow-700"
													: "bg-gradient-to-br from-purple-500 to-blue-500"
											}`}
										>
											{index < 3 ? (
												<TrophyIcon className="w-5 h-5" />
											) : (
												index + 1
											)}
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white">
												{solver.name}
											</h3>
											<p className="text-gray-300 text-sm">
												{solver.solutions.length} solutions submitted
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-purple-400 font-semibold">
											{solver.solutions.length > 0
												? (() => {
														const allSolutions = solver.solutions.map(
															(s: any) => {
																const score = s.score;
																const mode = s.puzzle.mode;
																return {
																	score,
																	mode,
																};
															},
														);

														const bestSolution = allSolutions.reduce(
															(best: any, current: any) =>
																current.score < best.score ? current : best,
														);

														return `${bestSolution.score} ${
															bestSolution.mode === "chars" ? "chars" : "ms"
														}`;
												  })()
												: 0}
										</p>
										<p className="text-gray-400 text-sm">best score</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<h2 className="text-2xl font-bold text-white">
						⭐ Community Favorites
					</h2>
					<div className="space-y-4">
						{topPuzzles.map((puzzle: any, index: number) => (
							<Link
								href={`/puzzles/${puzzle.id}`}
								key={puzzle.id}
								className="bg-gray-900/30 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors block"
							>
								<div className="flex justify-between items-start mb-4">
									<div className="flex items-start space-x-4">
										<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
											<span className="text-white font-bold text-sm">
												{index + 1}
											</span>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white mb-2">
												{puzzle.title}
											</h3>
											<p className="text-gray-300 text-sm mb-2">
												{puzzle.description.slice(0, 100)}
												{puzzle.description.length > 100 && "..."}
											</p>
											<p className="text-gray-400 text-sm">
												by {puzzle.author.name} •{" "}
												{formatDistanceToNow(puzzle.createdAt, {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<span className="text-blue-300 flex items-center">
											<StarIcon className="w-4 h-4 mr-1" />
											{puzzle.votes.length} votes
										</span>
									</div>
									{puzzle.solutions.length > 0 && (
										<span className="text-green-300 flex items-center">
											<TrophyIcon className="w-4 h-4 mr-1" />
											Best: {puzzle.solutions[0].score}{" "}
											{puzzle.mode === "chars" ? "chars" : "ms"}
										</span>
									)}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
