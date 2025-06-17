"use client";

export interface TestResult {
	passed: boolean;
	input: string;
	expected: string;
	actual: string;
	error?: string;
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
				const result = await executeJavaScript(code, testCase.input);
				results.push({
					passed: result.trim() === testCase.output.trim(),
					input: testCase.input,
					expected: testCase.output,
					actual: result,
				});
			} else if (language === "python") {
				const result = await executePython(code, testCase.input);
				results.push({
					passed: result.trim() === testCase.output.trim(),
					input: testCase.input,
					expected: testCase.output,
					actual: result,
				});
			}
		} catch (error) {
			results.push({
				passed: false,
				input: testCase.input,
				expected: testCase.output,
				actual: "",
				error: (error as Error).message,
			});
		}
	}

	return results;
}

async function executeJavaScript(code: string, input: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			// Create a safe execution environment
			const safeEval = new Function(
				"input",
				`
        ${code}
        
        if (typeof solve !== 'function') {
          throw new Error('Please define a function called "solve" that takes input as a parameter');
        }
        
        return solve(input);
      `,
			);

			const result = safeEval(input);
			resolve(String(result));
		} catch (error) {
			reject(error);
		}
	});
}

async function executePython(code: string, input: string): Promise<string> {
	// For Python, we'll use Pyodide (Web Assembly Python)
	try {
		// @ts-ignore
		if (!window.pyodide) {
			// Load Pyodide if not already loaded
			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/pyodide.js"; // TODO: 0.27.7 creates an error, idk
			document.head.appendChild(script);

			await new Promise((resolve, reject) => {
				script.onload = resolve;
				script.onerror = reject;
			});

			// @ts-ignore
			window.pyodide = await loadPyodide();
		}

		// @ts-ignore
		const pyodide = window.pyodide;

		// Fix the indentation in the code for in the try-block
		const fixedCode = code
			.split("\n")
			.map((line) => "    " + line)
			.join("\n");

		// Set up the Python environment
		pyodide.runPython(`
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
    `);

		const stdout = pyodide.runPython("output");
		const resultMatch = stdout.match(/_RES=(.*)/);
		if (resultMatch) {
			return resultMatch[1];
		} else {
			throw new Error("Python execution error: " + stdout);
		}
	} catch (error) {
		console.error("Python execution error:", error);

		throw new Error(`Python execution error: ${(error as Error).message}`);
	}
}

// Utility function to load Pyodide
declare global {
	interface Window {
		pyodide: any;
		loadPyodide: () => Promise<any>;
	}
}
