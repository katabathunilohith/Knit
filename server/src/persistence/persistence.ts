import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Y from 'yjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOMS_DIR = path.resolve(__dirname, '../../storage/rooms');

export class BinaryDiskPersistence {
  private pendingSaves: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(ROOMS_DIR, { recursive: true });
      this.isInitialized = true;
    } catch (err) {
      console.error('[BinaryDiskPersistence] Failed to create storage dir', err);
    }
  }

  private getDocPath(docName: string): string {
    const sanitized = docName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(ROOMS_DIR, `${sanitized}.bin`);
  }

  /**
   * Loads the persisted state from disk and applies it to the Y.Doc.
   * Returns true if previous state was found and loaded.
   */
  public async loadDocument(docName: string, ydoc: Y.Doc): Promise<boolean> {
    if (!this.isInitialized) await this.init();
    const filePath = this.getDocPath(docName);
    try {
      const buffer = await fs.readFile(filePath);
      if (buffer.byteLength > 0) {
        const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        Y.applyUpdate(ydoc, uint8, 'disk-persistence-load');
        console.log(`[BinaryDiskPersistence] Loaded '${docName}' (${buffer.byteLength} bytes) from disk.`);
        return true;
      }
    } catch {
      // File does not exist yet; new document
    }
    return false;
  }

  /**
   * Debounces snapshot save to disk to handle high-frequency typing
   * without blocking disk I/O.
   */
  public queueSave(docName: string, ydoc: Y.Doc, delayMs = 1000): void {
    const existing = this.pendingSaves.get(docName);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
      this.pendingSaves.delete(docName);
      await this.saveImmediate(docName, ydoc);
    }, delayMs);

    this.pendingSaves.set(docName, timer);
  }

  /**
   * Immediately writes full Y.Doc state snapshot as Uint8Array to disk.
   */
  public async saveImmediate(docName: string, ydoc: Y.Doc): Promise<number> {
    if (!this.isInitialized) await this.init();
    const filePath = this.getDocPath(docName);
    try {
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);
      await fs.writeFile(filePath, Buffer.from(stateUpdate));
      return stateUpdate.byteLength;
    } catch (err) {
      console.error(`[BinaryDiskPersistence] Error saving '${docName}':`, err);
      return 0;
    }
  }

  public async getDocSizeBytes(docName: string): Promise<number> {
    try {
      const stat = await fs.stat(this.getDocPath(docName));
      return stat.size;
    } catch {
      return 0;
    }
  }
}

export const persistence = new BinaryDiskPersistence();
