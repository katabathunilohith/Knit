import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Dashboard } from './components/Dashboard/Dashboard.js';
import { DocumentWorkspace } from './components/Editor/DocumentWorkspace.js';
import { InvitePage } from './components/Invite/InvitePage.js';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Multi-User Document Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Real-Time CRDT Document Workspace */}
          <Route path="/doc/:id" element={<DocumentWorkspace />} />

          {/* Backward compatible route for default room */}
          <Route path="/editor" element={<DocumentWorkspace />} />

          {/* Peer Collaboration Invite Link */}
          <Route path="/invite/:code" element={<InvitePage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
