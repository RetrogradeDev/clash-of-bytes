import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import {
	CheckCircle2Icon,
	ClockIcon,
	StarIcon,
	TrophyIcon,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

async function getUserData(username: string): Promise<{
	name: string;
	createdAt: Date;
	puzzles: {
		id: string;
		mode: string; //"chars" | "runtime";
		title: string;
		description: string;
		createdAt: Date;
		votes: {
			id: string;
		}[];
		solutions: {
			score: number;
			user: {
				name: string;
			};
		}[];
	}[];
	solutions: {
		score: number;
		puzzle: {
			id: string;
			title: string;
			mode: string; //"chars" | "runtime";
		};
	}[];
} | null> {
	const user = await prisma.user.findUnique({
		where: { name: username },
		select: {
			name: true,
			createdAt: true,
			puzzles: {
				select: {
					id: true,
					title: true,
					description: true,
					createdAt: true,
					votes: true,
					mode: true,
					solutions: {
						select: {
							score: true,
							user: {
								select: {
									name: true,
								},
							},
						},
						orderBy: {
							score: "asc",
						},
					},
				},
			},
			solutions: {
				select: {
					score: true,
					puzzle: {
						select: {
							id: true,
							title: true,
							mode: true,
						},
					},
				},
			},
		},
	});

	return user;
}

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	const user = await getUserData(username);

	return (
		<div className="max-w-3xl mx-auto p-6">
			{user ? (
				<div className="space-y-8">
					<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
						<div className="flex items-center space-x-6">
							<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
								<span className="text-2xl font-bold text-white">
									{user.name.charAt(0).toUpperCase()}
								</span>
							</div>
							<div>
								<h1 className="text-4xl font-bold text-white mb-2">
									{user.name}
								</h1>
								<p className="text-purple-300">
									<ClockIcon className="inline size-4 mr-1" />
									Joined{" "}
									{formatDistanceToNow(user.createdAt, { addSuffix: true })}
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
							<h3 className="text-lg font-semibold text-white mb-2">
								Puzzles Created
							</h3>
							<p className="text-3xl font-bold text-purple-400">
								{user.puzzles.length}
							</p>
						</div>
						<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
							<h3 className="text-lg font-semibold text-white mb-2">
								Total Solutions
							</h3>
							<p className="text-3xl font-bold text-blue-400">
								{user.puzzles.reduce(
									(total, puzzle) => total + puzzle.solutions.length,
									0,
								)}
							</p>
						</div>
						<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
							<h3 className="text-lg font-semibold text-white mb-2">
								Best Score
							</h3>
							<p className="text-3xl font-bold text-green-400">
								{user.solutions.length > 0
									? (() => {
											const allSolutions = user.solutions;
											const bestSolution = allSolutions.reduce(
												(best, current) =>
													current.score < best.score ? current : best,
											);
											return `${bestSolution.score} ${
												bestSolution.puzzle.mode === "chars" ? "chars" : "ms"
											}`;
									  })()
									: "N/A"}
							</p>
						</div>
					</div>

					<div className="space-y-6">
						<h2 className="text-2xl font-bold text-white">Created Puzzles</h2>
						{user.puzzles.length > 0 ? (
							<div className="grid gap-6">
								{user.puzzles.map((puzzle) => (
									<Link
										href={`/puzzles/${puzzle.id}`}
										key={puzzle.id}
										className="bg-gray-900/30 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
									>
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3 className="text-xl font-semibold text-white mb-2">
													{puzzle.title}
												</h3>
												<p className="text-gray-300 text-sm">
													{puzzle.description}
												</p>
											</div>
											<span className="text-sm text-gray-400">
												<ClockIcon className="inline size-4 mr-1" />
												{formatDistanceToNow(puzzle.createdAt, {
													addSuffix: true,
												})}
											</span>
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												<span className="text-sm text-purple-300 flex items-center">
													<StarIcon className="size-4 mr-1" fill="none" />
													{puzzle.votes.length}
												</span>
												<span className="text-sm text-blue-300 flex items-center">
													<CheckCircle2Icon className="size-4 mr-1" />
													{puzzle.solutions.length} solution
													{puzzle.solutions.length !== 1 ? "s" : ""}
												</span>
											</div>
											{puzzle.solutions.length > 0 && (
												<span className="text-sm text-green-300 flex items-center">
													<TrophyIcon className="size-4 mr-1" />
													Best:{" "}
													{Math.min(
														...puzzle.solutions.map((s) => s.score),
													)}{" "}
													{puzzle.mode === "chars" ? "chars" : "ms"}
												</span>
											)}
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-gray-400 text-2xl">🧩</span>
								</div>
								<p className="text-gray-400">No puzzles created yet</p>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white mb-4">User Not Found</h1>
					<p className="text-white/60">The user "{username}" does not exist.</p>
				</div>
			)}
		</div>
	);
}
