import * as Y from 'yjs';
import type { CrdtStructItem, CrdtVectorEntry } from '../types/index.js';

export class CrdtInspector {
  /**
   * Extracts current vector clocks (state vector) for all contributing clients
   */
  public static getVectorClocks(ydoc: Y.Doc): CrdtVectorEntry[] {
    const vectorEntries: CrdtVectorEntry[] = [];
    try {
      ydoc.store.clients.forEach((structs, clientId) => {
        if (structs.length > 0) {
          const lastStruct = structs[structs.length - 1];
          const maxClock = lastStruct.id.clock + lastStruct.length;
          vectorEntries.push({
            clientId,
            clock: maxClock,
          });
        }
      });
    } catch (err) {
      console.error('[CrdtInspector] Failed to parse state vector:', err);
    }
    return vectorEntries.sort((a, b) => a.clientId - b.clientId);
  }

  /**
   * Inspects the internal Yjs Struct Store (Item trees & GC blocks)
   */
  public static getStructItems(ydoc: Y.Doc, limit = 50): CrdtStructItem[] {
    const items: CrdtStructItem[] = [];
    try {
      ydoc.store.clients.forEach((structs, clientId) => {
        for (const struct of structs) {
          const isDeleted = (struct as any).deleted || struct.constructor.name === 'GC';
          let preview = '';

          if ((struct as any).content) {
            try {
              const c = (struct as any).content;
              if (c.getContent) {
                const raw = c.getContent();
                preview = typeof raw === 'string' ? raw : JSON.stringify(raw);
              } else if (c.str) {
                preview = c.str;
              }
            } catch {
              preview = '[Complex Content]';
            }
          }

          if (preview.length > 25) {
            preview = preview.slice(0, 22) + '...';
          }

          items.push({
            id: `${clientId}:${struct.id.clock}`,
            origin: (struct as any).origin ? `${(struct as any).origin.client}:${(struct as any).origin.clock}` : 'ROOT',
            length: struct.length,
            deleted: isDeleted,
            type: struct.constructor.name,
            contentPreview: preview || (isDeleted ? '[TOMBSTONE / DELETED]' : '[STRUCTURE]'),
          });

          if (items.length >= limit) break;
        }
      });
    } catch (err) {
      console.error('[CrdtInspector] Failed to inspect struct items:', err);
    }
    return items;
  }

  /**
   * Summarizes delete set ranges
   */
  public static getDeleteSetSummary(ydoc: Y.Doc): { clientId: number; count: number; ranges: string }[] {
    const summary: { clientId: number; count: number; ranges: string }[] = [];
    try {
      ydoc.store.clients.forEach((structs, clientId) => {
        let deletedCount = 0;
        const ranges: string[] = [];
        for (const s of structs) {
          if ((s as any).deleted) {
            deletedCount += s.length;
            ranges.push(`[${s.id.clock}..${s.id.clock + s.length}]`);
          }
        }
        if (deletedCount > 0) {
          summary.push({
            clientId,
            count: deletedCount,
            ranges: ranges.slice(0, 4).join(', ') + (ranges.length > 4 ? '...' : ''),
          });
        }
      });
    } catch {
      // Fallback
    }
    return summary;
  }

  /**
   * Computes the exact encoded CRDT binary size in bytes
   */
  public static getDocByteSize(ydoc: Y.Doc): number {
    try {
      return Y.encodeStateAsUpdate(ydoc).byteLength;
    } catch {
      return 0;
    }
  }
}
