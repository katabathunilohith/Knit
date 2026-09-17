import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { UserProfile } from '../../types/index.js';
import { COLLAB_COLORS } from '../../utils/colors.js';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdate: (name: string, color: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdate,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [selectedColor, setSelectedColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate(name.trim(), selectedColor);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '1.75rem',
          backgroundColor: '#111722',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Collaborator Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="collab-name-input"
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}
            >
              Display Name
            </label>
            <input
              id="collab-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                backgroundColor: '#0a0d14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}
            >
              Caret & Presence Color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLLAB_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: selectedColor === c ? '2px solid white' : '1px solid rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: selectedColor === c ? `0 0 10px ${c}` : 'none',
                    transform: selectedColor === c ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selectedColor === c && <Check size={16} color="#ffffff" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
