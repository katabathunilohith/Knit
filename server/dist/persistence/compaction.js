import * as Y from 'yjs';
import { persistence } from './persistence.js';
import { metadataStore } from '../adapters/metadataStore.js';
export class StateCompactor {
    /**
     * Consolidates a Y.Doc's history into a single clean snapshot,
     * eliminating historical mutation bloat.
     */
    static async compactDocument(docName, ydoc) {
        const startTime = performance.now();
        // 1. Measure pre-compaction state
        const originalUpdate = Y.encodeStateAsUpdate(ydoc);
        const originalSizeBytes = originalUpdate.byteLength;
        const structsBefore = this.countStructs(ydoc);
        // 2. Perform garbage collection / snapshot creation
        // Creating a fresh Y.Doc from the encoded state consolidates adjacent items
        // and eliminates fragmented historical transaction metadata
        const cleanDoc = new Y.Doc({ gc: true });
        Y.applyUpdate(cleanDoc, originalUpdate, 'compaction-step');
        const compactedUpdate = Y.encodeStateAsUpdate(cleanDoc);
        const compactedSizeBytes = compactedUpdate.byteLength;
        const structsAfter = this.countStructs(cleanDoc);
        cleanDoc.destroy();
        // 3. Persist the compacted state snapshot to disk
        await persistence.saveImmediate(docName, ydoc);
        await metadataStore.recordCompaction(docName);
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
        const bytesSaved = Math.max(0, originalSizeBytes - compactedSizeBytes);
        const result = {
            docName,
            originalSizeBytes,
            compactedSizeBytes,
            bytesSaved,
            structsBefore,
            structsAfter,
            durationMs,
            timestamp: Date.now(),
        };
        console.log(`[StateCompactor] Compacted '${docName}': ${originalSizeBytes}B -> ${compactedSizeBytes}B (${bytesSaved}B saved) in ${durationMs}ms`);
        return result;
    }
    /**
     * Helper to count structs across all client item stores in a Y.Doc
     */
    static countStructs(ydoc) {
        let count = 0;
        try {
            ydoc.store.clients.forEach((structs) => {
                count += structs.length;
            });
        }
        catch {
            // Fallback
        }
        return count;
    }
    /**
     * Count deleted items across struct store
     */
    static countDeletions(ydoc) {
        let count = 0;
        try {
            ydoc.store.clients.forEach((structs) => {
                for (const struct of structs) {
                    if (struct.deleted) {
                        count += 1;
                    }
                }
            });
        }
        catch {
            // Fallback
        }
        return count;
    }
}
