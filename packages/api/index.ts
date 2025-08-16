/**
 * @kanade/api - HiAnime API Client Package
 * 
 * Entry point for the @kanade/api package providing comprehensive
 * TypeScript client for HiAnime API interactions.
 * 
 * This package exports:
 * - HiAnimeClient class for custom configurations
 * - Default pre-configured client instance
 * - All TypeScript type definitions
 * - Utility constants and enums
 */

// Re-export everything from src/index.ts
export * from './src';

// Set default export to the pre-configured client instance
export { default } from './src';
