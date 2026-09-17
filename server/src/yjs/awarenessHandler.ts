import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import type { WebSocket } from 'ws';

export const MESSAGE_AWARENESS = 1;

export class RoomAwareness {
  public awareness: awarenessProtocol.Awareness;
  private awarenessStats = {
    totalUpdates: 0,
    lastUpdateTimestamp: Date.now(),
  };

  constructor(ydoc: any) {
    this.awareness = new awarenessProtocol.Awareness(ydoc);
  }

  /**
   * Handle incoming raw awareness binary update from a client.
   * Separated completely from document persistence to ensure zero disk I/O
   * during rapid cursor movements.
   */
  public handleAwarenessUpdate(
    update: Uint8Array,
    senderWs: WebSocket,
    roomClients: Set<WebSocket>
  ): void {
    this.awarenessStats.totalUpdates += 1;
    this.awarenessStats.lastUpdateTimestamp = Date.now();

    // Apply the update to the server's awareness instance
    awarenessProtocol.applyAwarenessUpdate(this.awareness, update, senderWs);

    // Prepare outbound broadcast message with message code 1 (MESSAGE_AWARENESS)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(encoder, update);
    const message = encoding.toUint8Array(encoder);

    // Broadcast only to OTHER clients in this room
    for (const client of roomClients) {
      if (client !== senderWs && client.readyState === 1 /* OPEN */) {
        client.send(message);
      }
    }
  }

  /**
   * Cleans up client awareness when socket disconnects
   */
  public removeClient(clientId: number): void {
    awarenessProtocol.removeAwarenessStates(this.awareness, [clientId], 'disconnect');
  }

  public getConnectedUserStates(): Map<number, any> {
    return this.awareness.getStates();
  }

  public getStats() {
    return {
      ...this.awarenessStats,
      activePeers: this.awareness.getStates().size,
    };
  }

  public destroy(): void {
    this.awareness.destroy();
  }
}
