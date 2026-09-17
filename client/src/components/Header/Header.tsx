import React, { useState } from 'react';
import {
  Users,
  Terminal,
  ExternalLink,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import type { UserProfile, ConnectionStatus } from '../../types/index.js';
import { ChaosToggle } from './ChaosToggle.js';
import { UserProfileModal } from './UserProfileModal.js';
import { KnitCat } from '../Mascot/KnitCat.js';
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
  onOpenInvite?: () => void;
  onNavigateDashboard?: () => void;
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
  onOpenInvite,
  onNavigateDashboard,
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
        color: val.user.color || '#ff2a85',
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
    window.open(window.location.href, '_blank', 'width=950,height=850');
  };

  return (
    <header className="app-header">
      {/* Left: Brand & Document Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onNavigateDashboard ? 'pointer' : 'default' }}
          onClick={onNavigateDashboard}
          title={onNavigateDashboard ? "Back to Dashboard" : undefined}
        >
          {/* Mini Animated Knit Cat Icon */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 42, 133, 0.25), rgba(139, 92, 246, 0.25))',
              border: '1px solid rgba(255, 42, 133, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255, 42, 133, 0.35)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            title="Knit — Zero Data Loss Collaborative Rich-Text Engine"
          >
            <div style={{ transform: 'scale(0.85) translate(3px, 2px)' }}>
              <KnitCat size="sm" interactive={false} />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #ff77b9 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Knit
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {onNavigateDashboard && <ArrowLeft size={10} />}
              <span>{onNavigateDashboard ? 'Dashboard' : 'Real-Time CRDT'}</span>
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 26, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

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
                border: '1px solid #ff2a85',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '4px 10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                boxShadow: '0 0 12px rgba(255, 42, 133, 0.3)',
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
              transition: 'all 0.15s ease',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 42, 133, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
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
          style={{
            fontSize: '0.8rem',
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
          }}
          title="Open a second collaborative peer window to test live synchronization"
        >
          <ExternalLink size={14} />
          <span>Open Peer</span>
        </button>

        {/* Collaboration Share / Invite Button */}
        {onOpenInvite && (
          <button
            type="button"
            onClick={onOpenInvite}
            className="btn-ghost"
            style={{
              fontSize: '0.8rem',
              padding: '6px 12px',
              border: '1px solid rgba(236, 72, 153, 0.45)',
              color: '#f472b6',
              borderRadius: '8px',
              background: 'rgba(236, 72, 153, 0.1)',
            }}
            title="Share Document & Invite Collaborators"
          >
            <Share2 size={14} color="#ec4899" />
            <span>Share</span>
          </button>
        )}

        {/* Judge's Console Trigger */}
        <button
          type="button"
          onClick={onOpenJudgesConsole}
          className="btn-ghost"
          style={{
            fontSize: '0.8rem',
            padding: '6px 12px',
            border: '1px solid rgba(139, 92, 246, 0.45)',
            color: '#c4b5fd',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.08)',
          }}
          title="Open Judge's Developer Console (Cmd+Shift+D)"
        >
          <Terminal size={14} color="#c084fc" />
          <span>Judge's Console</span>
        </button>

        {/* Connected Peers Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
          {remotePeers.map((peer, idx) => (
            <div
              key={peer.id}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: peer.color,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginLeft: idx > 0 ? -8 : 0,
                border: '2px solid #05060a',
                boxShadow: `0 0 10px ${peer.color}`,
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
                color: '#94a3b8',
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
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: currentUser.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: '2px solid #ffffff',
            boxShadow: `0 0 12px ${currentUser.color}`,
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
