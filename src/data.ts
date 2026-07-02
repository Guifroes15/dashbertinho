import { GROUPS, IDEAS } from './data/index';

// Re-export for compatibility with older imports
export { GROUPS, IDEAS };

// Backward compatibility: some views might still expect STORES
export const STORES = GROUPS.flatMap(g => g.stores);

// Additional backwards compatibility if needed
export const ultimoMes = 'Set/25'; 
