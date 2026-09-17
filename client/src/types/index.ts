export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  color: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  inviteCode: string;
  collaborators?: Array<{
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer';
    addedAt: number;
  }>;
}

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

export interface TimelineSnapshot {
  id: string;
  step: number;
  timestamp: number;
  origin: string;
  summary: string;
  textSnippet: string;
  fullContent?: string;
  docSizeBytes: number;
  structCount: number;
}

export interface RunbookBlock {
  id: string;
  title: string;
  description: string;
  code: string;
  language: 'javascript' | 'typescript' | 'python';
  lastRunAt?: number;
  lastRunBy?: string;
  output?: string;
  error?: string;
  durationMs?: number;
}
