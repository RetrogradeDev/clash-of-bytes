"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchAndFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams);

		if (searchTerm.trim()) {
			params.set("q", searchTerm.trim());
		} else {
			params.delete("q");
		}

		router.push(`/puzzles?${params.toString()}`);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		const params = new URLSearchParams(searchParams);
		params.delete("q");
		router.push(`/puzzles?${params.toString()}`);
	};

	return (
		<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
			<form onSubmit={handleSearch} className="flex gap-4">
				<div className="flex-1">
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search puzzles by title or description..."
						className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
					/>
				</div>
				<button
					type="submit"
					className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
				>
					Search
				</button>
				{searchParams.get("search") && (
					<button
						type="button"
						onClick={handleClearSearch}
						className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-colors"
					>
						Clear
					</button>
				)}
			</form>
		</div>
	);
}
