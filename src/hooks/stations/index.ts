
// Re-export all station-related hooks
export * from './useStationsData';
export * from './useSessionsData';
export * from './useSessionActions';
export * from './useEndSession';

// Add a specific named export for backward compatibility
export const useStations = useStationsData;

