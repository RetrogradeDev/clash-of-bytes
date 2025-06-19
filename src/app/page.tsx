import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { PuzzleCard } from "@/components/puzzle-card";

async function getFeaturedPuzzle(): Promise<PublicPuzzle> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// First try to get today's featured puzzle
	let featuredPuzzle = await prisma.puzzle.findFirst({
		where: {
			featuredDate: today,
		},
		include: {
			author: true,
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
				take: 1,
			},
			votes: true,
		},
	});

	// If no featured puzzle for today, pick the highest voted from the past 3 days
	if (!featuredPuzzle) {
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		const candidatePuzzles = await prisma.puzzle.findMany({
			where: {
				createdAt: {
					gte: threeDaysAgo,
				},
				featuredDate: null,
			},
			include: {
				author: true,
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
					take: 1,
				},
				votes: true,
			},
			orderBy: {
				votes: {
					_count: "desc",
				},
			},
			take: 1,
		});

		if (candidatePuzzles.length > 0) {
			featuredPuzzle = candidatePuzzles[0];
			// Set as today's featured puzzle
			await prisma.puzzle.update({
				where: { id: featuredPuzzle.id },
				data: { featuredDate: today },
			});
		}
	}

	return featuredPuzzle;
}

async function getRecentPuzzles(): Promise<PublicPuzzle[]> {
	return await prisma.puzzle.findMany({
		include: {
			author: true,
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
				take: 1,
			},
			votes: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 6,
	});
}

export default async function Home() {
	const [featuredPuzzle, recentPuzzles] = await Promise.all([
		getFeaturedPuzzle(),
		getRecentPuzzles(),
	]);

	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="space-y-8">
				<div className="mb-8">
					<div className="text-center space-y-6">
						<h1 className="text-5xl font-bold text-white">⚡Clash of Bytes</h1>
						<p className="text-xl text-gray-300 max-w-2xl mx-auto">
							The ultimate code golf platform. Solve programming puzzles in as
							few characters as possible and compete with developers worldwide.
						</p>
						<div className="flex justify-center space-x-4">
							<Link
								href="/puzzles"
								className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
							>
								Browse Puzzles
							</Link>
							<Link
								href="/submit"
								className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-gray-600"
							>
								Submit a Puzzle
							</Link>
						</div>
					</div>
				</div>
			</div>

			{featuredPuzzle && (
				<div className="space-y-6 mt-16">
					<div className="text-center mb-6">
						<h2 className="text-3xl font-bold text-white mb-2">
							🌟 Today's Featured Puzzle
						</h2>
						<p className="text-purple-300">
							The community's favorite challenge
						</p>
					</div>
					<PuzzleCard puzzle={featuredPuzzle} featured />
				</div>
			)}

			<div className="space-y-6 mt-16">
				<div className="text-center mb-6">
					<h2 className="text-3xl font-bold text-white mb-2">Recent Puzzles</h2>
					<p className="text-purple-300">Fresh challenges from the community</p>
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					{recentPuzzles.map((puzzle: any) => (
						<PuzzleCard key={puzzle.id} puzzle={puzzle} />
					))}
				</div>
				<div className="text-center mt-6">
					<Link
						href="/puzzles"
						className="text-purple-400 hover:text-purple-300 font-semibold"
					>
						View all puzzles →
					</Link>
				</div>
			</div>
		</div>
	);
}
