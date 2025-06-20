import { spawn } from "child_process";

export function secureJsEval(code: string): Promise<[number, string, string]> {
	return new Promise<[number, string, string]>((resolve, reject) => {
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
			const timeLines = allData.filter((line) => line.startsWith("_TIME$"));
			if (timeLines.length > 1) {
				return reject(
					new Error("Multiple time markers detected - potential cheating"),
				);
			}

			const timeLine = timeLines[0];
			const timeMs = timeLine ? parseFloat(timeLine.slice(6, -1)) : 9999;
			stdout = allData.filter((line) => !line.startsWith("_TIME$")).join("\n");

			if (code !== 0) {
				return reject(new Error(`Docker exited with code ${code}: ${stderr}`));
			}

			resolve([timeMs, stdout.trim(), stderr.trim()]);
		});
	});
}

export function securePyEval(code: string): Promise<[number, string, string]> {
	return new Promise<[number, string, string]>((resolve, reject) => {
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
			if (timeLines.length > 1) {
				return reject(
					new Error("Multiple time markers detected - potential cheating"),
				);
			}

			const timeLine = timeLines[0];
			const timeMs = timeLine ? parseFloat(timeLine.slice(6, -1)) : 9999;
			stdout = allData.filter((line) => !line.startsWith("_TIME$")).join("\n");

			if (code !== 0) {
				return reject(new Error(`Docker exited with code ${code}: ${stderr}`));
			}

			resolve([timeMs, stdout.trim(), stderr.trim()]);
		});
	});
}
