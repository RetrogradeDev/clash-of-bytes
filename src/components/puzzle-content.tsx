"use client";

import { useState } from "react";

import { Editor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

import { runTestCases, submitSolution } from "@/lib/actions";
import { executeCode, type TestResult } from "@/lib/code-execution";

import { Card } from "./card";
import { ClockIcon, TimerIcon } from "lucide-react";

type Language = "javascript" | "python";

interface PuzzleContentProps {
	puzzle: {
		id: string;
		mode: string; //"chars" | "runtime";
		testCases: any;
	};
	userSolutions?: Solution[] | null;
	isAuthenticated: boolean;
}

export function PuzzleContent({
	puzzle,
	userSolutions,
	isAuthenticated,
}: PuzzleContentProps) {
	const [language, setLanguage] = useState<Language>(
		(userSolutions?.[0]?.language as Language) || "javascript",
	);
	const [code, setCode] = useState(
		userSolutions?.[0]?.code ||
			(language === "javascript"
				? "// Your solution here\nfunction solve(inputData) {\n  // Parse input and return output\n}"
				: "# Your solution here\ndef solve(input_data):\n    # Parse input and return output\n    pass"),
	);
	const [isRunning, setIsRunning] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [testResults, setTestResults] = useState<Array<TestResult> | null>(
		null,
	);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleLanguageChange = (newLanguage: Language) => {
		setLanguage(newLanguage);

		// Set default code template for the language
		if (newLanguage === "javascript") {
			setCode(
				"// Your solution here\nfunction solve(inputData) {\n  // Parse input and return output\n}",
			);
		} else {
			setCode(
				"# Your solution here\ndef solve(input_data):\n    # Parse input and return output\n    pass",
			);
		}

		setTestResults(null);
		setError("");
		setSuccess("");
	};

	const handleRunCode = async () => {
		if (!code.trim()) {
			setError("Please enter some code first");
			return false;
		}

		setIsRunning(true);
		setError("");
		setSuccess("");
		setTestResults(null);

		console.log("Running code with language:", language);
		let isSuccess = false;

		if (puzzle.mode === "chars") {
			// No need to run this on server
			try {
				const testCases = puzzle.testCases as Array<{
					input: string;
					output: string;
				}>;
				const results = await executeCode(code, language, testCases);
				setTestResults(results);

				const passedCount = results.filter((r: any) => r.passed).length;
				if (passedCount === results.length) {
					setSuccess(`All ${passedCount} test cases passed! 🎉`);
					isSuccess = true;
				} else {
					setError(`${passedCount}/${results.length} test cases passed`);
				}

				console.log("Test results:", results);
			} catch (error) {
				setError("Failed to execute code: " + (error as Error).message);
			} finally {
				setIsRunning(false);
			}
		} else {
			const { success, results } = await runTestCases({
				code: code.trim(),
				language,
				testCases: puzzle.testCases,
				bench: puzzle.mode === "runtime", // Very slow :(
			});

			console.log("Running test cases result:", results, success);

			if (!success || !results) {
				setError("Failed to run test cases");
				setIsRunning(false);
				return false;
			}

			setTestResults(results);
			setIsRunning(false);

			const passedCount = results.filter((r) => r.passed).length;
			if (passedCount === results.length) {
				setSuccess(`All ${passedCount} test cases passed! 🎉`);
				isSuccess = true;
			} else {
				setError(`${passedCount}/${results.length} test cases passed`);
			}
		}

		return isSuccess;
	};

	const handleSubmit = async () => {
		if (!isAuthenticated) {
			setError("Please sign in to submit solutions");
			return;
		}

		if (!code.trim()) {
			setError("Please enter some code first");
			return;
		}

		setIsSubmitting(true);
		setError("");
		setSuccess("");

		try {
			const result = await submitSolution({
				puzzleId: puzzle.id,
				code: code.trim(),
				language,
			});

			if (result.success) {
				if (result.improved) {
					setSuccess(
						`Solution submitted! Your code: ${result.score} characters 🎯`,
					);

					setTimeout(() => {
						window.location.reload();
					}, 2000);
				} else {
					setSuccess(
						`Your previous solution (${result.score} ${
							puzzle.mode === "chars" ? "characters" : "milliseconds"
						}) is still better!`,
					);
				}
			} else {
				setError(result.error || "Failed to submit solution");
			}
		} catch (error) {
			setError("Failed to submit solution");
		} finally {
			setIsSubmitting(false);
		}
	};

	const score = code.length;
	return (
		<Card className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-white">💻 Code Editor</h2>
				<div className="flex items-center space-x-4">
					<span className="text-gray-400 text-sm">
						{puzzle.mode === "chars" && `${code.length} characters`}
					</span>
					<select
						value={language}
						onChange={(e) => handleLanguageChange(e.target.value as Language)}
						className="bg-gray-800 border border-gray-600 rounded text-white text-sm px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="javascript">JavaScript</option>
						<option value="python">Python</option>
					</select>
				</div>
			</div>

			<div className="border border-gray-600 rounded-lg">
				<Editor
					height="400px"
					language={language}
					value={code}
					onChange={(value) => setCode(value || "")}
					theme="vs-dark"
					options={{
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						fontSize: 14,
						wordWrap: "on",
						automaticLayout: true,
					}}
				/>
			</div>

			<div className="flex items-center space-x-4">
				<button
					onClick={handleRunCode}
					disabled={isRunning}
					className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
				>
					{isRunning ? "Running..." : "🚀 Run Code"}
				</button>

				<button
					onClick={handleSubmit}
					disabled={isSubmitting || !isAuthenticated}
					className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
				>
					{isSubmitting ? "Submitting..." : "📤 Submit Solution"}
				</button>

				{!isAuthenticated && (
					<span className="text-gray-400 text-sm">
						Sign in to submit solutions
					</span>
				)}
			</div>

			{isSubmitting || isRunning ? (
				<div className="flex items-center space-x-3 text-gray-400 text-sm">
					<span className="relative flex h-6 w-6">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-6 w-6 bg-purple-600"></span>
						<ClockIcon className="absolute inset-0 m-auto size-4 text-white animate-spin" />
					</span>
					<span>
						It can take up to 30 seconds to run all test cases. Please be
						patient, we are running this on a free server.
					</span>
				</div>
			) : null}

			{error && (
				<div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
					<p className="text-red-200">{error}</p>
				</div>
			)}

			{success && (
				<div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4">
					<p className="text-green-200">{success}</p>
				</div>
			)}

			{testResults && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-white">Test Results</h3>
					<div className="space-y-3">
						{testResults.map((result, index) => (
							<div
								key={index}
								className={`border rounded-lg p-4 ${
									result.passed
										? "bg-green-900/20 border-green-500/50"
										: "bg-red-900/20 border-red-500/50"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<span className="font-semibold text-white">
										Test Case {index + 1}
									</span>
									<div className="flex items-center space-x-2">
										{result.time && (
											<span className="text-sm text-gray-400 flex items-center">
												<TimerIcon className="mr-1 size-4" />
												{result.time}ms
											</span>
										)}
										<span
											className={`px-2 py-1 rounded text-sm font-semibold ${
												result.passed
													? "bg-green-600 text-white"
													: "bg-red-600 text-white"
											}`}
										>
											{result.passed ? "PASS" : "FAIL"}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div>
										<div className="text-gray-400 mb-1">Input:</div>
										<pre className="bg-gray-900/50 p-2 rounded text-white font-mono border border-gray-600">
											{result.input}
										</pre>
									</div>
									<div>
										<div className="text-gray-400 mb-1">Expected:</div>
										<pre className="bg-gray-900/50 p-2 rounded text-white font-mono border border-gray-600">
											{result.expected}
										</pre>
									</div>
									<div>
										<div className="text-gray-400 mb-1">Your Output:</div>
										<pre
											className={`p-2 rounded font-mono border ${
												result.passed
													? "bg-green-900/30 text-green-200 border-green-500/50"
													: "bg-red-900/30 text-red-200 border-red-500/50"
											}`}
										>
											{result.actual || "No output"}
										</pre>
									</div>
								</div>

								<p className="mt-4 text-sm text-gray-400">Program Output:</p>
								<div className="mt-2 text-sm text-gray-300 p-2 bg-gray-900/60 rounded border border-gray-600">
									{result.error && result.error.trim() !== "" && (
										<div className="my-2 text-sm text-red-200 font-semibold">
											Error: {result.error}
										</div>
									)}
									<ReactMarkdown>{result.output}</ReactMarkdown>
								</div>
							</div>
						))}

						<span className="text-gray-400 text-sm">
							Please notice timed test cases can be off by a few milliseconds
							due to server load and other factors (I'm too poor to afford
							better servers).
						</span>
					</div>
				</div>
			)}
		</Card>
	);
}
