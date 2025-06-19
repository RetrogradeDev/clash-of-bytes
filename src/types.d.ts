type PublicPuzzle = {
	id: string;
	title: string;
	description: string;
	mode: string; // "chars" | "runtime";
	createdAt: Date;
	author: {
		name: string;
	};
	testCases: Array<{ input: string; output: string }>;
	solutions: Array<Solution>;
	votes: Array<{ id: string }>;
	inputFormat: InputOutputFormat;
	outputFormat: InputOutputFormat;
	inputDescription: string;
	outputDescription: string;
	featuredDate?: Date | null;
};

type Solution = {
	id: string;
	code: string;
	userId: string;
	language: string; // "python" | "javascript";
	user: {
		name: string;
	};
	score: number;
};

type InputOutputFormat =
	| "string"
	| "number"
	| "boolean"
	| "number[]"
	| "string[]"
	| "boolean[]";
