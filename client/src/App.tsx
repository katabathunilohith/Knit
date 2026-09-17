import { useState, useEffect } from 'react';
import { useCollaboration } from './hooks/useCollaboration.js';
import { Header } from './components/Header/Header.js';
import { Editor } from './components/Editor/Editor.js';
import { TelemetryDashboard } from './components/Telemetry/TelemetryDashboard.js';
import { JudgesConsoleModal } from './components/JudgesConsole/JudgesConsoleModal.js';
import { BreathingWaveBackground } from './components/Background/BreathingWaveBackground.js';
import { MascotStage } from './components/Mascot/MascotStage.js';

export function App() {
  // Extract room from URL query or default to 'knit-demo'
  const searchParams = new URLSearchParams(window.location.search);
  const docName = searchParams.get('room') || 'knit-demo';

  const [docTitle, setDocTitle] = useState('🧶 Untitled Knit Document');
  const [isJudgesConsoleOpen, setIsJudgesConsoleOpen] = useState(false);

  const {
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
    currentUser,
    updateUserProfile,
    simulatePartition,
    healPartition,
  } = useCollaboration(docName);

  // Global Keyboard Shortcut: Cmd+Shift+D or Ctrl+Shift+D triggers the Judge's Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsJudgesConsoleOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* Animated Radial Wave Breathing Background */}
      <BreathingWaveBackground />

      {/* Top Sticky Header */}
      <Header
        status={status}
        currentUser={currentUser}
        peers={peers}
        onSimulatePartition={simulatePartition}
        onHealPartition={healPartition}
        onUpdateUserProfile={updateUserProfile}
        onOpenJudgesConsole={() => setIsJudgesConsoleOpen(true)}
        docTitle={docTitle}
        onUpdateDocTitle={setDocTitle}
      />

      {/* Main Document Workspace */}
      <main className="editor-workspace">
        {/* Animated Knitting Cat Mascot Stage */}
        <MascotStage status={status} />

        {/* Document Editor Sheet */}
        {ydoc && provider ? (
          <Editor
            ydoc={ydoc}
            provider={provider}
            currentUser={currentUser}
            isIndexedDbSynced={isIndexedDbSynced}
          />
        ) : (
          <div
            className="document-sheet"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              minHeight: '420px',
            }}
          >
            <span>Initializing CRDT Engine & IndexedDB Persistence...</span>
          </div>
        )}
      </main>

      {/* Real-Time Performance Telemetry HUD */}
      <TelemetryDashboard
        status={status}
        pingMs={pingMs}
        docSizeBytes={docSizeBytes}
        structCount={structCount}
        peerCount={peers.size}
        isIndexedDbSynced={isIndexedDbSynced}
        totalKeystrokes={totalKeystrokes}
        throttler={throttler}
        onOpenJudgesConsole={() => setIsJudgesConsoleOpen(true)}
      />

      {/* Judge's Developer Console */}
      <JudgesConsoleModal
        isOpen={isJudgesConsoleOpen}
        onClose={() => setIsJudgesConsoleOpen(false)}
        ydoc={ydoc}
        transactions={transactions}
        docName={docName}
      />
    </div>
  );
}

export default App;
