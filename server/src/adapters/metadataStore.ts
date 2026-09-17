import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DocumentMetadata } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.resolve(__dirname, '../../storage');
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata.json');

export class MetadataStore {
  private cache: Map<string, DocumentMetadata> = new Map();
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
      const data = await fs.readFile(METADATA_FILE, 'utf-8');
      const parsed: Record<string, DocumentMetadata> = JSON.parse(data);
      for (const [key, val] of Object.entries(parsed)) {
        this.cache.set(key, val);
      }
    } catch {
      // File doesn't exist yet, start empty
    }
    this.initialized = true;
  }

  public async getMetadata(docName: string): Promise<DocumentMetadata> {
    if (!this.initialized) await this.init();
    let meta = this.cache.get(docName);
    if (!meta) {
      meta = {
        id: docName,
        title: docName === 'default' ? 'Distributed Systems Hackathon Pitch' : docName.replace(/-/g, ' '),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastCompactedAt: Date.now(),
        version: 1,
        inviteCode: Math.random().toString(36).substring(2, 10),
        collaborators: [],
      };
      this.cache.set(docName, meta);
      await this.save();
    }
    if (!meta.inviteCode) {
      meta.inviteCode = Math.random().toString(36).substring(2, 10);
      await this.save();
    }
    return meta;
  }

  public async listDocuments(userId?: string): Promise<DocumentMetadata[]> {
    if (!this.initialized) await this.init();
    
    // Seed an initial document if storage is completely empty
    if (this.cache.size === 0) {
      await this.getMetadata('knit-demo');
    }

    const allDocs = Array.from(this.cache.values());
    if (!userId) {
      return allDocs.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // Filter documents where user is owner, collaborator, or doc is public/demo
    return allDocs.filter((doc) => {
      if (!doc.ownerId || doc.id === 'knit-demo' || doc.id === 'default') return true;
      if (doc.ownerId === userId) return true;
      if (doc.collaborators?.some((c) => c.userId === userId)) return true;
      return false;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public async createDocument(params: {
    title: string;
    ownerId?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerAvatar?: string;
  }): Promise<DocumentMetadata> {
    if (!this.initialized) await this.init();

    const id = 'knit-' + Math.random().toString(36).substring(2, 9);
    const inviteCode = Math.random().toString(36).substring(2, 10);
    const now = Date.now();

    const newDoc: DocumentMetadata = {
      id,
      title: params.title || 'Untitled Knit Document',
      createdAt: now,
      updatedAt: now,
      lastCompactedAt: now,
      version: 1,
      ownerId: params.ownerId,
      ownerName: params.ownerName || 'Verified User',
      ownerEmail: params.ownerEmail,
      ownerAvatar: params.ownerAvatar,
      inviteCode,
      collaborators: [],
    };

    this.cache.set(id, newDoc);
    await this.save();
    return newDoc;
  }

  public async getByInviteCode(code: string): Promise<DocumentMetadata | null> {
    if (!this.initialized) await this.init();
    for (const doc of this.cache.values()) {
      if (doc.inviteCode === code) return doc;
    }
    return null;
  }

  public async addCollaborator(
    docId: string,
    collaborator: { userId: string; name: string; email: string; avatar?: string; role?: 'editor' | 'viewer' }
  ): Promise<DocumentMetadata | null> {
    const doc = await this.getMetadata(docId);
    if (!doc) return null;

    if (!doc.collaborators) doc.collaborators = [];

    // Check if user is already owner or collaborator
    if (doc.ownerId === collaborator.userId) return doc;
    const existingIndex = doc.collaborators.findIndex((c) => c.userId === collaborator.userId);
    if (existingIndex >= 0) {
      doc.collaborators[existingIndex].name = collaborator.name;
      doc.collaborators[existingIndex].email = collaborator.email;
    } else {
      doc.collaborators.push({
        userId: collaborator.userId,
        name: collaborator.name,
        email: collaborator.email,
        avatar: collaborator.avatar,
        role: collaborator.role || 'editor',
        addedAt: Date.now(),
      });
    }

    doc.updatedAt = Date.now();
    await this.save();
    return doc;
  }

  public async deleteDocument(docId: string, userId?: string): Promise<boolean> {
    if (!this.initialized) await this.init();
    const doc = this.cache.get(docId);
    if (!doc) return false;

    // If userId provided and doc has owner, enforce owner permission
    if (userId && doc.ownerId && doc.ownerId !== userId) {
      return false;
    }

    this.cache.delete(docId);
    await this.save();
    return true;
  }

  public async updateTitle(docName: string, title: string): Promise<DocumentMetadata> {
    const meta = await this.getMetadata(docName);
    meta.title = title;
    meta.updatedAt = Date.now();
    await this.save();
    return meta;
  }

  public async recordCompaction(docName: string): Promise<void> {
    const meta = await this.getMetadata(docName);
    meta.lastCompactedAt = Date.now();
    meta.updatedAt = Date.now();
    meta.version += 1;
    await this.save();
  }

  private async save(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
      const obj = Object.fromEntries(this.cache.entries());
      await fs.writeFile(METADATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[MetadataStore] Failed to write metadata.json', err);
    }
  }
}

export const metadataStore = new MetadataStore();
