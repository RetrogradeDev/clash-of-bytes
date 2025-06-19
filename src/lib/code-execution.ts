"use client";

export interface TestResult {
	passed: boolean;
	input: string;
	expected: string;
	actual: string;
	error?: string;
	output: string;
}

export async function executeCode(
	code: string,
	language: "javascript" | "python",
	testCases: Array<{ input: string; output: string }>,
): Promise<TestResult[]> {
	const results: TestResult[] = [];

	for (const testCase of testCases) {
		try {
			if (language === "javascript") {
				const [result, stdout] = await executeJavaScript(code, testCase.input);
				results.push({
					passed: result.trim() === testCase.output.trim(),
					input: testCase.input,
					expected: testCase.output,
					actual: result,
					output: stdout,
				});
			} else if (language === "python") {
				const [result, stdout, error] = await executePython(
					code,
					testCase.input,
				);
				results.push({
					passed: !error && result.trim() === testCase.output.trim(),
					input: testCase.input,
					expected: testCase.output,
					actual: result,
					output: stdout,
					error,
				});
			}
		} catch (error) {
			results.push({
				passed: false,
				input: testCase.input,
				expected: testCase.output,
				actual: "",
				error: (error as Error).message,
				output: "",
			});
		}
	}

	return results;
}

async function executeJavaScript(
	code: string,
	input: string,
): Promise<[string, string]> {
	return new Promise((resolve, reject) => {
		try {
			// This is not safe, so the user should only be able to run their own code

			const logs: string[] = [];
			const originalConsoleLog = console.log;

			console.log = (...args) => logs.push(args.join(" "));
			console.error = (...args) => logs.push("**ERROR:** " + args.join(" "));
			console.warn = (...args) => logs.push("**WARNING:** " + args.join(" "));
			console.debug = (...args) => logs.push("**DEBUG:** " + args.join(" "));
			console.info = (...args) => logs.push("**INFO:** " + args.join(" "));

			try {
				const func = new Function(
					"input",
					`
                    ${code}
                    
                    if (typeof solve !== 'function') {
                      throw new Error('Please define a function called "solve" that takes input as a parameter');
                    }
                    
                    return solve(input);
                  `,
				);

				let result = func(input);
				const stdout = logs.join("\n");

				try {
					result = result.toString();
				} catch (error) {
					console.error("Error converting result to string:", error);
					result = "";
				}

				// Resolve with the result and captured stdout
				resolve([result, stdout]);
			} finally {
				console.log = originalConsoleLog;
			}
		} catch (error) {
			reject(error);
		}
	});
}

async function executePython(
	code: string,
	input: string,
): Promise<[string, string, string]> {
	try {
		// @ts-ignore
		if (!window.pyodide) {
			// Load Pyodide if not already loaded. We have to do this like this because
			// it's WASM and we can't import it like a normal module.
			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/pyodide.js"; // TODO: 0.27.7 creates an error, idk
			document.head.appendChild(script);

			await new Promise((resolve, reject) => {
				script.onload = resolve;
				script.onerror = reject;
			});

			// @ts-ignore
			window.pyodide = await loadPyodide(); // This takes 2-3 seconds, so we should cache it
		}

		// @ts-ignore
		const pyodide = window.pyodide;

		// Fix the indentation in the code for in the try-block
		// I hate python's indentation rules so much
		// Like, why can't we just use braces like every other language?
		// and why do we have to indent with spaces instead of tabs?
		// I hate this so much
		const fixedCode = code
			.split("\n")
			.map((line) => "    " + line) // Assuming the user's code is indented with 4 spaces
			.join("\n");

		// Just for debugging, remove this var later
		const full = `
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()

try:
${fixedCode}
    
    if 'solve' not in globals():
        raise NameError('Please define a function called "solve" that takes input as a parameter')
    
    result = solve("""${input.replace(/"/g, '\\"')}""")
    print("_RES=" + result, end='')
    
except Exception as e:
    print(f"Error: {e}", end='')
    
finally:
    sys.stdout = old_stdout
    
output = captured_output.getvalue()
    `;

		pyodide.runPython(full);

		const all_stdout = pyodide.runPython("output");
		const resultMatch: RegExpMatchArray | null = all_stdout.match(/_RES=(.*)/);
		const printStdout: string = all_stdout.replace(/_RES=(.*)/, "").trim();

		if (resultMatch) {
			return [resultMatch[1], printStdout, ""];
		} else {
			return ["", printStdout, "Python execution error:" + all_stdout];
		}
	} catch (error) {
		return ["", "", "Python execution error: " + (error as Error).message];
	}
}

// Utility function to load Pyodide
declare global {
	interface Window {
		pyodide: any;
		loadPyodide: () => Promise<any>;
	}
}
