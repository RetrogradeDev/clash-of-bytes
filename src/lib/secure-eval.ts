import { type ChildProcessWithoutNullStreams, spawn } from "child_process";

class CodeRunner {
	imageId: string;
	processPool: ChildProcessWithoutNullStreams[] = [];
	desiredPoolSize: number;

	constructor(imageId: string, desiredPoolSize: number = 3) {
		this.imageId = imageId;
		this.desiredPoolSize = desiredPoolSize;

		this.fillPool();
	}

	fillPool() {
		while (this.processPool.length < this.desiredPoolSize) {
			const process = spawn(
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
					this.imageId,
				],
				{
					stdio: ["pipe", "pipe", "pipe"],
				},
			);
			this.processPool.push(process);
		}
	}

	releasePool() {
		while (this.processPool.length > 0) {
			const process = this.processPool.pop()!;
			process.kill();
		}
	}

	async runCode(code: string): Promise<[number[], string, string]> {
		let process = this.processPool.pop();
		if (!process) {
			console.warn(
				"No available process in the pool, waiting for one to become available.",
			);
			// Wait a little and try again if no process is available
			await new Promise((resolve) => setTimeout(resolve, 100));
			if (this.processPool.length === 0) {
				console.warn("Process pool is empty, filling it up.");
				this.fillPool(); // Fill the pool if it's empty
			}

			process = this.processPool.pop();
			if (!process) {
				throw new Error("No available process to run the code.");
			}
		}

		this.fillPool(); // Ensure pool is filled after taking one out

		console.log(
			`Running code in process ${process.pid} from pool of size ${
				this.processPool.length + 1
			}`,
		);

		return new Promise<[number[], string, string]>((resolve, reject) => {
			process.stdin.write(code);
			process.stdin.end();

			let stdout = "";
			let stderr = "";
			process.stdout.on("data", (data) => {
				stdout += data.toString();
			});
			process.stderr.on("data", (data) => {
				stderr += data.toString();
			});
			process.on("close", (code) => {
				const allData = stdout.split("\n");
				const timeLines = allData.filter((line) => line.startsWith("_TIME$"));
				const times = timeLines.map((line) =>
					parseFloat(line.replace("_TIME$", "").trim()),
				);
				stdout = allData
					.filter((line) => !line.startsWith("_TIME$"))
					.join("\n");

				if (code !== 0) {
					return reject(
						new Error(`Docker exited with code ${code}: ${stderr}`),
					);
				}

				resolve([times, stdout, stderr]);
			});
		});
	}
}

let pythonRunner: CodeRunner;
let javascriptRunner: CodeRunner;

if (!(globalThis as any).__pythonRunner) {
	(globalThis as any).__pythonRunner = new CodeRunner("my-python-runner");
}
if (!(globalThis as any).__javascriptRunner) {
	(globalThis as any).__javascriptRunner = new CodeRunner(
		"my-javascript-runner",
	);
}

pythonRunner = (globalThis as any).__pythonRunner;
javascriptRunner = (globalThis as any).__javascriptRunner;

export { pythonRunner, javascriptRunner };
