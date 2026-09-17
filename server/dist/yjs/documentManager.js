import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import { RoomAwareness } from './awarenessHandler.js';
import { persistence } from '../persistence/persistence.js';
import { StateCompactor } from '../persistence/compaction.js';
import { pubsub } from '../adapters/redisPubSub.js';
export const MESSAGE_SYNC = 0;
export class CollaborativeRoom {
    docName;
    ydoc;
    conns = new Map();
    roomAwareness;
    createdAt = Date.now();
    lastCompactedAt = null;
    constructor(docName) {
        this.docName = docName;
        this.ydoc = new Y.Doc({ gc: true });
        this.roomAwareness = new RoomAwareness(this.ydoc);
        this.setupDocListeners();
        this.loadInitialState();
    }
    async loadInitialState() {
        const loaded = await persistence.loadDocument(this.docName, this.ydoc);
        if (!loaded) {
            this.seedInitialContent();
        }
    }
    /**
     * Seeds an impressive, comprehensive initial document if room is brand new
     */
    seedInitialContent() {
        // TipTap uses a Y.XmlFragment named 'default' (or ProseMirror document fragment)
        const xmlFragment = this.ydoc.getXmlFragment('default');
        if (xmlFragment.length === 0) {
            this.ydoc.transact(() => {
                const titlePara = new Y.XmlElement('paragraph');
                const titleText = new Y.XmlText();
                titleText.insert(0, '⚡ Distributed Systems Hackathon: Real-Time Collaborative Editor');
                titlePara.insert(0, [titleText]);
                const introPara = new Y.XmlElement('paragraph');
                const introText = new Y.XmlText();
                introText.insert(0, 'Welcome to the zero-data-loss collaborative rich-text editor powered by TipTap, Yjs CRDTs, and local-first IndexedDB persistence.');
                introPara.insert(0, [introText]);
                const bulletPara = new Y.XmlElement('paragraph');
                const bulletText = new Y.XmlText();
                bulletText.insert(0, '🔥 Hackathon Features to Test:\n' +
                    '• Chaos Toggle (Network Partition Simulator): Click the orange switch in the header to cut WebSockets, type offline, then reconnect to observe instant conflict-free merges.\n' +
                    '• Sub-millisecond Remote Cursors: Watch presence tags and real-time carets rendered with zero lag.\n' +
                    '• Telemetry HUD: Real-time latency tracking, byte-level CRDT document size, and peer counters.\n' +
                    '• The Judge\'s Console: Press Cmd+Shift+D (or click in HUD) to inspect raw Vector Clocks and the CRDT Item Tree in real-time!');
                bulletPara.insert(0, [bulletText]);
                xmlFragment.insert(0, [titlePara, introPara, bulletPara]);
            }, 'seed-initial-content');
        }
    }
    setupDocListeners() {
        this.ydoc.on('update', (update, origin) => {
            // 1. Prepare sync update message (Sync protocol)
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, MESSAGE_SYNC);
            syncProtocol.writeUpdate(encoder, update);
            const message = encoding.toUint8Array(encoder);
            // 2. Broadcast to all other connected clients in room
            for (const [conn] of this.conns) {
                if (conn !== origin && conn.readyState === 1 /* OPEN */) {
                    conn.send(message);
                }
            }
            // 3. Debounce save to disk in Uint8Array format
            persistence.queueSave(this.docName, this.ydoc);
            // 4. If update came from local client, broadcast to Redis PubSub for multi-server clusters
            if (origin !== 'redis-pubsub-remote') {
                pubsub.broadcastUpdate(this.docName, update);
            }
        });
        // Listen for remote updates from Redis PubSub
        pubsub.on('remoteUpdate', (msg) => {
            if (msg.docName === this.docName) {
                const update = new Uint8Array(Buffer.from(msg.payload, 'base64'));
                Y.applyUpdate(this.ydoc, update, 'redis-pubsub-remote');
            }
        });
    }
    getStats() {
        const docSize = Y.encodeStateAsUpdate(this.ydoc).byteLength;
        return {
            docName: this.docName,
            connectedClients: this.conns.size,
            docSizeBytes: docSize,
            structCount: StateCompactor.countStructs(this.ydoc),
            deleteSetCount: StateCompactor.countDeletions(this.ydoc),
            lastCompactedAt: this.lastCompactedAt,
            uptimeSeconds: Math.floor((Date.now() - this.createdAt) / 1000),
            memoryUsageMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        };
    }
    async compact() {
        const result = await StateCompactor.compactDocument(this.docName, this.ydoc);
        this.lastCompactedAt = result.timestamp;
        return result;
    }
}
export class DocumentManager {
    rooms = new Map();
    getOrCreateRoom(docName) {
        let room = this.rooms.get(docName);
        if (!room) {
            room = new CollaborativeRoom(docName);
            this.rooms.set(docName, room);
            console.log(`[DocumentManager] Created collaborative room: '${docName}'`);
        }
        return room;
    }
    getRoom(docName) {
        return this.rooms.get(docName);
    }
    getAllRooms() {
        return Array.from(this.rooms.keys());
    }
}
export const documentManager = new DocumentManager();
