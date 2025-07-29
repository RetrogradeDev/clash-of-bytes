"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect, useRef } from "react";
import { PuzzleIcon } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { createPuzzle } from "@/lib/actions";
import { censor } from "@/lib/profanity";

import { TypedFunctionInput } from "@/components/typed-input";

const puzzleTitleMaxLength = 100;
const puzzleTitleMinLength = 5;
const puzzleDescriptionMaxLength = 1000;
const puzzleDescriptionMinLength = 20;
const testCasesMaxLength = 30;

const inputOutputFormats: InputOutputFormat[] = [
	"string",
	"number",
	"boolean",
	"string[]",
	"number[]",
	"boolean[]",
];

type Mode = "chars" | "runtime";
const modes: Mode[] = ["runtime", "chars"];

interface TestCase {
	input: string;
	output: string;
}

export function SubmitPuzzleForm() {
	const { data: session } = useSession();
	const router = useRouter();

	const [title, setTitle] = useState("");
	const [mode, setMode] = useState<Mode>("runtime");
	const [description, setDescription] = useState("");
	const [inputFormat, setInputFormat] = useState<InputOutputFormat>("string");
	const [outputFormat, setOutputFormat] = useState<InputOutputFormat>("string");
	const [inputDescription, setInputDescription] = useState("");
	const [outputDescription, setOutputDescription] = useState("");
	const [testCases, setTestCases] = useState<TestCase[]>([
		{ input: "", output: "" },
	]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// For some reason this is needed
	let redirectId = useRef<number | null>(null);

	// Redirect if not authenticated
	useEffect(() => {
		if (!session) {
			redirectId.current = setTimeout(() => {
				router.push("/auth/signin?redirect=/submit");
			}, 1500) as unknown as number;
		} else {
			console.log(redirectId);
			// Clear redirect if session is available
			if (redirectId.current) {
				clearTimeout(redirectId.current);
				redirectId.current = null;
			}
		}
	}, [session, router]);

	if (!session) {
		return null;
	}

	const addTestCase = () => {
		console.log("Adding new test case");
		const startValue = inputFormat === "boolean" ? "true" : "";
		const endValue = outputFormat === "boolean" ? "true" : "";
		setTestCases([...testCases, { input: startValue, output: endValue }]);
	};

	const removeTestCase = (index: number) => {
		if (testCases.length > 1) {
			console.log("Removing test case at index:", index);
			setTestCases(testCases.filter((_, i) => i !== index));
		}
	};

	const updateTestCase = (
		index: number,
		field: keyof TestCase,
		value: string,
	) => {
		const updated = testCases.map((testCase, i) =>
			i === index ? { ...testCase, [field]: value } : testCase,
		);

		console.log("Updated test case:", updated);

		setTestCases(updated);
	};

	const validateForm = () => {
		if (!title.trim()) return "Title is required";
		if (!description.trim()) return "Description is required";
		if (!inputFormat.trim()) return "Input format is required";
		if (!outputFormat.trim()) return "Output format is required";
		if (!inputDescription.trim()) return "Input description is required";
		if (!outputDescription.trim()) return "Output description is required";

		if (title.length > puzzleTitleMaxLength)
			return `Title must be at most ${puzzleTitleMaxLength} characters`;
		if (title.length < puzzleTitleMinLength)
			return `Title must be at least ${puzzleTitleMinLength} characters`;

		if (description.length > puzzleDescriptionMaxLength)
			return `Description must be at most ${puzzleDescriptionMaxLength} characters`;
		if (description.length < puzzleDescriptionMinLength)
			return `Description must be at least ${puzzleDescriptionMinLength} characters`;

		if (testCases.length > testCasesMaxLength)
			return `At most ${testCasesMaxLength} test cases are allowed`;

		const validTestCases = testCases
			.filter((tc) => tc.input.trim() && tc.output.trim())
			.map((tc) => ({
				input: inputFormat === "string" ? `"${tc.input}"` : tc.input,
				output: outputFormat === "string" ? `"${tc.output}"` : tc.output,
			}));
		if (validTestCases.length === 0)
			return "At least one complete test case is required";

		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const validationError = validateForm();
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsLoading(true);

		try {
			const validTestCases = testCases.filter(
				(tc) => tc.input.trim() && tc.output.trim(),
			);

			const result = await createPuzzle({
				title: censor(title.trim()),
				mode,
				description: censor(description.trim()),
				inputFormat: censor(inputFormat.trim()),
				outputFormat: censor(outputFormat.trim()),
				inputDescription: censor(inputDescription.trim()),
				outputDescription: censor(outputDescription.trim()),
				testCases: validTestCases,
			});

			if (result.success) {
				router.push(`/puzzles/${result.puzzleId}`);
			} else {
				setError(result.error || "Failed to create puzzle");
			}
		} catch (error) {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="space-y-8">
				<div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
					<div className="text-center">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<PuzzleIcon className="text-4xl text-white" />
						</div>
						<h1 className="text-4xl font-bold text-white mb-2">
							Submit a Puzzle
						</h1>
						<p className="text-purple-300">
							Create a programming challenge for the community
						</p>
					</div>
				</div>
				<form className="space-y-8">
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 space-y-6">
						<h2 className="text-2xl font-bold text-white">Basic Information</h2>

						<div>
							<label
								htmlFor="title"
								className="block text-sm font-medium text-white mb-2"
							>
								Puzzle Title *
							</label>
							<input
								id="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g., Reverse a String"
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
							/>
						</div>

						<div>
							<label
								htmlFor="mode"
								className="block text-sm font-medium text-white mb-2"
							>
								Mode *
							</label>
							<select
								id="mode"
								value={mode}
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
								onChange={(e) => setMode(e.target.value as Mode)}
							>
								<option value="runtime">Execution Time</option>
								<option value="chars">Characters</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-white mb-2"
							>
								Description * (Markdown supported)
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={6}
								placeholder="Describe your puzzle. What should the function/program do? Include examples and constraints."
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-y"
							/>
						</div>
					</div>
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 space-y-6">
						<h2 className="text-2xl font-bold text-white">
							Input & Output Format
						</h2>

						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<div>
									<label
										htmlFor="inputFormat"
										className="block text-sm font-medium text-white mb-2"
									>
										Input Format *
									</label>
									<select
										id="inputFormat"
										value={inputFormat}
										onChange={(e) =>
											setInputFormat(e.target.value as InputOutputFormat)
										}
										className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
									>
										{inputOutputFormats.map((format) => (
											<option key={format} value={format}>
												{format.charAt(0).toUpperCase() + format.slice(1)}
											</option>
										))}
									</select>
								</div>
								<div className="mt-4">
									<label
										htmlFor="inputDescription"
										className="block text-sm font-medium text-white mb-2"
									>
										Input Description *
									</label>
									<textarea
										id="inputDescription"
										value={inputDescription}
										onChange={(e) => setInputDescription(e.target.value)}
										rows={6}
										placeholder="Describe the input format. Include examples if necessary."
										className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-y"
									/>
								</div>
							</div>

							<div>
								<div>
									<label
										htmlFor="outputFormat"
										className="block text-sm font-medium text-white mb-2"
									>
										Output Format *
									</label>
									<select
										id="outputFormat"
										value={outputFormat}
										onChange={(e) =>
											setOutputFormat(e.target.value as InputOutputFormat)
										}
										className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
									>
										{inputOutputFormats.map((format) => (
											<option key={format} value={format}>
												{format.charAt(0).toUpperCase() + format.slice(1)}
											</option>
										))}
									</select>
								</div>
								<div className="mt-4">
									<label
										htmlFor="outputDescription"
										className="block text-sm font-medium text-white mb-2"
									>
										Output Description *
									</label>
									<textarea
										id="outputDescription"
										value={outputDescription}
										onChange={(e) => setOutputDescription(e.target.value)}
										rows={6}
										placeholder="Describe the output format. Include examples if necessary."
										className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-y"
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-bold text-white">Test Cases</h2>
							<button
								type="button"
								onClick={addTestCase}
								className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
							>
								+ Add Test Case
							</button>
						</div>

						<p className="text-white/60 text-sm">
							Provide at least one test case. These will be used to validate
							user solutions.
						</p>

						<div className="space-y-4">
							{testCases.map((testCase, index) => (
								<div
									key={index}
									className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 space-y-4"
								>
									<div className="flex items-center justify-between">
										<h3 className="text-white font-semibold">
											Test Case {index + 1}
										</h3>
										{testCases.length > 1 && (
											<button
												type="button"
												onClick={() => removeTestCase(index)}
												className="text-red-400 hover:text-red-300 text-sm"
											>
												Remove
											</button>
										)}
									</div>

									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-white mb-2">
												Input
											</label>
											<TypedFunctionInput
												type={inputFormat}
												value={testCase.input}
												onChange={(value) => {
													console.log("value", value);
													updateTestCase(index, "input", value);
												}}
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-white mb-2">
												Expected Output
											</label>
											<TypedFunctionInput
												type={outputFormat}
												value={testCase.output}
												onChange={(value) => {
													updateTestCase(index, "output", value);
												}}
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					{error && (
						<div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
							<p className="text-red-200">{error}</p>
						</div>
					)}
					<div className="flex justify-center">
						<button
							type="submit"
							disabled={isLoading}
							onClick={handleSubmit}
							className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
						>
							{isLoading ? "Creating Puzzle..." : "Create Puzzle"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
