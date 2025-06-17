"use client";

import { useState } from "react";
import { votePuzzle } from "@/lib/actions";
import { StarIcon } from "lucide-react";

interface VoteButtonProps {
	puzzleId: string;
	initialVoted: boolean;
	initialCount: number;
	disabled?: boolean;
}

export function VoteButton({
	puzzleId,
	initialVoted,
	initialCount,
	disabled,
}: VoteButtonProps) {
	const [voted, setVoted] = useState(initialVoted);
	const [count, setCount] = useState(initialCount);
	const [isLoading, setIsLoading] = useState(false);

	const handleVote = async () => {
		if (disabled || isLoading) return;

		setIsLoading(true);

		try {
			const result = await votePuzzle(puzzleId);
			if (result.success) {
				setVoted(result.voted ?? false);
				setCount((prev) => (result.voted ? prev + 1 : prev - 1));
			}
		} catch (error) {
			console.error("Error voting:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleVote}
			disabled={disabled || isLoading}
			className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
				voted
					? "bg-purple-600 text-white hover:bg-purple-700"
					: "bg-white/10 text-white hover:bg-white/20"
			} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
			title={
				disabled
					? "Sign in to vote"
					: voted
					? "Remove vote"
					: "Vote for this puzzle"
			}
		>
			<StarIcon
				className="w-4 h-4 transition-colors"
				stroke="currentColor"
				fill={voted ? "currentColor" : "none"}
			/>
			<span>{count}</span>
		</button>
	);
}
