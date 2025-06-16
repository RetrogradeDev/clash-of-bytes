import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type PuzzleWithDetails = {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	author: {
		username: string;
	};
	solutions: Array<{
		charCount: number;
		user: {
			username: string;
		};
	}>;
	votes: Array<{ id: string }>;
};

interface PuzzleCardProps {
	puzzle: PuzzleWithDetails;
	featured?: boolean;
}

export function PuzzleCard({ puzzle, featured = false }: PuzzleCardProps) {
	const bestSolution = puzzle.solutions[0];

	return (
		<div
			className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border transition-all hover:bg-white/15 hover:scale-105 ${
				featured
					? "border-yellow-400/50 shadow-lg shadow-yellow-400/20"
					: "border-white/20"
			}`}
		>
			{featured && (
				<div className="flex items-center justify-center mb-4">
					<span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
						⭐ Featured
					</span>
				</div>
			)}

			<div className="space-y-4">
				<div>
					<h3 className="text-xl font-bold text-white mb-2">{puzzle.title}</h3>
					<p className="text-white/70 text-sm line-clamp-3">
						{puzzle.description.slice(0, 150)}
						{puzzle.description.length > 150 && "..."}
					</p>
				</div>

				<div className="flex items-center justify-between text-sm text-white/60">
					<span>by @{puzzle.author.username}</span>
					<span>
						{formatDistanceToNow(puzzle.createdAt, { addSuffix: true })}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4 text-sm">
						<span className="flex items-center space-x-1 text-purple-300">
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
							<span>{puzzle.votes.length}</span>
						</span>

						{bestSolution && (
							<span className="flex items-center space-x-1 text-green-300">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>
									{bestSolution.charCount} chars by @
									{bestSolution.user.username}
								</span>
							</span>
						)}
					</div>

					<Link
						href={`/puzzles/${puzzle.id}`}
						className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
					>
						Solve
					</Link>
				</div>
			</div>
		</div>
	);
}
