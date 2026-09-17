import http from 'node:http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { setupWebSocketServer } from './yjs/websocketHandler.js';
import { documentManager } from './yjs/documentManager.js';
import { metadataStore } from './adapters/metadataStore.js';
import { pubsub } from './adapters/redisPubSub.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 1234;
app.use(cors());
app.use(express.json());
// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        clustered: pubsub.isClustered(),
        serverId: pubsub.getServerId(),
        activeRooms: documentManager.getAllRooms().length,
    });
});
// Document Telemetry Stats
app.get('/api/docs/:id/stats', (req, res) => {
    const docName = req.params.id || 'default';
    const room = documentManager.getRoom(docName);
    if (!room) {
        return res.status(404).json({ error: 'Room not found or not yet initialized' });
    }
    return res.json(room.getStats());
});
// Trigger Document State Compaction / Garbage Collection
app.post('/api/docs/:id/compact', async (req, res) => {
    const docName = req.params.id || 'default';
    const room = documentManager.getRoom(docName);
    if (!room) {
        return res.status(404).json({ error: 'Room not active' });
    }
    try {
        const result = await room.compact();
        return res.json({
            success: true,
            message: 'CRDT state snapshot compacted & garbage collected',
            ...result,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Metadata endpoints
app.get('/api/docs/:id/meta', async (req, res) => {
    const docName = req.params.id || 'default';
    const meta = await metadataStore.getMetadata(docName);
    return res.json(meta);
});
app.put('/api/docs/:id/title', async (req, res) => {
    const docName = req.params.id || 'default';
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Invalid title' });
    }
    const meta = await metadataStore.updateTitle(docName, title);
    return res.json(meta);
});
// Create HTTP and WebSocket servers
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
setupWebSocketServer(wss);
server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Collaborative Yjs Sync Hub running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/<docName>`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`======================================================\n`);
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
        console.log('Server terminated cleanly.');
        process.exit(0);
    });
});
