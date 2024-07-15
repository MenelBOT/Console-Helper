import { Writable } from "node:stream";
import Console, { ConsoleOptions } from "../src/index";

// Mock WritableStream for testing
class MockWritableStream extends Writable {
	public data: string = "";
	_write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
		this.data += chunk.toString();
		callback();
	}
}

describe("Console class", () => {
	let stdout: MockWritableStream;
	let stderr: MockWritableStream;
	let consoleInstance: Console;

	beforeEach(() => {
		stdout = new MockWritableStream();
		stderr = new MockWritableStream();
		const options: ConsoleOptions = {
			stdout,
			stderr,
			labels: true,
			writeToStreams: { stdout: true, stderr: true }
		};
		consoleInstance = new Console(options);
	});

	test("should initialize with proper defaults", () => {
		expect(() => new Console({ stdout })).not.toThrow();
	});

	test("should throw an error if stdout is not provided", () => {
		expect(() => new Console({} as ConsoleOptions)).toThrow("ERR_CONSOLE_WRITABLE_STREAM: stdout");
	});

	test("log method should write to stdout", () => {
		const message = "Hello, World!";
		const result = consoleInstance.log(message);
		expect(stdout.data).toContain("[INFO] Hello, World!");
		expect(result).toBe("[INFO] Hello, World!\n");
	});

	test("warn method should write to stderr", () => {
		const message = "This is a warning!";
		const result = consoleInstance.warn(message);
		expect(stderr.data).toContain("[WARN] This is a warning!");
		expect(result).toBe("[WARN] This is a warning!\n");
	});

	test("error method should write to stderr", () => {
		const message = "This is an error!";
		const result = consoleInstance.error(message);
		expect(stderr.data).toContain("[ERROR] This is an error!");
		expect(result).toBe("[ERROR] This is an error!\n");
	});

	test("time and timeEnd methods should correctly measure time", () => {
		jest.useFakeTimers();
		consoleInstance.time("test");
		const delay = 100;
		setTimeout(() => {
			const result = consoleInstance.timeEnd("test");
			expect(stdout.data).toMatch(/test: \d+ms\n/);
			expect(result).toMatch(/test: \d+ms\n/);
		}, delay);
		jest.advanceTimersByTime(delay);
	});

	test("timeEnd should throw an error if label does not exist", () => {
		expect(() => consoleInstance.timeEnd("nonexistent")).toThrow("Error: No such label 'nonexistent' for console.timeEnd()");
	});

	test("log method should correctly handle inspect options", () => {
		const circularObj: any = {};
		circularObj.self = circularObj; // create a circular reference
		const result = consoleInstance.log(circularObj);
		expect(result).toContain("[INFO] <ref *1> { self: [Circular *1] }\n");
	});

	test("colorMode option should affect message formatting", () => {
		const options: ConsoleOptions = {
			stdout,
			colorMode: true,
			writeToStreams: true
		};
		const consoleWithColor = new Console(options);
		const message = "Colorful message";
		const result = consoleWithColor.warn(message);
		expect(result).toBe("\u001b[33mColorful message\u001b[39m\n");
	});
});
