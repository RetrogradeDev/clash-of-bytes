"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { JavaScriptIcon } from "./icons/javascript";
import { PythonIcon } from "./icons/python";

export function PuzzleLeaderboard({
	solutions,
	userSolution,
	session,
}: {
	solutions: Solution[];
	userSolution?: Solution | null;
	session: {
		user: {
			id: string;
		};
	} | null;
}) {
	const [filter, setFilter] = useState<"all" | "javascript" | "python">("all");
	const [filteredSolutions, setFilteredSolutions] =
		useState<Solution[]>(solutions);
	const [userRank, setUserRank] = useState<number | null>(null);

	useEffect(() => {
		if (filter === "all") {
			setFilteredSolutions(solutions);
		} else {
			setFilteredSolutions(solutions.filter((s) => s.language === filter));
		}
	}, [filter, solutions]);

	useEffect(() => {
		if (userSolution) {
			const rank =
				filteredSolutions.findIndex((s) => s.id === userSolution.id) + 1;
			setUserRank(rank > 0 ? rank : null);
		}
	}, [userSolution, filteredSolutions]);

	return (
		<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
			<div className="flex items-center justify-between mb-8">
				<h2 className="text-xl font-bold text-white">🏆 Leaderboard</h2>

				<select
					className="bg-white/5 border border-white/10 text-white px-3 py-1 rounded-md text-sm"
					defaultValue="all"
					onChange={(e) =>
						setFilter(e.target.value as "all" | "javascript" | "python")
					}
				>
					<option value="all">All</option>
					<option value="javascript">JavaScript</option>
					<option value="python">Python</option>
				</select>
			</div>

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
			{filteredSolutions.length > 0 ? (
				filteredSolutions
					.slice(0, 10) // Limit to top 10 solutions
					.map((solution, index) => (
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
									<Link
										className="text-white font-semibold"
										href={`/users/${solution.user.name}`}
									>
										@{solution.user.name}
									</Link>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								{filter === "all" && (
									<div className="text-white/60 text-sm">
										{solution.language === "javascript" ? (
											<JavaScriptIcon
												strokeWidth={2}
												fill="white"
												className="w-6 h-6"
											/>
										) : (
											<PythonIcon
												strokeWidth={2}
												fill="white"
												className="w-6 h-6"
											/>
										)}
									</div>
								)}
								<div className="text-right">
									<div className="text-white font-bold">
										{solution.charCount}
									</div>
									<div className="text-white/60 text-xs">chars</div>
								</div>
							</div>
						</div>
					))
			) : (
				<div className="text-center text-white/60 py-4">
					<div className="text-4xl mb-2">🎯</div>
					{solutions.length === 0 ? (
						<p>Be the first to solve this puzzle!</p>
					) : (
						<p>Be the first to solve this puzzle in {filter}.</p>
					)}
				</div>
			)}
		</div>
	);
}
