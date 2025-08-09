import { spawn } from "child_process";

export function secureJsEval(
	code: string,
): Promise<[number[], string, string]> {
	return new Promise<[number[], string, string]>((resolve, reject) => {
		const docker = spawn(
			"docker",
			[
				"run",
				"--rm",
				"--memory=128m",
				"--cpus=0.1",
				"--network=none",
				"--pids-limit=10",
				"--read-only",
				"-i",
				"my-javascript-runner",
			],
			{
				stdio: ["pipe", "pipe", "pipe"],
			},
		);

		docker.stdin.write(code);
		docker.stdin.end();

		let stdout = "";
		let stderr = "";

		docker.stdout.on("data", (data) => {
			stdout += data.toString();
		});
		docker.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		docker.on("close", (code) => {
			const allData = stdout.split("\n");
			console.log("All data received:", allData);
			const timeLines = allData.filter((line) => line.startsWith("_TIME$"));

			console.log("All data:", allData);
			console.log("Time lines:", timeLines);
			console.log("Code exit:", code);
			console.log("Stdout:", stdout);
			console.log("Stderr:", stderr);

			const timesMs = timeLines.map((line) =>
				parseFloat(line.replace("_TIME$", "").trim()),
			);
			stdout = allData.filter((line) => !line.startsWith("_TIME$")).join("\n");

			console.log("Parsed time:", timesMs);

			if (code !== 0) {
				return reject(new Error(`Docker exited with code ${code}: ${stderr}`));
			}

			resolve([timesMs, stdout.trim(), stderr.trim()]);
		});
	});
}

export function securePyEval(
	code: string,
): Promise<[number[], string, string]> {
	return new Promise<[number[], string, string]>((resolve, reject) => {
		const docker = spawn(
			"docker",
			[
				"run",
				"--rm",
				"--memory=64m",
				"--cpus=0.1",
				"--network=none",
				"--pids-limit=10",
				"--read-only",
				"-i",
				"my-python-runner",
			],
			{
				stdio: ["pipe", "pipe", "pipe"],
			},
		);

		docker.stdin.write(code);
		docker.stdin.end();

		let stdout = "";
		let stderr = "";

		docker.stdout.on("data", (data) => {
			stdout += data.toString();
		});
		docker.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		docker.on("close", (code) => {
			const allData = stdout.split("\n");
			const timeLines = allData.filter((line) => line.startsWith("_TIME$"));

			const timesMs =
				timeLines.length > 0
					? timeLines.map((line) => parseFloat(line.slice(6, -1)))
					: [9999];
			stdout = allData.filter((line) => !line.startsWith("_TIME$")).join("\n");

			if (code !== 0) {
				return reject(new Error(`Docker exited with code ${code}: ${stderr}`));
			}

			resolve([timesMs, stdout.trim(), stderr.trim()]);
		});
	});
}
