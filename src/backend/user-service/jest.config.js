export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	testMatch: ['**/__tests__/*.test.ts', '**/?(*.)+(spec|test).ts'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
		'!src/index.ts',
		'!src/generated/**',
	],
	setupFilesAfterEnv: ['./src/__tests__/setup.ts'],
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
};