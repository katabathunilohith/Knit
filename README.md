# 🧶 Knit — Real-Time Collaborative CRDT Editor

> **Weaving Collaborative Thoughts with Zero Data Loss**: Built for distributed systems evaluation, featuring zero data loss during network partitions, sub-millisecond cursor synchronization, breathing radial wave background theme, and animated mascot.

---

## 🏆 Executive Summary & Architecture Highlights

Knit is an offline-first, real-time collaborative rich-text editor designed for resilient distributed editing. While traditional web applications rely on centralized servers and REST/RPC APIs (which fail during network partitions), Knit implements a **Local-First Distributed Model** where the browser is a fully self-contained distributed node.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser Node)                              │
│                                                                                 │
│   [ TipTap Rich Text ] ◄──► [ Y.Doc CRDT Engine ] ◄──► [ IndexedDB Persistence ] │
│                                      │                         ▲                │
│                         (Awareness   │   (State Updates)       │ (Instant       │
│                         Throttler)   │                         │  Local Load)   │
│                             │        │                         │                │
└─────────────────────────────┼────────┼─────────────────────────┼────────────────┘
                              │        │ (Zero-Loss Binary Sync)
                              ▼        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS WEBSOCKET SYNC HUB                              │
│                                                                                 │
│   [ Awareness Router ]      [ Yjs Binary Protocol ]     [ State Compactor & GC ]│
│   (35ms Bandwidth Saver)    (Sync Steps 1 & 2)          (Memory Consolidation)  │
│                                      │                                          │
│                                      ▼                                          │
│                           [ Uint8Array Disk Store ]                             │
│                           [ Redis PubSub Adapter ]                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

### 1. The Chaos Toggle (Network Partition Simulator)
- **What it does**: A header switch that simulates a severe network partition by severing the WebSocket connection.
- **How to test**:
  1. Click **`ONLINE: SYNCED`** to sever the network connection (`CHAOS ACTIVE: PARTITIONED`).
  2. Type new paragraphs, delete text, or format content offline. Keystrokes are instantly persisted to **IndexedDB**.
  3. Click **`CHAOS ACTIVE: PARTITIONED`** to heal the partition.
  4. Watch the WebSocket reconnect, exchange vector clocks (`Sync Step 1`), merge concurrent operations (`Sync Step 2`), and trigger a celebratory confetti merge notification!
  5. **Split-Screen Demo**: Click the **"Open Peer"** button in the header to open a second tab side-by-side. Sever one tab, type concurrently in both tabs, heal the partition, and witness character-level interleaving without Last-Write-Wins (LWW) data loss.

### 2. Performance Telemetry HUD
- Floating glassmorphic dock tracking real-time distributed systems health:
  - **WebSocket RTT Latency**: Sub-millisecond round-trip time measured via server timestamp ping-pong.
  - **CRDT Document Size**: Exact byte-level footprint of the encoded state (`Y.encodeStateAsUpdate`).
  - **Active Peers**: Real-time connected peer count.
  - **CRDT Structs**: Total items in the internal linked list struct store.
  - **Awareness Throttling**: Live display showing **~75% socket traffic saved** by throttling cursor awareness to 35ms.
  - **Session Keystrokes**: Counter tracking total mutations recorded this session.

### 3. The Judge's Console (`Cmd+Shift+D` / `Ctrl+Shift+D`)
- A dedicated developer inspector designed specifically for distributed systems mentors:
  - **Vector Clocks**: Live matrix showing each Client Node ID, sequence clock, and Lamport timestamp.
  - **CRDT Item Tree**: Inspects the raw Yjs Struct Store (`ContentString`, `ContentFormat`, `ContentDeleted`), left/right origins, lengths, and deleted flags.
  - **Live Transaction Stream**: Real-time scrolling feed of incoming and outgoing CRDT transactions with byte deltas, origins (`local-keystroke`, `remote-peer`, `local-indexeddb`), and timestamps.
  - **State Compaction & Garbage Collection**: Interactive button to trigger server-side GC (`POST /api/docs/:id/compact`) and observe the document footprint consolidate in real time!

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Ultra-fast rendering and component architecture |
| **Rich-Text Engine** | TipTap v2 + ProseMirror | Headless collaborative document representation |
| **CRDT Engine** | `yjs` (v13) | Mathematical conflict-free replicated data types |
| **Local Persistence** | `y-indexeddb` | Instant render from local disk before network handshake |
| **Sync Hub & WS** | Node.js + Express + `ws` | Binary sync protocol handling Sync Steps 1 & 2 |
| **Awareness Protocol** | `y-protocols/awareness` | Throttled remote carets with custom user colors & badges |
| **State Snapshots & GC**| `Y.encodeStateAsUpdate` | Consolidates CRDT transaction bloat into compact Uint8Array |
| **Scaling Architecture** | Redis PubSub Adapter | Horizontal multi-server scaling with seamless in-memory fallback |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/katabathunilohith/Knit.git
cd Knit

# 2. Install dependencies for root, client, and server
npm run install:all

# 3. Run both Backend Server & Frontend Client concurrently:
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend WebSocket Server**: [http://localhost:1234](http://localhost:1234)
- **Health Check**: [http://localhost:1234/health](http://localhost:1234/health)
- **Document Stats**: [http://localhost:1234/api/docs/hackathon-demo/stats](http://localhost:1234/api/docs/hackathon-demo/stats)

---

## 🧪 Automated Verification Suite

To run the automated CRDT offline partition and convergence test:

```bash
npx --prefix server tsx server/src/test-crdt.ts
```

This automated test:
1. Instantiates two isolated Yjs document nodes.
2. Simulates an offline network partition with concurrent conflicting character insertions and deletions.
3. Exchanges state vectors (`Sync Step 1`) and applies updates (`Sync Step 2`).
4. Verifies 100% mathematical state convergence and character-level interleaving without data loss.
5. Verifies state compaction and snapshot encoding.

---

## 🌐 Production Deployment Guide (Vercel + Render / Railway)

Real-time collaborative applications require **two runtime environments**:
1. **Frontend (Knit Client)** on **Vercel** (Global Edge CDN, instantaneous page loads, SPA routing).
2. **Backend (WebSocket Sync Hub)** on **Render** or **Railway** (free persistent container supporting persistent duplex `wss://` connections).

> ℹ️ **Why split frontend & backend?** Vercel Serverless and Edge functions are stateless request/response runners that terminate immediately after returning an HTTP response. They **do not support persistent WebSockets (`ws://`/`wss://`)**. Running the backend on Render/Railway provides a free, perpetual WebSocket server that connects peers across the world.

### Step 1: Deploy Backend WebSocket Server (Render.com - 100% Free)
1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: complete Knit collaborative editor"
   git push origin main
   ```
2. Go to [Render.com](https://render.com) and click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Configure the service:
   - **Name**: `knit-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Deploy Web Service**.
6. Once deployed, copy your Render URL (e.g., `https://knit-server.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `client` (or leave root since `vercel.json` is configured).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_WS_URL`: `wss://knit-server.onrender.com` (replace with your Render URL, using `wss://`)
   - `VITE_API_URL`: `https://knit-server.onrender.com` (replace with your Render URL, using `https://`)
   - *(Optional)* `VITE_CLERK_PUBLISHABLE_KEY`: *(Only if you want external Clerk SSO; otherwise Knit's built-in 1-click verified personas work automatically!)*
5. Click **Deploy**! 🚀

---

### Step 3: Test Multi-User Production Collaboration
1. Open your live Vercel URL (e.g., `https://knit-collab.vercel.app`).
2. Click **"New Document"** or join an existing document.
3. Click the **"Invite"** button in the header, copy the generated invite link (`https://knit-collab.vercel.app/invite/<code-or-id>`).
4. Send the link to a teammate, or open it in an Incognito window / another device.
5. Watch keystrokes, remote carets, selection highlights, and execution runbooks sync instantaneously over secure WebSockets!
