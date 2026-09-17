export interface UserProfile {
  id: number;
  name: string;
  color: string;
  avatar: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'partitioned';

export interface TelemetryData {
  pingMs: number;
  docSizeBytes: number;
  peerCount: number;
  structCount: number;
  deleteSetCount: number;
  isIndexedDbSynced: boolean;
  totalKeystrokes: number;
  status: ConnectionStatus;
  memoryUsageEstimate: number;
}

export interface CrdtStructItem {
  id: string;
  origin: string;
  length: number;
  deleted: boolean;
  type: string;
  contentPreview: string;
}

export interface CrdtVectorEntry {
  clientId: number;
  clock: number;
}

export interface TransactionRecord {
  id: string;
  timestamp: number;
  origin: string;
  byteDelta: number;
  summary: string;
  lamportClock: number;
}
