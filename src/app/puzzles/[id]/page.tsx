import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PuzzleContent } from "@/components/puzzle-content";
import { VoteButton } from "@/components/vote-button";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

async function getPuzzle(id: string): Promise<PublicPuzzle> {
	const puzzle = await prisma.puzzle.findUnique({
		where: { id },
		include: {
			author: {
				select: {
					id: true,
					name: true,
				},
			},
			solutions: {
				include: {
					user: {
						select: {
							name: true,
						},
					},
				},
				orderBy: {
					charCount: "asc",
				},
			},
			votes: {
				include: {
					user: {
						select: {
							id: true,
						},
					},
				},
			},
		},
	});

	return puzzle;
}

async function getUserVote(puzzleId: string, userId?: string) {
	if (!userId) return null;

	return await prisma.vote.findUnique({
		where: {
			puzzleId_userId: {
				puzzleId,
				userId,
			},
		},
	});
}

async function getUserSolution(puzzleId: string, userId?: string) {
	if (!userId) return null;

	return await prisma.solution.findUnique({
		where: {
			puzzleId_userId: {
				puzzleId,
				userId,
			},
		},
	});
}

export default async function PuzzlePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const puzzle = await getPuzzle((await params).id);

	if (!puzzle) {
		notFound();
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const [userVote, userSolution] = await Promise.all([
		getUserVote(puzzle.id, session?.user?.id),
		getUserSolution(puzzle.id, session?.user?.id),
	]);

	const topSolutions = puzzle.solutions.slice(0, 10);
	const userRank = userSolution
		? puzzle.solutions.findIndex((s) => s.userId === session?.user?.id) + 1
		: null;

	return (
		<div className="max-w-6xl mx-auto space-y-8">
			{/* Header */}
			<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-white mb-2">
							{puzzle.title}
						</h1>
						<div className="flex items-center space-x-4 text-sm text-white/60">
							<span>by @{puzzle.author.name}</span>
							<span>•</span>
							<span>
								{formatDistanceToNow(puzzle.createdAt, { addSuffix: true })}
							</span>
							{puzzle.featuredDate && (
								<>
									<span>•</span>
									<span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
										⭐ Featured
									</span>
								</>
							)}
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<VoteButton
							puzzleId={puzzle.id}
							initialVoted={!!userVote}
							initialCount={puzzle.votes.length}
							disabled={!session}
						/>
					</div>
				</div>

				<div className="prose prose-invert max-w-none">
					<div className="whitespace-pre-wrap text-white/80">
						<ReactMarkdown>{puzzle.description}</ReactMarkdown>
					</div>
				</div>
			</div>

			{/* Input/Output Format */}
			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
					<h2 className="text-xl font-bold text-white mb-4">📥 Input</h2>
					<div className="whitespace-pre-wrap text-white/80 font-mono text-sm mb-4">
						Type: {puzzle.inputFormat}
					</div>
					<ReactMarkdown>{puzzle.inputDescription}</ReactMarkdown>
				</div>

				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
					<h2 className="text-xl font-bold text-white mb-4">📤 Output</h2>
					<div className="whitespace-pre-wrap text-white/80 font-mono text-sm mb-4">
						Type: {puzzle.outputFormat}
					</div>
					<ReactMarkdown>{puzzle.outputDescription}</ReactMarkdown>
				</div>
			</div>

			{/* Test Cases Preview */}
			<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
				<h2 className="text-xl font-bold text-white mb-4">
					🧪 Sample Test Cases
				</h2>
				<div className="space-y-4">
					{(puzzle.testCases as Array<{ input: string; output: string }>)
						.slice(0, 2)
						.map((testCase, index) => (
							<div
								key={index}
								className="bg-white/5 border border-white/10 rounded-lg p-4"
							>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<h3 className="text-white font-semibold mb-2">Input:</h3>
										<pre className="text-white/80 font-mono text-sm bg-black/20 p-2 rounded">
											{testCase.input}
										</pre>
									</div>
									<div>
										<h3 className="text-white font-semibold mb-2">Output:</h3>
										<pre className="text-white/80 font-mono text-sm bg-black/20 p-2 rounded">
											{testCase.output}
										</pre>
									</div>
								</div>
							</div>
						))}
					{(puzzle.testCases as Array<any>).length > 2 && (
						<p className="text-white/60 text-sm text-center">
							+ {(puzzle.testCases as Array<any>).length - 2} more test cases
							will be used for validation
						</p>
					)}
				</div>
			</div>

			<div className="grid lg:grid-cols-3 gap-8">
				{/* Code Editor */}
				<div className="lg:col-span-2">
					<PuzzleContent
						puzzle={puzzle}
						userSolution={userSolution}
						isAuthenticated={!!session}
					/>
				</div>

				{/* Leaderboard */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
					<h2 className="text-xl font-bold text-white mb-4">🏆 Leaderboard</h2>

					{userSolution && userRank && (
						<div className="bg-purple-900/50 border border-purple-500/50 rounded-lg p-3 mb-4">
							<div className="text-center">
								<div className="text-purple-300 text-sm">Your Best</div>
								<div className="text-white font-bold text-lg">
									{userSolution.charCount} chars
								</div>
								<div className="text-purple-300 text-sm">Rank #{userRank}</div>
							</div>
						</div>
					)}

					<div className="space-y-3">
						{topSolutions.length > 0 ? (
							topSolutions.map((solution, index) => (
								<div
									key={solution.id}
									className={`flex items-center justify-between p-3 rounded-lg ${
										solution.userId === session?.user?.id
											? "bg-purple-900/50 border border-purple-500/50"
											: "bg-white/5"
									}`}
								>
									<div className="flex items-center space-x-3">
										<span className="text-white font-bold text-lg">
											#{index + 1}
										</span>
										<div>
											<div className="text-white font-semibold">
												@{solution.user.name}
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-white font-bold">
											{solution.charCount}
										</div>
										<div className="text-white/60 text-xs">chars</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center text-white/60 py-4">
								<div className="text-4xl mb-2">🎯</div>
								<p>Be the first to solve this puzzle!</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
