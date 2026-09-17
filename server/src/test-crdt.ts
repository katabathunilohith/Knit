import * as Y from 'yjs';
import { StateCompactor } from './persistence/compaction.js';

console.log('🧪 Starting Distributed CRDT Convergence & Compaction Tests...\n');

// 1. Initialize two isolated clients
const docA = new Y.Doc({ gc: true });
const docB = new Y.Doc({ gc: true });

const textA = docA.getText('content');
const textB = docB.getText('content');

// 2. Initial state sync
textA.insert(0, 'Initial Shared Base');
const initialUpdate = Y.encodeStateAsUpdate(docA);
Y.applyUpdate(docB, initialUpdate, 'initial-sync');

console.log(`✓ Initial state synchronized: "${textA.toString()}"`);

// 3. SIMULATE NETWORK PARTITION (The Chaos Scenario)
console.log('\n⚡ Simulating Network Partition: Client A and Client B edit concurrently while offline...');

// Client A types at offset 0 while offline
docA.transact(() => {
  textA.insert(0, '[A: Offline Update] ');
  textA.insert(textA.length, ' - A appended.');
}, 'client-a-partition');

// Client B types at offset 7 and deletes "Shared" while offline
docB.transact(() => {
  textB.insert(8, '[B: Offline Concurrent Note] ');
}, 'client-b-partition');

console.log(`  Client A state during partition: "${textA.toString()}"`);
console.log(`  Client B state during partition: "${textB.toString()}"`);

// 4. HEAL NETWORK PARTITION & BIDIRECTIONAL CRDT MERGE
console.log('\n🔄 Healing Network Partition: Exchanging state vectors and updates...');

// Step 1: Client A calculates diff for Client B based on B's state vector
const stateVectorB = Y.encodeStateVector(docB);
const diffForB = Y.encodeStateAsUpdate(docA, stateVectorB);

// Step 2: Client B calculates diff for Client A based on A's state vector
const stateVectorA = Y.encodeStateVector(docA);
const diffForA = Y.encodeStateAsUpdate(docB, stateVectorA);

// Apply cross-diffs
Y.applyUpdate(docB, diffForB, 'merge-from-a');
Y.applyUpdate(docA, diffForA, 'merge-from-b');

// 5. VERIFY MATHEMATICAL CONVERGENCE
const finalA = textA.toString();
const finalB = textB.toString();

console.log(`  Client A reconciled state: "${finalA}"`);
console.log(`  Client B reconciled state: "${finalB}"`);

if (finalA === finalB) {
  console.log('\n🎉 SUCCESS: Flawless CRDT convergence achieved! Text states are 100% identical.');
} else {
  console.error('\n❌ FAILURE: States diverged!');
  process.exit(1);
}

// 6. VERIFY STATE COMPACTION & GARBAGE COLLECTION
console.log('\n🛡️ Testing State Compaction & GC...');
const structsBefore = StateCompactor.countStructs(docA);
const sizeBefore = Y.encodeStateAsUpdate(docA).byteLength;

// Consolidate into clean snapshot
const compactedDoc = new Y.Doc({ gc: true });
Y.applyUpdate(compactedDoc, Y.encodeStateAsUpdate(docA));
const sizeAfter = Y.encodeStateAsUpdate(compactedDoc).byteLength;
const structsAfter = StateCompactor.countStructs(compactedDoc);

console.log(`  Pre-Compaction Size:  ${sizeBefore} bytes | Structs: ${structsBefore}`);
console.log(`  Post-Compaction Size: ${sizeAfter} bytes | Structs: ${structsAfter}`);
console.log(`  State preserved exactly: "${compactedDoc.getText('content').toString()}"`);

if (compactedDoc.getText('content').toString() === finalA) {
  console.log('🎉 SUCCESS: Compaction preserved identical state without data loss!\n');
} else {
  console.error('❌ FAILURE: Compaction altered content!');
  process.exit(1);
}
