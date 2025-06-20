// Warmup
eval("var performance = { now: () => Date.now() };");

process.stdin.setEncoding("utf-8");

let code = "";
process.stdin.on("data", (chunk) => (code += chunk));
process.stdin.on("end", () => {
	try {
		const now = performance.now();

		// Evaluate the code
		eval(code);

		const elapsed = performance.now() - now;
		console.log("_TIME$" + elapsed);
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
});
