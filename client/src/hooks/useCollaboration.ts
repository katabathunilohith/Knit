import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import type { UserProfile, ConnectionStatus, TransactionRecord, TimelineSnapshot } from '../types/index.js';
import { getRandomColor, getRandomName } from '../utils/colors.js';
import { AwarenessThrottler } from '../utils/awarenessThrottler.js';
import { CrdtInspector } from '../utils/crdtInspector.js';
import { getBackendConfig } from '../config/api.js';

const MESSAGE_PING = 99;

export function useCollaboration(docName = 'default') {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('collab_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    const newUser: UserProfile = {
      id: Math.floor(Math.random() * 1000000),
      name: getRandomName(),
      color: getRandomColor(),
      avatar: '',
    };
    localStorage.setItem('collab_user_profile', JSON.stringify(newUser));
    return newUser;
  });

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isIndexedDbSynced, setIsIndexedDbSynced] = useState(false);
  const [peers, setPeers] = useState<Map<number, any>>(new Map());
  const [pingMs, setPingMs] = useState(0);
  const [docSizeBytes, setDocSizeBytes] = useState(0);
  const [structCount, setStructCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [timelineSnapshots, setTimelineSnapshots] = useState<TimelineSnapshot[]>([]);
  const [timeTravelStep, setTimeTravelStep] = useState<number | null>(null);

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [throttler, setThrottler] = useState<AwarenessThrottler | null>(null);

  const providerRef = useRef<WebsocketProvider | null>(null);

  // Initialize Yjs, IndexedDB, and WebSocket Provider
  useEffect(() => {
    const activeYdoc = new Y.Doc({ gc: true });
    setYdoc(activeYdoc);

    // 1. Local-First: Initialize IndexedDB persistence FIRST
    const idbProvider = new IndexeddbPersistence(docName, activeYdoc);

    idbProvider.whenSynced.then(() => {
      console.log(`[Local-First] IndexedDB synced immediately for room: '${docName}'`);
      setIsIndexedDbSynced(true);
      setDocSizeBytes(CrdtInspector.getDocByteSize(activeYdoc));
      setStructCount(activeYdoc.store.clients.size);
    });

    // 2. Determine WebSocket Server URL
    const { wsUrl } = getBackendConfig();

    const wsProvider = new WebsocketProvider(wsUrl, docName, activeYdoc, {
      connect: true,
      maxBackoffTime: 2500,
    });
    providerRef.current = wsProvider;
    setProvider(wsProvider);

    // 3. Setup Awareness Throttler (~35ms)
    const activeThrottler = new AwarenessThrottler(wsProvider.awareness, 35);
    setThrottler(activeThrottler);

    // Set initial user presence
    wsProvider.awareness.setLocalStateField('user', {
      name: currentUser.name,
      color: currentUser.color,
    });

    // Track status events
    wsProvider.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        setStatus('connected');
      } else if (event.status === 'connecting') {
        setStatus('connecting');
      } else {
        setStatus((prev) => (prev === 'partitioned' ? 'partitioned' : 'disconnected'));
      }
    });

    // Track remote awareness updates
    const onAwarenessChange = () => {
      const states = wsProvider.awareness.getStates();
      setPeers(new Map(states));
    };
    wsProvider.awareness.on('change', onAwarenessChange);

    // Track Yjs transactions and updates
    activeYdoc.on('update', (update: Uint8Array, origin: any) => {
      const byteDelta = update.byteLength;
      const size = CrdtInspector.getDocByteSize(activeYdoc);
      let count = 0;
      activeYdoc.store.clients.forEach((c) => (count += c.length));

      setDocSizeBytes(size);
      setStructCount(count);

      if (origin !== 'indexeddb') {
        setTotalKeystrokes((prev) => prev + 1);
      }

      // Add to transaction stream
      const originStr =
        origin === wsProvider
          ? 'remote-peer'
          : origin === idbProvider || origin === 'indexeddb'
          ? 'local-indexeddb'
          : 'local-keystroke';

      const newRecord: TransactionRecord = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        origin: originStr,
        byteDelta,
        summary: `Delta: +${byteDelta}B [${originStr}]`,
        lamportClock: activeYdoc.clientID,
      };

      setTransactions((prev) => [newRecord, ...prev.slice(0, 49)]);

      // Record Time-Travel Mutation Snapshot
      let textSnippet = '';
      try {
        const yFragment = activeYdoc.getXmlFragment('default');
        textSnippet = yFragment.toJSON() || '';
        if (typeof textSnippet !== 'string') {
          textSnippet = JSON.stringify(textSnippet);
        }
      } catch {
        textSnippet = '';
      }

      setTimelineSnapshots((prev) => {
        const step = prev.length + 1;
        const snapshot: TimelineSnapshot = {
          id: 'step-' + step,
          step,
          timestamp: Date.now(),
          origin: originStr,
          summary: `${originStr === 'local-keystroke' ? 'Local edit' : originStr === 'remote-peer' ? 'Peer update' : 'Sync'} (+${byteDelta}B)`,
          textSnippet,
          docSizeBytes: size,
          structCount: count,
        };
        return [...prev.slice(-199), snapshot];
      });
    });

    // Setup High-Precision Latency Ping
    const pingInterval = setInterval(() => {
      if (wsProvider.ws && wsProvider.ws.readyState === WebSocket.OPEN) {
        const clientTimestamp = Date.now();
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_PING);
        encoding.writeVarUint(encoder, clientTimestamp);
        wsProvider.ws.send(encoding.toUint8Array(encoder));
      }
    }, 2000);

    // Intercept ping response on WebSocket
    const onWsMessage = (e: MessageEvent) => {
      if (e.data instanceof ArrayBuffer) {
        const uint8 = new Uint8Array(e.data);
        const decoder = decoding.createDecoder(uint8);
        const msgType = decoding.readVarUint(decoder);
        if (msgType === MESSAGE_PING) {
          const clientTimestamp = decoding.readVarUint(decoder);
          const rtt = Math.max(1, Date.now() - clientTimestamp);
          setPingMs(rtt);
        }
      }
    };

    // Attach message listener when WS is ready
    const attachWsListener = () => {
      if (wsProvider.ws) {
        wsProvider.ws.addEventListener('message', onWsMessage);
      }
    };
    wsProvider.on('sync', attachWsListener);
    wsProvider.on('status', attachWsListener);

    return () => {
      clearInterval(pingInterval);
      activeThrottler.destroy();
      wsProvider.awareness.off('change', onAwarenessChange);
      wsProvider.destroy();
      idbProvider.destroy();
      activeYdoc.destroy();
    };
  }, [docName]);

  // Update user profile in awareness
  const updateUserProfile = useCallback(
    (name: string, color: string) => {
      const updated = { ...currentUser, name, color };
      setCurrentUser(updated);
      localStorage.setItem('collab_user_profile', JSON.stringify(updated));
      if (providerRef.current) {
        providerRef.current.awareness.setLocalStateField('user', {
          name,
          color,
        });
      }
    },
    [currentUser]
  );

  // The Chaos Toggle: Simulate Network Partition
  const simulatePartition = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      setStatus('partitioned');
      console.warn('[ChaosEngine] ⚠️ Network Partition Activated! Offline editing enabled.');
    }
  }, []);

  // The Chaos Toggle: Heal Network Partition (Trigger Merge)
  const healPartition = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.connect();
      setStatus('connecting');
      console.log('[ChaosEngine] 🔄 Healing Network Partition! Reconnecting and merging CRDT state...');
    }
  }, []);

  return {
    ydoc,
    provider,
    throttler,
    status,
    isIndexedDbSynced,
    peers,
    pingMs,
    docSizeBytes,
    structCount,
    totalKeystrokes,
    transactions,
    timelineSnapshots,
    timeTravelStep,
    setTimeTravelStep,
    currentUser,
    updateUserProfile,
    simulatePartition,
    healPartition,
  };
}
