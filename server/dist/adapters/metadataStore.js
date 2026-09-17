import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.resolve(__dirname, '../../storage');
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata.json');
export class MetadataStore {
    cache = new Map();
    initialized = false;
    constructor() {
        this.init();
    }
    async init() {
        try {
            await fs.mkdir(STORAGE_DIR, { recursive: true });
            const data = await fs.readFile(METADATA_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            for (const [key, val] of Object.entries(parsed)) {
                this.cache.set(key, val);
            }
        }
        catch {
            // File doesn't exist yet, start empty
        }
        this.initialized = true;
    }
    async getMetadata(docName) {
        if (!this.initialized)
            await this.init();
        let meta = this.cache.get(docName);
        if (!meta) {
            meta = {
                id: docName,
                title: docName === 'default' ? 'Distributed Systems Hackathon Pitch' : docName.replace(/-/g, ' '),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                lastCompactedAt: Date.now(),
                version: 1,
            };
            this.cache.set(docName, meta);
            await this.save();
        }
        return meta;
    }
    async updateTitle(docName, title) {
        const meta = await this.getMetadata(docName);
        meta.title = title;
        meta.updatedAt = Date.now();
        await this.save();
        return meta;
    }
    async recordCompaction(docName) {
        const meta = await this.getMetadata(docName);
        meta.lastCompactedAt = Date.now();
        meta.updatedAt = Date.now();
        meta.version += 1;
        await this.save();
    }
    async save() {
        try {
            await fs.mkdir(STORAGE_DIR, { recursive: true });
            const obj = Object.fromEntries(this.cache.entries());
            await fs.writeFile(METADATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('[MetadataStore] Failed to write metadata.json', err);
        }
    }
}
export const metadataStore = new MetadataStore();
