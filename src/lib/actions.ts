"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { secureJsEval, securePyEval } from "./secure-eval";

export async function createPuzzle(data: {
	title: string;
	mode: "chars" | "runtime";
	description: string;
	inputFormat: string;
	outputFormat: string;
	inputDescription: string;
	outputDescription: string;
	testCases: Array<{ input: string; output: string }>;
}) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return {
				success: false,
				error: "You must be logged in to create a puzzle",
			};
		}

		if (["chars", "runtime"].indexOf(data.mode) === -1) {
			return { success: false, error: "Invalid puzzle mode" };
		}

		if (!data.title.trim()) {
			return { success: false, error: "Title is required" };
		}

		if (!data.description.trim()) {
			return { success: false, error: "Description is required" };
		}

		if (!data.inputFormat.trim()) {
			return { success: false, error: "Input format is required" };
		}

		if (!data.outputFormat.trim()) {
			return { success: false, error: "Output format is required" };
		}

		if (!data.inputDescription.trim()) {
			return { success: false, error: "Input description is required" };
		}

		if (!data.outputDescription.trim()) {
			return { success: false, error: "Output description is required" };
		}

		if (!data.testCases || data.testCases.length === 0) {
			return { success: false, error: "At least one test case is required" };
		}

		// Validate test cases
		for (let i = 0; i < data.testCases.length; i++) {
			const testCase = data.testCases[i];
			if (!testCase.input.trim() || !testCase.output.trim()) {
				return {
					success: false,
					error: `Test case ${i + 1} must have both input and output`,
				};
			}
		}

		const puzzle = await prisma.puzzle.create({
			data: {
				title: data.title.trim(),
				mode: data.mode,
				description: data.description.trim(),
				inputFormat: data.inputFormat.trim(),
				outputFormat: data.outputFormat.trim(),
				inputDescription: data.inputDescription.trim(),
				outputDescription: data.outputDescription.trim(),
				testCases: data.testCases,
				authorId: session.user.id,
			},
		});

		return { success: true, puzzleId: puzzle.id };
	} catch (error) {
		console.error("Error creating puzzle:", error);
		return {
			success: false,
			error: "Failed to create puzzle. Please try again.",
		};
	}
}

export async function votePuzzle(puzzleId: string) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return { success: false, error: "You must be logged in to vote" };
		}

		const existingVote = await prisma.vote.findUnique({
			where: {
				puzzleId_userId: {
					puzzleId,
					userId: session.user.id,
				},
			},
		});

		if (existingVote) {
			// Remove vote (unlike)
			await prisma.vote.delete({
				where: {
					id: existingVote.id,
				},
			});
			return { success: true, voted: false };
		} else {
			// Add vote (like)
			await prisma.vote.create({
				data: {
					puzzleId,
					userId: session.user.id,
				},
			});
			return { success: true, voted: true };
		}
	} catch (error) {
		console.error("Error voting on puzzle:", error);
		return { success: false, error: "Failed to vote on puzzle" };
	}
}

async function calculateScore(code: string, language: string, mode: string) {
	if (mode === "chars") {
		// For character count mode, score is simply the length of the code
		return code.length;
	}

	if (mode === "runtime") {
		// For runtime mode, we need to measure the execution time
		const loops = 5; // Number of loops to average the time
		const start = performance.now();
		for (let i = 0; i < loops; i++) {
			try {
				if (language === "javascript") {
					// Use secure JS eval to run the code
					await secureJsEval(code);
				} else if (language === "python") {
					await securePyEval(code);
				}
			} catch (error) {
				console.error("Error executing code:", error);
			}
		}
		const end = performance.now();
		return (end - start) / loops;
	}

	return -1; // Invalid mode
}

export async function submitSolution(data: {
	puzzleId: string;
	code: string;
	language: string;
}) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return {
				success: false,
				error: "You must be logged in to submit a solution",
			};
		}

		if (!data.code.trim()) {
			return { success: false, error: "Code cannot be empty" };
		}

		if (!["javascript", "python"].includes(data.language)) {
			return { success: false, error: "Language must be javascript or python" };
		}

		const puzzle = await prisma.puzzle.findUnique({
			where: { id: data.puzzleId },
		});

		if (!puzzle) {
			return { success: false, error: "Puzzle not found" };
		}

		// Check if user already has a solution for this puzzle and language
		const existingSolution = await prisma.solution.findUnique({
			where: {
				puzzleId_userId_language: {
					puzzleId: puzzle.id,
					userId: session.user.id,
					language: data.language,
				},
			},
		});

		const score = await calculateScore(
			data.code.trim(),
			data.language,
			puzzle.mode,
		);

		if (existingSolution) {
			// Update existing solution if this one is shorter
			if (score < existingSolution.score) {
				await prisma.solution.update({
					where: { id: existingSolution.id },
					data: {
						code: data.code.trim(),
						score,
						language: data.language,
					},
				});
				return { success: true, improved: true, score };
			} else {
				return {
					success: true,
					improved: false,
					score: existingSolution.score,
				};
			}
		} else {
			// Create new solution
			await prisma.solution.create({
				data: {
					code: data.code.trim(),
					language: data.language,
					score,
					puzzleId: data.puzzleId,
					userId: session.user.id,
				},
			});
			return { success: true, improved: true, score };
		}
	} catch (error) {
		console.error("Error submitting solution:", error);
		return { success: false, error: "Failed to submit solution" };
	}
}
