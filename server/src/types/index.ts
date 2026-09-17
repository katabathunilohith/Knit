export interface ClientInfo {
  id: number;
  name: string;
  color: string;
  connectedAt: number;
  lastPing?: number;
}

export interface DocumentStats {
  docName: string;
  connectedClients: number;
  docSizeBytes: number;
  structCount: number;
  deleteSetCount: number;
  lastCompactedAt: number | null;
  uptimeSeconds: number;
  memoryUsageMb: number;
}

export interface CompactionResult {
  docName: string;
  originalSizeBytes: number;
  compactedSizeBytes: number;
  bytesSaved: number;
  structsBefore: number;
  structsAfter: number;
  durationMs: number;
  timestamp: number;
}

export interface CollaboratorInfo {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastCompactedAt: number;
  version: number;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  inviteCode: string;
  collaborators?: CollaboratorInfo[];
}
