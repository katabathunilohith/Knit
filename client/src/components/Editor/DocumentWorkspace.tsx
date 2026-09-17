import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollaboration } from '../../hooks/useCollaboration.js';
import { Header } from '../Header/Header.js';
import { Editor } from './Editor.js';
import { TelemetryDashboard } from '../Telemetry/TelemetryDashboard.js';
import { JudgesConsoleModal } from '../JudgesConsole/JudgesConsoleModal.js';
import { BreathingWaveBackground } from '../Background/BreathingWaveBackground.js';
import { MascotStage } from '../Mascot/MascotStage.js';
import { InviteModal } from '../Invite/InviteModal.js';
import { TimeTravelScrubber } from '../TimeTravel/TimeTravelScrubber.js';
import { ExecutableRunbook } from '../Runbook/ExecutableRunbook.js';
import { AiTeammateModal } from '../AI/AiTeammateModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { getBackendConfig } from '../../config/api.js';
import type { DocumentItem } from '../../types/index.js';

export function DocumentWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract room from route params or URL query or default to 'knit-demo'
  const searchParams = new URLSearchParams(window.location.search);
  const docName = id || searchParams.get('room') || 'knit-demo';

  const [docTitle, setDocTitle] = useState('🧶 Untitled Knit Document');
  const [docMeta, setDocMeta] = useState<DocumentItem | null>(null);
  const [isJudgesConsoleOpen, setIsJudgesConsoleOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTimeTravelOpen, setIsTimeTravelOpen] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const API_HOST = getBackendConfig().apiUrl;

  // Fetch document metadata & title from server
  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/docs/${docName}/meta`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setDocMeta(data);
          if (data.title) {
            setDocTitle(data.title);
          }
        }
      } catch {
        // Fallback
      }
    };
    fetchMeta();
    return () => {
      isMounted = false;
    };
  }, [docName, API_HOST]);

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
    timelineSnapshots,
    timeTravelStep,
    setTimeTravelStep,
    currentUser,
    updateUserProfile,
    simulatePartition,
    healPartition,
  } = useCollaboration(docName);

  const activeSnapshot = timeTravelStep !== null ? (timelineSnapshots[timeTravelStep - 1] || timelineSnapshots[0]) : null;

  // Sync active auth user profile to Yjs awareness if available
  useEffect(() => {
    if (user && user.name) {
      updateUserProfile(user.name, user.color);
    }
  }, [user]);

  // Global Keyboard Shortcut: Cmd+Shift+D or Ctrl+Shift+D triggers the Judge's Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsJudgesConsoleOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        setIsAiModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateTitle = async (newTitle: string) => {
    setDocTitle(newTitle);
    try {
      await fetch(`${API_HOST}/api/docs/${docName}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (docMeta) {
        setDocMeta({ ...docMeta, title: newTitle });
      }
    } catch {
      // Offline fallback
    }
  };

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
        onUpdateDocTitle={handleUpdateTitle}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onNavigateDashboard={() => navigate('/')}
        onOpenAiTeammate={() => setIsAiModalOpen(true)}
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
            onEditorReady={setEditorInstance}
            timeTravelSnapshot={activeSnapshot}
            onExitTimeTravel={() => setTimeTravelStep(null)}
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

        {/* Executable Runbook & Interactive Sandbox */}
        <ExecutableRunbook ydoc={ydoc} currentUser={currentUser} />
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

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        documentMeta={docMeta || {
          id: docName,
          title: docTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
          inviteCode: docName,
          ownerName: user?.name,
          ownerEmail: user?.email,
        }}
      />

      {/* CRDT Time-Travel Keystroke Scrubber */}
      <TimeTravelScrubber
        snapshots={timelineSnapshots}
        currentStep={timeTravelStep}
        onStepChange={setTimeTravelStep}
        isOpen={isTimeTravelOpen}
        onToggleOpen={() => setIsTimeTravelOpen(!isTimeTravelOpen)}
      />

      {/* AI Teammate Concurrent Generation Modal */}
      <AiTeammateModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        editor={editorInstance}
        provider={provider}
      />
    </div>
  );
}
