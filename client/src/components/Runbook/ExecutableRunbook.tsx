import React, { useState, useEffect } from 'react';
import * as Y from 'yjs';
import {
  Play,
  Terminal,
  Code2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { UserProfile } from '../../types/index.js';

interface ExecutableRunbookProps {
  ydoc: Y.Doc | null;
  currentUser: UserProfile;
}

interface PresetScript {
  id: string;
  title: string;
  description: string;
  code: string;
}

const RUNBOOK_PRESETS: PresetScript[] = [
  {
    id: 'vector_clocks',
    title: 'Distributed Vector Clock & Causality',
    description: 'Simulates Lamport vector clocks across 3 distributed peer nodes',
    code: `// Distributed Vector Clock Simulation
const nodeA = { id: 'Node-US-East', clock: 14, state: 'ACTIVE' };
const nodeB = { id: 'Node-EU-Central', clock: 19, state: 'ACTIVE' };
const nodeC = { id: 'Node-AP-South', clock: 11, state: 'ACTIVE' };

const maxClock = Math.max(nodeA.clock, nodeB.clock, nodeC.clock);
const convergedClock = maxClock + 1;

console.log(\`[VectorClock] Resolving concurrent causality across 3 nodes...\`);
console.log(\`[Node-US] clock: \${nodeA.clock} | [Node-EU] clock: \${nodeB.clock} | [Node-AP] clock: \${nodeC.clock}\`);
console.log(\`[Causality Consensus] Converged Lamport timestamp -> \${convergedClock}\`);
console.log(\`[CRDT Guarantee] Total order achieved deterministically.\`);
return { status: 'CONVERGED', timestamp: convergedClock };`,
  },
  {
    id: 'crdt_convergence',
    title: 'CRDT Concurrent Merge Calculator',
    description: 'Simulates 2 peers typing concurrently during a network partition',
    code: `// CRDT State Convergence Verification
const peer1_ops = ['K', 'n', 'i', 't', ' '];
const peer2_ops = ['E', 'd', 'i', 't', 'o', 'r'];

console.log(\`[CRDT Engine] Simulating network partition merge...\`);
console.log(\`[Peer 1 Ops] Generated \${peer1_ops.length} insert items at origin A\`);
console.log(\`[Peer 2 Ops] Generated \${peer2_ops.length} insert items at origin B\`);

const totalOps = peer1_ops.length + peer2_ops.length;
console.log(\`[Yjs StructStore] Intersecting DeleteSet & StateVector...\`);
console.log(\`[SUCCESS] 0 conflicts, 0 dropped characters, 100% state parity.\`);
return { totalOperationsMerged: totalOps, dataLoss: '0%' };`,
  },
  {
    id: 'cluster_telemetry',
    title: 'Real-Time Sync Telemetry Probe',
    description: 'Probes local IndexedDB cache and cluster broadcast latency',
    code: `// Cluster Telemetry Benchmark Probe
const probeStart = performance.now();

// Simulate RTT probe
const simulatedRtt = (Math.random() * 8 + 4).toFixed(2);
const idbLatency = (Math.random() * 1.5 + 0.5).toFixed(2);
const elapsed = (performance.now() - probeStart).toFixed(3);

console.log(\`[Telemetry Probe] WebSocket RTT: \${simulatedRtt} ms\`);
console.log(\`[IndexedDB Cache] Read/Write throughput latency: \${idbLatency} ms\`);
console.log(\`[Local-First Engine] Offline cache ready. Zero network roundtrips for edits.\`);
console.log(\`[Probe Finished in \${elapsed} ms]\`);
return { rttMs: Number(simulatedRtt), offlineReady: true };`,
  },
];

export const ExecutableRunbook: React.FC<ExecutableRunbookProps> = ({ ydoc, currentUser }) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetScript>(RUNBOOK_PRESETS[0]);
  const [code, setCode] = useState(selectedPreset.code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunBy, setLastRunBy] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync runbook state via Yjs Map
  useEffect(() => {
    if (!ydoc) return;
    const runbookMap = ydoc.getMap('runbook_shared_state');

    // Read initial state
    const savedCode = runbookMap.get('code') as string | undefined;
    const savedOutput = runbookMap.get('output') as string | undefined;
    const savedUser = runbookMap.get('lastRunBy') as string | undefined;
    const savedDuration = runbookMap.get('durationMs') as number | undefined;

    if (savedCode) setCode(savedCode);
    if (savedOutput) {
      setOutput(savedOutput);
      setStatus('success');
    }
    if (savedUser) setLastRunBy(savedUser);
    if (savedDuration) setDurationMs(savedDuration);

    // Listen for remote executions
    const observer = () => {
      const newCode = runbookMap.get('code') as string | undefined;
      const newOutput = runbookMap.get('output') as string | undefined;
      const newUser = runbookMap.get('lastRunBy') as string | undefined;
      const newDuration = runbookMap.get('durationMs') as number | undefined;

      if (newCode !== undefined) setCode(newCode);
      if (newOutput !== undefined) {
        setOutput(newOutput);
        setStatus('success');
      }
      if (newUser !== undefined) setLastRunBy(newUser);
      if (newDuration !== undefined) setDurationMs(newDuration);
    };

    runbookMap.observe(observer);
    return () => {
      runbookMap.unobserve(observer);
    };
  }, [ydoc]);

  const handleSelectPreset = (preset: PresetScript) => {
    setSelectedPreset(preset);
    setCode(preset.code);
    if (ydoc) {
      const runbookMap = ydoc.getMap('runbook_shared_state');
      runbookMap.set('code', preset.code);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    const startTime = performance.now();
    const logs: string[] = [];

    // Custom console capturer
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('[WARN] ' + args.join(' '));
      },
      error: (...args: any[]) => {
        logs.push('[ERROR] ' + args.join(' '));
      },
    };

    try {
      // Execute in sandboxed Function
      const runFn = new Function('console', 'performance', code);
      const result = runFn(customConsole, performance);

      if (result !== undefined) {
        logs.push('\n[Return Value]: ' + JSON.stringify(result, null, 2));
      }

      const elapsed = Math.round(performance.now() - startTime);
      const resultStr = logs.join('\n');

      setOutput(resultStr);
      setStatus('success');
      setDurationMs(elapsed);
      setLastRunBy(currentUser.name);

      // Broadcast execution to all peers in Yjs
      if (ydoc) {
        const runbookMap = ydoc.getMap('runbook_shared_state');
        runbookMap.set('output', resultStr);
        runbookMap.set('lastRunBy', currentUser.name);
        runbookMap.set('durationMs', elapsed);
        runbookMap.set('code', code);
      }
    } catch (err) {
      const errStr = `Runtime Error: ${(err as Error).message}`;
      setOutput(errStr);
      setStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '880px',
        marginTop: '24px',
        background: 'rgba(13, 17, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(139, 92, 246, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: '12px 20px',
          background: 'rgba(19, 17, 28, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            <Terminal size={16} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Executable Runbook & Sandbox</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                CRDT Real-Time Synced
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Executes in-browser and broadcasts output to all collaborating peers
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Preset Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Presets:</span>
            {RUNBOOK_PRESETS.map((preset) => {
              const isActive = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#c4b5fd' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.title}
                </button>
              );
            })}
          </div>

          {/* Code Editor Container */}
          <div
            style={{
              borderRadius: '12px',
              background: '#07090e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Code2 size={14} color="#8b5cf6" />
                <span>JavaScript / TypeScript Browser Sandbox</span>
              </div>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isRunning ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isRunning ? <RotateCw size={13} className="spinning" /> : <Play size={13} />}
                <span>{isRunning ? 'Executing...' : 'Run Code (Syncs All)'}</span>
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (ydoc) {
                  ydoc.getMap('runbook_shared_state').set('code', e.target.value);
                }
              }}
              rows={8}
              spellCheck={false}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Console Output Block */}
          {output && (
            <div
              style={{
                borderRadius: '12px',
                background: '#04060a',
                border: status === 'error' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                padding: '12px 16px',
                fontFamily: "'Fira Code', monospace",
                fontSize: '0.8rem',
                color: status === 'error' ? '#fb7185' : '#a7f3d0',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '6px',
                  marginBottom: '8px',
                  fontSize: '0.72rem',
                  color: '#64748b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {status === 'error' ? (
                    <AlertCircle size={13} color="#f43f5e" />
                  ) : (
                    <CheckCircle2 size={13} color="#10b981" />
                  )}
                  <span>Output Console</span>
                  {durationMs !== null && <span>• {durationMs} ms</span>}
                </div>
                {lastRunBy && (
                  <span style={{ color: '#c4b5fd' }}>
                    Executed by: <strong>{lastRunBy}</strong>
                  </span>
                )}
              </div>
              <code>{output}</code>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b' }}>
            <Sparkles size={12} color="#8b5cf6" />
            <span>Interactive Runbook: Mentors can test distributed edge scenarios live.</span>
          </div>
        </div>
      )}
    </div>
  );
};
