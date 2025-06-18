import { prisma } from "@/lib/prisma";
import { PuzzleCard } from "@/components/puzzle-card";
import { SearchAndFilter } from "@/components/search-and-filter";
import { Suspense } from "react";
import { PuzzleIcon } from "lucide-react";

async function getPuzzles(searchTerm?: string) {
	const whereClause = searchTerm
		? {
				OR: [
					{ title: { contains: searchTerm, mode: "insensitive" as const } },
					{
						description: { contains: searchTerm, mode: "insensitive" as const },
					},
				],
		  }
		: {};

	return await prisma.puzzle.findMany({
		where: whereClause,
		include: {
			author: true,
			solutions: {
				select: {
					charCount: true,
					user: {
						select: {
							name: true,
						},
					},
				},
				orderBy: {
					charCount: "asc",
				},
				take: 1,
			},
			votes: true,
		},
		orderBy: [
			{ featuredDate: { sort: "desc", nulls: "last" } },
			{ createdAt: "desc" },
		],
	});
}

function PuzzleGrid({ puzzles }: { puzzles: Awaited<PublicPuzzle[]> }) {
	if (puzzles.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="text-6xl mb-4">🔍</div>
				<h3 className="text-xl font-semibold text-white mb-2">
					No puzzles found
				</h3>
				<p className="text-white/60">
					Try adjusting your search terms or create a new puzzle!
				</p>
			</div>
		);
	}

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{puzzles.map((puzzle) => (
				<PuzzleCard key={puzzle.id} puzzle={puzzle} />
			))}
		</div>
	);
}

export default async function PuzzlesPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string }>;
}) {
	const puzzles = await getPuzzles((await searchParams).q);
	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="space-y-8">
				{/* Header Section */}
				<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
					<div className="text-center">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<PuzzleIcon className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-4xl font-bold text-white mb-2">
							Programming Puzzles
						</h1>
						<p className="text-purple-300">
							Explore coding challenges from the community
						</p>
					</div>
				</div>

				<Suspense
					fallback={<div className="text-white">Loading filters...</div>}
				>
					<SearchAndFilter />
				</Suspense>

				<Suspense
					fallback={<div className="text-white">Loading puzzles...</div>}
				>
					<PuzzleGrid puzzles={puzzles} />
				</Suspense>
			</div>
		</div>
	);
}
