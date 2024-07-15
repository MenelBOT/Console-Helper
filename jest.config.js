export default {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	testMatch: ["**/test/**/*.test.ts"],
	moduleFileExtensions: ["ts", "tsx", "js"],
	transform: {
		"^.+\\.tsx?$": ["ts-jest", {
			useESM: true
		}]
	}
};
