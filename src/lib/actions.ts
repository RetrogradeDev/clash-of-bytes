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

async function calculateScore(
	code: string,
	language: string,
	benchruns: number = 1,
): Promise<[number, string, string]> {
	// For runtime mode, we need to measure the execution time
	let stdout: string = "";
	let stderr: string = "";
	let times: number[] = [];

	const promises = Array.from({ length: benchruns }, async () => {
		try {
			if (language === "javascript") {
				const [execTime, execStdout, execStderr] = await secureJsEval(code);
				return { time: execTime, stdout: execStdout, stderr: execStderr };
			} else if (language === "python") {
				const [execTime, execStdout, execStderr] = await securePyEval(code);
				return { time: execTime, stdout: execStdout, stderr: execStderr };
			}

			return { time: 0, stdout: "", stderr: "" };
		} catch (error) {
			console.error("Error executing code:", error);
			return { time: 0, stdout: "", stderr: "" };
		}
	});

	const results = await Promise.all(promises);

	for (const result of results) {
		times.push(result.time);
		if (result.stdout) stdout = result.stdout;
		if (result.stderr) stderr = result.stderr;
	}

	console.log("Execution times:", times);

	let sortedTimes = times.filter((t) => !isNaN(t)).sort((a, b) => a - b);
	// Only keep the fastest 2 times
	if (sortedTimes.length > 2) {
		sortedTimes = sortedTimes.slice(0, 2);
	}

	console.log("Sorted times after removing slowest:", sortedTimes);

	const totalTime =
		sortedTimes.reduce((acc, t) => acc + t, 0) / sortedTimes.length;

	// Only keep stdout between _START_STDOUT$ and _END_STDOUT$
	const startIndex = stdout.indexOf("_START_STDOUT$");
	const endIndex = stdout.indexOf("_END_STDOUT$");
	if (startIndex !== -1 && endIndex !== -1) {
		stdout = stdout.substring(startIndex + "_START_STDOUT$".length, endIndex);
	}

	return [totalTime, stdout, stderr];
}

export async function runTestCases(data: {
	code: string;
	language: string;
	testCases: Array<{ input: string; output: string }>;
	bench: boolean;
}) {
	try {
		const results = [];

		const testCasePromises = data.testCases.map(async (_testCase) => {
			const testCase = {
				..._testCase,
				id: Math.random().toString(36).substring(2, 15), // Generate a unique ID for the test case
			};
			if (!testCase.input.trim() || !testCase.output.trim()) {
				return null;
			}

			if (!testCase.input.startsWith("[") && !testCase.input.startsWith('"')) {
				// Make sure it's a string
				if (
					isNaN(parseFloat(testCase.input)) &&
					testCase.input !== "true" &&
					testCase.input !== "false"
				) {
					testCase.input = `"${testCase.input}"`;
				}
			}

			const finalCode = `
${
	data.language === "python"
		? `import time
false = False
true = True`
		: ""
}

${
	data.language === "javascript"
		? `function solve_${testCase.id}(input){\n${data.code}\nreturn solve(input);}`
		: `def solve_${testCase.id}(input):\n\t${data.code.replace(
				/\n/g,
				"\n\t",
		  )}\n\treturn solve(input)`
}

solve_${testCase.id}(${testCase.input})

${
	data.language === "python"
		? "startTime = time.time_ns()"
		: "const startTime = process.hrtime.bigint()"
}
solve_${testCase.id}(${testCase.input})
solve_${testCase.id}(${testCase.input})
solve_${testCase.id}(${testCase.input})
${data.language === "javascript" ? "console.log" : "print"}("_TIME$" + ${
				data.language === "python" ? "str" : ""
			}(${
				data.language === "javascript"
					? "Number(process.hrtime.bigint()"
					: "(time.time_ns()"
			} - startTime) / 3000000))

${data.language === "javascript" ? "console.log" : "print"}("_START_STDOUT$")
${data.language === "javascript" ? "console.log" : "print"}("_OUTPUT$"+${
				data.language === "javascript" ? "JSON.stringify(" : "str("
			}solve_${testCase.id}(${testCase.input})))
${data.language === "javascript" ? "console.log" : "print"}("_END_STDOUT$")`;

			console.log("Final code for test case:", finalCode);

			const [time, stdout, stderr] = await calculateScore(
				finalCode,
				data.language,
				data.bench ? 3 : 1, // Run multiple times if benchmarking
			);

			let resolvedOutput =
				stdout
					.split("\n")
					.find((line) => line.startsWith("_OUTPUT$"))
					?.replace(/_OUTPUT\$(.*)/, "$1")
					.trim() || "";
			const output = stdout.replace(/_OUTPUT\$.*/, "").trim();

			console.log("Resolved output:", resolvedOutput);
			// Stringify the output for comparison
			if (data.language === "python") {
				resolvedOutput = resolvedOutput.replace(/False/g, "false");
				resolvedOutput = resolvedOutput.replace(/True/g, "true");
				resolvedOutput = resolvedOutput.replace(/'/g, '"');
				if (!resolvedOutput.startsWith("[")) {
					resolvedOutput = `"${resolvedOutput}"`;
				} else {
					resolvedOutput = JSON.stringify(JSON.parse(resolvedOutput));
				}
			}

			const expected = testCase.output.startsWith("[")
				? JSON.stringify(JSON.parse(testCase.output.trim()))
				: `"${testCase.output.trim()}"`;

			let isTheSame = resolvedOutput === expected;
			if (!isTheSame) {
				if (expected.startsWith('"') && expected.endsWith('"')) {
					resolvedOutput = `"${resolvedOutput}"`;
					isTheSame = resolvedOutput === expected;
				}
			}

			console.log("Resolved output:", resolvedOutput, "Expected:", expected);

			return {
				passed: resolvedOutput === expected,
				input: testCase.input,
				expected: testCase.output,
				actual: resolvedOutput,
				output,
				error: stderr || null,
				time: Math.round(time * 10000) / 10000, // Round to 0.0001ms
			};
		});

		const testResults = await Promise.all(testCasePromises);
		results.push(...testResults.filter((result) => result !== null));

		return { success: true, results };
	} catch (error) {
		console.error("Error running code:", error);
		return { success: false, error: "Failed to run code" };
	}
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

		// Run test cases and calculate score
		const result = await runTestCases({
			code: data.code,
			language: data.language,
			testCases: puzzle.testCases as Array<{ input: string; output: string }>,
			bench: puzzle.mode === "runtime",
		});

		if (!result.success || !result.results) {
			return { success: false, error: "Failed to run test cases" };
		}

		if (result.results.some((r) => !r.passed)) {
			return {
				success: false,
				error: "Test cases failed, run your code to see details",
			};
		}

		const score =
			puzzle.mode === "chars"
				? data.code.trim().length
				: result.results.reduce((acc, r) => acc + r.time, 0);

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
