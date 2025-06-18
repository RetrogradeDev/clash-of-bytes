import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
	CheckCircle2Icon,
	ClockIcon,
	StarIcon,
	TrophyIcon,
} from "lucide-react";

type PuzzleWithDetails = {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	author: {
		name: string;
	};
	solutions: Array<{
		charCount: number;
		user: {
			name: string;
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
					<span className="flex items-center bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
						<StarIcon className="size-4 mr-1" /> Featured
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
					<span>by @{puzzle.author.name}</span>
					<span className="flex items-center">
						<ClockIcon className="size-4 mr-2" />
						{formatDistanceToNow(puzzle.createdAt, { addSuffix: true })}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4 text-sm">
						<span className="flex items-center space-x-1 text-purple-300">
							<StarIcon className="w-4 h-4" strokeWidth={2} />
							<span>{puzzle.votes.length}</span>
						</span>

						<span className="flex items-center space-x-1 text-blue-300">
							<CheckCircle2Icon className="w-4 h-4" strokeWidth={2} />
							<span>{puzzle.solutions.length}</span>
						</span>

						{bestSolution && (
							<span className="flex items-center space-x-1 text-green-300">
								<TrophyIcon className="w-4 h-4" strokeWidth={2} />
								<span>{bestSolution.charCount} chars</span>
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
