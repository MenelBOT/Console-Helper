"use strict";

import * as util from "util";

export interface ConsoleOptions {
	stdout: NodeJS.WritableStream;
	stderr?: NodeJS.WritableStream;
	ignoreErrors?: boolean;
	colorMode?: "auto" | boolean;
	inspectOptions?: util.InspectOptions;
	groupIndentation?: number;
	labels?: boolean;
	writeToStreams?: boolean | { stdout: boolean, stderr: boolean };
}

export default class Console {
	private _stdout: NodeJS.WritableStream;
	private _stderr: NodeJS.WritableStream;
	private _ignoreErrors: boolean;
	private _colorMode: "auto" | boolean;
	private _inspectOptions: util.InspectOptions;
	private _groupIndentation: number;
	private _groupIndent: string;
	private _times: Map<string, number>;
	private _labels: boolean;
	private _writeToStreams: boolean | { stdout: boolean, stderr: boolean };

	constructor(options: ConsoleOptions) {
		const {
			stdout,
			stderr = stdout,
			ignoreErrors = true,
			colorMode = "auto",
			inspectOptions = {},
			groupIndentation = 2,
			labels = false,
			writeToStreams = false
		} = options;

		if (!stdout || typeof stdout.write !== "function")
			throw new Error("ERR_CONSOLE_WRITABLE_STREAM: stdout");
		if (!stderr || typeof stderr.write !== "function")
			throw new Error("ERR_CONSOLE_WRITABLE_STREAM: stderr");

		this._stdout = stdout;
		this._stderr = stderr;
		this._ignoreErrors = ignoreErrors;
		this._colorMode = colorMode;
		this._inspectOptions = inspectOptions;
		this._groupIndentation = groupIndentation;
		this._groupIndent = "";
		this._times = new Map<string, number>();
		this._labels = labels;
		this._writeToStreams = writeToStreams;
	}

	public log(...args: any[]): string {
		if (this._labels)
			args.unshift("[INFO]");
		const message = this._formatForStdout(args);
		if (this._doWrite("stdout"))
			this._stdout.write(message);
		return message;
	}

	public warn(...args: any[]): string {
		if (this._labels)
			args.unshift("[WARN]");
		const message = this._formatForStderr(args, "yellow");
		if (this._doWrite("stderr"))
			this._stderr.write(message);
		return message;
	}

	public error(...args: any[]): string {
		if (this._labels)
			args.unshift("[ERROR]");
		const message = this._formatForStderr(args, "red");
		if (this._doWrite("stderr"))
			this._stderr.write(message);
		return message;
	}

	public time(label: string = "default"): void {
		this._times.set(label, Date.now());
	}

	public timeEnd(label: string = "default"): string {
		const startTime = this._times.get(label);
		if (!startTime)
			throw new Error(`Error: No such label '${label}' for console.timeEnd()`);

		const duration = Date.now() - startTime;
		this._times.delete(label);
		const message = this._formatForStdout([`${label}: ${duration}ms`]);

		if (this._doWrite("stdout"))
			this._stdout.write(message);
		return message;
	}

	private _getInspectOptions(stream: NodeJS.WritableStream): util.InspectOptions {
		let color = this._colorMode;
		if (color === "auto")
			color = this._isTTY(stream);

		return { ...this._inspectOptions, colors: color as boolean };
	}

	private _isTTY(stream: NodeJS.WritableStream): boolean {
		return (stream as any).isTTY === true;
	}

	private _formatForStdout(args: any[]): string {
		const opts = this._getInspectOptions(this._stdout);
		return util.formatWithOptions(opts, ...args) + "\n";
	}

	private _formatForStderr(args: any[], color: string): string {
		const opts = this._getInspectOptions(this._stderr);
		let formattedString = util.formatWithOptions(opts, ...args);

		if (opts.colors && util.inspect.colors && util.inspect.colors[color])
			formattedString = `\u001b[${util.inspect.colors[color][0]}m${formattedString}\u001b[${util.inspect.colors[color][1]}m`;

		return formattedString + "\n";
	}

	private _doWrite(stream: "stdout" | "stderr"): boolean {
		if (typeof this._writeToStreams === "boolean")
			return this._writeToStreams;
		return !!this._writeToStreams[stream];
	}
}
