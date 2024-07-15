# Console Helper

A customizable console utility for Node.js enabling programmatic capture of logging, timing, and color formatting options.

## Installation

```bash
npm install console-helper
```

## Usage

```ts
import Console, { ConsoleOptions } from "console-helper";

const options: ConsoleOptions = {
  stdout: process.stdout,
  stderr: process.stderr,
  labels: true,
  writeToStreams: { stdout: true, stderr: true },
  colorMode: "auto"
};

const consoleInstance = new Console(options);

consoleInstance.log("This is an info message");
consoleInstance.warn("This is a warning message");
consoleInstance.error("This is an error message");

consoleInstance.time("process");
// some code
consoleInstance.timeEnd("process");
```

## API

### `Console(options: ConsoleOptions)`

Creates a new `Console` instance with the specified options.

#### `ConsoleOptions`

- `stdout` (required): Writable stream for standard output.
- `stderr` (optional): Writable stream for error output. Defaults to `stdout`.
- `ignoreErrors` (optional): Boolean to ignore errors. Defaults to `true`.
- `colorMode` (optional): Can be `"auto"`, `true`, or `false`. Defaults to `"auto"`.
- `inspectOptions` (optional): Options for `util.inspect`.
- `groupIndentation` (optional): Number of spaces for group indentation. Defaults to `2`.
- `labels` (optional): Boolean to include labels in logs. Defaults to `false`.
- `writeToStreams` (optional): Boolean or object specifying whether to write to `stdout` and/or `stderr`. Defaults to `false`.

### Methods

#### `log(...args: any[]): string`

Logs an info message to `stdout`.

#### `warn(...args: any[]): string`

Logs a warning message to `stderr` with yellow color.

#### `error(...args: any[]): string`

Logs an error message to `stderr` with red color.

#### `time(label?: string): void`

Starts a timer with an optional label.

#### `timeEnd(label?: string): string`

Ends a timer with the given label and logs the duration.

All functions that log also return a string containing what is/would be logged to the outputs.

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
