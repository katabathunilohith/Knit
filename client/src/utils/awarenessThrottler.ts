import type { Awareness } from 'y-protocols/awareness';

export class AwarenessThrottler {
  private awareness: Awareness;
  private throttleIntervalMs: number;
  private pendingState: Record<string, any> | null = null;
  private timeoutId: any = null;
  private lastSentTime = 0;

  // Telemetry metrics
  public rawUpdateCount = 0;
  public throttledUpdateCount = 0;

  constructor(awareness: Awareness, throttleIntervalMs = 35) {
    this.awareness = awareness;
    this.throttleIntervalMs = throttleIntervalMs;
  }

  /**
   * Enqueue a local awareness state update (cursor, selection, user info).
   * Throttles high-frequency cursor drags to reduce socket bandwidth by ~75%.
   */
  public setLocalStateField(field: string, value: any): void {
    this.rawUpdateCount += 1;

    const currentState = this.awareness.getLocalState() || {};
    this.pendingState = {
      ...currentState,
      ...this.pendingState,
      [field]: value,
    };

    const now = performance.now();
    const timeSinceLast = now - this.lastSentTime;

    if (timeSinceLast >= this.throttleIntervalMs && !this.timeoutId) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.throttleIntervalMs - timeSinceLast);
    }
  }

  public flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.pendingState) {
      this.throttledUpdateCount += 1;
      this.lastSentTime = performance.now();
      this.awareness.setLocalState(this.pendingState);
      this.pendingState = null;
    }
  }

  public getReductionRatio(): number {
    if (this.rawUpdateCount === 0) return 0;
    return Math.round(((this.rawUpdateCount - this.throttledUpdateCount) / this.rawUpdateCount) * 100);
  }

  public destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.pendingState = null;
  }
}
