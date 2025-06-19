import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { PuzzleContent } from "@/components/puzzle-content";
import { VoteButton } from "@/components/vote-button";
import { PuzzleLeaderboard } from "@/components/puzzle-leaderboard";
import { Card } from "@/components/card";

import { formatDistanceToNow } from "date-fns";
import { StarIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

async function getPuzzle(id: string): Promise<PublicPuzzle | null> {
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
					score: "asc",
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

	// @ts-expect-error
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

async function getUserSolutions(
	puzzleId: string,
	userId?: string,
): Promise<Solution[] | null> {
	if (!userId) return null;

	return await prisma.solution.findMany({
		where: {
			puzzleId,
			userId,
		},
		select: {
			id: true,
			score: true,
			language: true,
			code: true,
			userId: true,
			user: {
				select: {
					name: true,
				},
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

	const [userVote, userSolutions] = await Promise.all([
		getUserVote(puzzle.id, session?.user?.id),
		getUserSolutions(puzzle.id, session?.user?.id),
	]);

	if (userSolutions && userSolutions.length > 2) {
		// Somehow the user submitted solutions for 3+ languages, while we only have 2
		userSolutions.splice(2);
	}
	return (
		<div className="max-w-6xl mx-auto">
			<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20 mx-4 mt-8">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h1 className="text-4xl font-bold text-white mb-2">
								{puzzle.title}{" "}
								<span className="text-gray-400 text-sm italic">
									({puzzle.mode})
								</span>
							</h1>
							<div className="flex items-center space-x-4 text-sm text-purple-300">
								<span>
									by{" "}
									<Link
										className="text-purple-400 hover:text-purple-300 underline"
										href={`/profile/${puzzle.author.name}`}
									>
										@{puzzle.author.name}
									</Link>
								</span>
								<span>•</span>
								<span>
									{formatDistanceToNow(puzzle.createdAt, { addSuffix: true })}
								</span>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							{puzzle.featuredDate && (
								<span className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
									<StarIcon className="w-4 h-4" /> Featured
								</span>
							)}
							<VoteButton
								puzzleId={puzzle.id}
								initialVoted={!!userVote}
								initialCount={puzzle.votes.length}
								disabled={!session}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 py-8 space-y-8">
				<Card>
					<h2 className="text-xl font-bold text-white mb-4">📝 Description</h2>
					<div className="prose prose-invert max-w-none">
						<div className="whitespace-pre-wrap text-gray-300">
							<ReactMarkdown>{puzzle.description}</ReactMarkdown>
						</div>
					</div>
				</Card>

				<div className="grid md:grid-cols-2 gap-6">
					<Card>
						<h2 className="text-xl font-bold text-white mb-4">📥 Input</h2>
						<div className="whitespace-pre-wrap text-gray-300 font-mono text-sm mb-4">
							Type: {puzzle.inputFormat}
						</div>
						<div className="text-gray-300 prose prose-invert prose-sm">
							<ReactMarkdown>{puzzle.inputDescription}</ReactMarkdown>
						</div>
					</Card>

					<Card>
						<h2 className="text-xl font-bold text-white mb-4">📤 Output</h2>
						<div className="whitespace-pre-wrap text-gray-300 font-mono text-sm mb-4">
							Type: {puzzle.outputFormat}
						</div>
						<div className="text-gray-300 prose prose-invert prose-sm">
							<ReactMarkdown>{puzzle.outputDescription}</ReactMarkdown>
						</div>
					</Card>
				</div>

				<Card>
					<h2 className="text-xl font-bold text-white mb-4">
						🧪 Sample Test Cases
					</h2>
					<div className="space-y-4">
						{(puzzle.testCases as Array<{ input: string; output: string }>)
							.slice(0, 2)
							.map((testCase, index) => (
								<div
									key={index}
									className="bg-gray-900/50 border border-gray-600 rounded-lg p-4"
								>
									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<h3 className="text-white font-semibold mb-2">Input:</h3>
											<pre className="text-gray-300 font-mono text-sm bg-gray-800 p-2 rounded border border-gray-600">
												{testCase.input}
											</pre>
										</div>
										<div>
											<h3 className="text-white font-semibold mb-2">Output:</h3>
											<pre className="text-gray-300 font-mono text-sm bg-gray-800 p-2 rounded border border-gray-600">
												{testCase.output}
											</pre>
										</div>
									</div>
								</div>
							))}
						{(puzzle.testCases as Array<any>).length > 2 && (
							<p className="text-gray-400 text-sm text-center">
								+ {(puzzle.testCases as Array<any>).length - 2} more test cases
								will be used for validation
							</p>
						)}
					</div>
				</Card>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<PuzzleContent
							puzzle={puzzle}
							userSolutions={userSolutions}
							isAuthenticated={!!session}
						/>
					</div>

					<PuzzleLeaderboard
						solutions={puzzle.solutions}
						userSolutions={userSolutions}
						session={session}
					/>
				</div>
			</div>
		</div>
	);
}
