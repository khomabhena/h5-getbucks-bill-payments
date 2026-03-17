/**
 * GetBucks Bank API Service
 * Main export for GetBucks Bank integration
 */

export { getBucksAuth, default as GetBucksAuth } from './GetBucksAuth.js';
export { getBucksAPI, default as GetBucksAPI } from './GetBucksAPI.js';

// Re-export for convenience
import { getBucksAPI } from './GetBucksAPI.js';
export default getBucksAPI;

