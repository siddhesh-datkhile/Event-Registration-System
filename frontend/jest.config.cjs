module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass|svg|png|jpg|jpeg|gif)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        verbatimModuleSyntax: false,
        types: ['jest', '@testing-library/jest-dom']
      }
    }]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'json-summary', 'text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ]
}
