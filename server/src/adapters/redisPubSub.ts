import EventEmitter from 'node:events';
import { Redis } from 'ioredis';

export interface PubSubMessage {
  docName: string;
  type: 'update' | 'awareness' | 'compaction';
  payload: string; // Base64 encoded binary payload
  senderServerId: string;
  timestamp: number;
}

export class DistributedPubSub extends EventEmitter {
  private redisPub: Redis | null = null;
  private redisSub: Redis | null = null;
  private isRedisActive = false;
  private serverId = `srv-${Math.random().toString(36).substring(2, 9)}`;

  constructor() {
    super();
    this.init();
  }

  private async init() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redisPub = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
        this.redisSub = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });

        await Promise.all([this.redisPub.connect(), this.redisSub.connect()]);
        this.isRedisActive = true;
        console.log(`[DistributedPubSub] Connected to Redis at ${redisUrl} (Multi-Instance Active)`);

        await this.redisSub.subscribe('crdt:doc:updates');
        this.redisSub.on('message', (_channel: string, message: string) => {
          try {
            const parsed: PubSubMessage = JSON.parse(message);
            if (parsed.senderServerId !== this.serverId) {
              this.emit('remoteUpdate', parsed);
            }
          } catch (err) {
            console.error('[DistributedPubSub] Failed to parse message', err);
          }
        });
      } catch (err) {
        console.warn(`[DistributedPubSub] Redis connection failed (${(err as Error).message}). Using in-memory event bus.`);
        this.isRedisActive = false;
      }
    } else {
      console.log(`[DistributedPubSub] Running with high-performance In-Memory Event Bus (Standalone/Hackathon Mode). Set REDIS_URL to enable multi-instance scaling.`);
    }
  }

  public async broadcastUpdate(docName: string, updateUint8: Uint8Array): Promise<void> {
    const payload = Buffer.from(updateUint8).toString('base64');
    const msg: PubSubMessage = {
      docName,
      type: 'update',
      payload,
      senderServerId: this.serverId,
      timestamp: Date.now(),
    };

    if (this.isRedisActive && this.redisPub) {
      try {
        await this.redisPub.publish('crdt:doc:updates', JSON.stringify(msg));
      } catch (err) {
        console.error('[DistributedPubSub] Redis publish error:', err);
      }
    }
    // Also emit locally for listeners
    this.emit('localUpdate', msg);
  }

  public getServerId(): string {
    return this.serverId;
  }

  public isClustered(): boolean {
    return this.isRedisActive;
  }
}

export const pubsub = new DistributedPubSub();
