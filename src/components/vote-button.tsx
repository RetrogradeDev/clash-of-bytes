"use client";

import { useState } from "react";
import { votePuzzle } from "@/lib/actions";

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
			<svg
				className={`w-5 h-5 transition-colors ${
					voted ? "text-white" : "text-purple-300"
				}`}
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
			</svg>
			<span>{count}</span>
		</button>
	);
}
