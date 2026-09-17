import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { documentManager } from './documentManager.js';
import { MESSAGE_SYNC } from './documentManager.js';
import { MESSAGE_AWARENESS } from './awarenessHandler.js';
export const MESSAGE_AUTH = 2;
export const MESSAGE_QUERY_AWARENESS = 3;
export const MESSAGE_PING = 99; // Custom high-precision telemetry ping-pong
export function setupWebSocketServer(wss) {
    wss.on('connection', (conn, req) => {
        // 1. Extract room name from URL query parameter or path
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const docName = url.searchParams.get('room') || url.pathname.replace(/^\//, '') || 'default';
        const room = documentManager.getOrCreateRoom(docName);
        const controlledIds = new Set();
        room.conns.set(conn, controlledIds);
        console.log(`[WebSocket] Client connected to room '${docName}'. Active connections: ${room.conns.size}`);
        // 2. Send Initial Sync Step 1: Send server state vector to client
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.writeSyncStep1(encoder, room.ydoc);
        conn.send(encoding.toUint8Array(encoder));
        // 3. Send current room awareness states
        const awarenessStates = room.roomAwareness.awareness.getStates();
        if (awarenessStates.size > 0) {
            const awarenessEncoder = encoding.createEncoder();
            encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
            encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(room.roomAwareness.awareness, Array.from(awarenessStates.keys())));
            conn.send(encoding.toUint8Array(awarenessEncoder));
        }
        // 4. Handle incoming messages from client
        conn.on('message', (data) => {
            try {
                const uint8 = new Uint8Array(data);
                const decoder = decoding.createDecoder(uint8);
                const messageType = decoding.readVarUint(decoder);
                switch (messageType) {
                    case MESSAGE_SYNC: {
                        // Process Yjs sync message (Step 1, Step 2, or Update)
                        const replyEncoder = encoding.createEncoder();
                        encoding.writeVarUint(replyEncoder, MESSAGE_SYNC);
                        syncProtocol.readSyncMessage(decoder, replyEncoder, room.ydoc, conn);
                        // If a response is required (e.g. Sync Step 2 update payload), reply immediately
                        if (encoding.length(replyEncoder) > 1) {
                            conn.send(encoding.toUint8Array(replyEncoder));
                        }
                        break;
                    }
                    case MESSAGE_AWARENESS: {
                        // High-frequency cursor & presence update
                        const update = decoding.readVarUint8Array(decoder);
                        const clientsSet = new Set(room.conns.keys());
                        room.roomAwareness.handleAwarenessUpdate(update, conn, clientsSet);
                        break;
                    }
                    case MESSAGE_QUERY_AWARENESS: {
                        // Client requesting awareness state
                        const replyEncoder = encoding.createEncoder();
                        encoding.writeVarUint(replyEncoder, MESSAGE_AWARENESS);
                        encoding.writeVarUint8Array(replyEncoder, awarenessProtocol.encodeAwarenessUpdate(room.roomAwareness.awareness, Array.from(room.roomAwareness.awareness.getStates().keys())));
                        conn.send(encoding.toUint8Array(replyEncoder));
                        break;
                    }
                    case MESSAGE_PING: {
                        // Telemetry ping-pong: Echo back client timestamp with server timestamp
                        const clientTimestamp = decoding.readVarUint(decoder);
                        const pongEncoder = encoding.createEncoder();
                        encoding.writeVarUint(pongEncoder, MESSAGE_PING);
                        encoding.writeVarUint(pongEncoder, clientTimestamp);
                        encoding.writeVarUint(pongEncoder, Date.now());
                        conn.send(encoding.toUint8Array(pongEncoder));
                        break;
                    }
                    default:
                        console.warn(`[WebSocket] Unknown message type received: ${messageType}`);
                }
            }
            catch (err) {
                console.error('[WebSocket] Error processing message:', err);
            }
        });
        // 5. Handle connection close & awareness cleanup
        conn.on('close', () => {
            const ids = room.conns.get(conn);
            if (ids) {
                for (const clientId of ids) {
                    room.roomAwareness.removeClient(clientId);
                }
            }
            room.conns.delete(conn);
            console.log(`[WebSocket] Client disconnected from '${docName}'. Remaining: ${room.conns.size}`);
        });
        conn.on('error', (err) => {
            console.error(`[WebSocket] Connection error in room '${docName}':`, err);
        });
    });
}
