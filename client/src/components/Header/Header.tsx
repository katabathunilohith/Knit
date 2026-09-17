import React, { useState } from 'react';
import {
  FileText,
  Users,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import type { UserProfile, ConnectionStatus } from '../../types/index.js';
import { ChaosToggle } from './ChaosToggle.js';
import { UserProfileModal } from './UserProfileModal.js';
import { getInitials } from '../../utils/colors.js';

interface HeaderProps {
  status: ConnectionStatus;
  currentUser: UserProfile;
  peers: Map<number, any>;
  onSimulatePartition: () => void;
  onHealPartition: () => void;
  onUpdateUserProfile: (name: string, color: string) => void;
  onOpenJudgesConsole: () => void;
  docTitle: string;
  onUpdateDocTitle: (title: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  currentUser,
  peers,
  onSimulatePartition,
  onHealPartition,
  onUpdateUserProfile,
  onOpenJudgesConsole,
  docTitle,
  onUpdateDocTitle,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(docTitle);

  // Extract unique active remote peers from awareness states
  const remotePeers: { id: number; name: string; color: string }[] = [];
  peers.forEach((val, clientId) => {
    if (val.user && val.user.name && val.user.name !== currentUser.name) {
      remotePeers.push({
        id: clientId,
        name: val.user.name,
        color: val.user.color || '#3b82f6',
      });
    }
  });

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateDocTitle(titleInput.trim());
      setIsEditingTitle(false);
    }
  };

  const handleOpenPeerWindow = () => {
    // Open a second tab to test multi-user real-time sync immediately
    window.open(window.location.href, '_blank', 'width=900,height=800');
  };

  return (
    <header className="app-header">
      {/* Left: Brand & Document Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            <FileText size={20} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SyncScript CRDT
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Zero-Loss Collaborative Engine</div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Document Title Editable */}
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit}>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => {
                if (titleInput.trim()) onUpdateDocTitle(titleInput.trim());
                setIsEditingTitle(false);
              }}
              autoFocus
              style={{
                background: '#0d121c',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '4px 8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </form>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#e2e8f0',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.15s ease',
            }}
            title="Click to rename document"
          >
            {docTitle}
          </div>
        )}
      </div>

      {/* Center: The Chaos Toggle */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ChaosToggle
          status={status}
          onSimulatePartition={onSimulatePartition}
          onHealPartition={onHealPartition}
        />
      </div>

      {/* Right: Actions, Peers & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Multiplayer Tab Launcher */}
        <button
          type="button"
          onClick={handleOpenPeerWindow}
          className="btn-ghost"
          style={{ fontSize: '0.8rem', padding: '5px 10px' }}
          title="Open a second collaborative peer window to test live synchronization"
        >
          <ExternalLink size={14} />
          <span>Open Peer</span>
        </button>

        {/* Judge's Console Trigger */}
        <button
          type="button"
          onClick={onOpenJudgesConsole}
          className="btn-ghost"
          style={{
            fontSize: '0.8rem',
            padding: '5px 10px',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#c4b5fd',
          }}
          title="Open Judge's Developer Console (Cmd+Shift+D)"
        >
          <Terminal size={14} color="#a78bfa" />
          <span>Judge's Console</span>
        </button>

        {/* Connected Peers Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
          {remotePeers.map((peer, idx) => (
            <div
              key={peer.id}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: peer.color,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginLeft: idx > 0 ? -8 : 0,
                border: '2px solid #0a0d14',
                boxShadow: `0 0 8px ${peer.color}`,
                cursor: 'pointer',
              }}
              title={`Peer: ${peer.name}`}
            >
              {getInitials(peer.name)}
            </div>
          ))}
          {remotePeers.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: '#64748b',
                padding: '4px 8px',
              }}
              title="No other peers connected. Click 'Open Peer' to launch another tab!"
            >
              <Users size={14} />
              <span>Solo</span>
            </div>
          )}
        </div>

        {/* Current User Profile Trigger */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: currentUser.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '2px solid #ffffff',
            boxShadow: `0 0 10px ${currentUser.color}`,
            transition: 'transform 0.15s ease',
          }}
          title={`Your Profile: ${currentUser.name} (Click to edit)`}
        >
          {getInitials(currentUser.name)}
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdate={onUpdateUserProfile}
      />
    </header>
  );
};
