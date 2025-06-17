import { prisma } from "@/lib/prisma";
import { PuzzleCard } from "@/components/puzzle-card";
import { SearchAndFilter } from "@/components/search-and-filter";
import { Suspense } from "react";

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
		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{puzzles.map((puzzle) => (
				<PuzzleCard key={puzzle.id} puzzle={puzzle} />
			))}
		</div>
	);
}

export default async function PuzzlesPage({
	searchParams,
}: {
	searchParams: { search?: string };
}) {
	const puzzles = await getPuzzles(searchParams.search);

	return (
		<div className="space-y-8">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold text-white">
					🧩 Programming Puzzles
				</h1>
				<p className="text-white/60 max-w-2xl mx-auto">
					Explore coding challenges from the community. Show off your skills by
					solving them in the fewest characters possible.
				</p>
			</div>

			<Suspense fallback={<div className="text-white">Loading filters...</div>}>
				<SearchAndFilter />
			</Suspense>

			<Suspense fallback={<div className="text-white">Loading puzzles...</div>}>
				<PuzzleGrid puzzles={puzzles} />
			</Suspense>
		</div>
	);
}
