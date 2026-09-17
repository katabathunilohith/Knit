/**
 * Knit API & WebSocket Configuration
 * 
 * Automatically resolves the WebSocket and HTTP endpoints for local development
 * or multi-node production deployment on platforms like Vercel + Render/Railway.
 */

export interface BackendConfig {
  wsUrl: string;
  apiUrl: string;
}

export function getBackendConfig(): BackendConfig {
  const envWs = import.meta.env.VITE_WS_URL?.trim();
  const envApi = import.meta.env.VITE_API_URL?.trim();

  // 1. If both are explicitly provided
  if (envWs && envApi) {
    return {
      wsUrl: envWs.replace(/\/$/, ''),
      apiUrl: envApi.replace(/\/$/, ''),
    };
  }

  // 2. If only WebSocket URL is provided (e.g. wss://knit-server.onrender.com)
  if (envWs) {
    const wsClean = envWs.replace(/\/$/, '');
    const apiDerived = wsClean.startsWith('wss://')
      ? wsClean.replace('wss://', 'https://')
      : wsClean.replace('ws://', 'http://');
    return {
      wsUrl: wsClean,
      apiUrl: apiDerived,
    };
  }

  // 3. If only HTTP API URL is provided (e.g. https://knit-server.onrender.com)
  if (envApi) {
    const apiClean = envApi.replace(/\/$/, '');
    const wsDerived = apiClean.startsWith('https://')
      ? apiClean.replace('https://', 'wss://')
      : apiClean.replace('http://', 'ws://');
    return {
      wsUrl: wsDerived,
      apiUrl: apiClean,
    };
  }

  // 4. Fallback for Local Development vs Deployed Host
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0');

  if (isLocal) {
    return {
      wsUrl: 'ws://localhost:1234',
      apiUrl: 'http://localhost:1234',
    };
  }

  // Production fallback: If deployed without environment variables, attempt relative/secure same-host port 1234
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return {
    wsUrl: `${wsProtocol}//${window.location.hostname}:1234`,
    apiUrl: `${protocol}//${window.location.hostname}:1234`,
  };
}
