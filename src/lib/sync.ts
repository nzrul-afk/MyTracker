import { db } from './db';
import { auth, db as firestore } from './firebase';
import { writeBatch, doc } from 'firebase/firestore';

export async function syncToCloud() {
  const user = auth.currentUser;
  if (!user || !navigator.onLine) return; 

  const uid = user.uid;
  let batch = writeBatch(firestore);
  let operationCount = 0;

  try {
    // Helper to push items to batch
    const pushToBatch = (collectionName: string, items: any[]) => {
      items.forEach(item => {
        // We use the Dexie auto-increment ID as the document ID in Firestore.
        // In a real production app, UUIDs are safer, but for MVP this works for 1 device.
        const docRef = doc(firestore, `users/${uid}/${collectionName}`, item.id.toString());
        // Remove local id and synced flag for cloud data payload
        const { id, synced, ...cloudData } = item;
        batch.set(docRef, cloudData, { merge: true });
        operationCount++;
      });
    };

    // 1. Transactions
    const unsyncedTx = await db.transactions.filter(t => !t.synced).toArray();
    pushToBatch('transactions', unsyncedTx);

    // 2. Todos
    const unsyncedTodos = await db.todos.filter(t => !t.synced).toArray();
    pushToBatch('todos', unsyncedTodos);

    // 3. Notes
    const unsyncedNotes = await db.notes.filter(t => !t.synced).toArray();
    pushToBatch('notes', unsyncedNotes);

    // 4. Budgets
    const unsyncedBudgets = await db.budgets.filter(t => !t.synced).toArray();
    pushToBatch('budgets', unsyncedBudgets);

    // 5. Bills
    const unsyncedBills = await db.bills.filter(t => !t.synced).toArray();
    pushToBatch('bills', unsyncedBills);

    // 6. Wishlists
    const unsyncedWishlists = await db.wishlists.filter(t => !t.synced).toArray();
    pushToBatch('wishlists', unsyncedWishlists);

    // 7. Projects
    const unsyncedProjects = await db.projects.filter(t => !t.synced).toArray();
    pushToBatch('projects', unsyncedProjects);

    // 8. Schedules
    const unsyncedSchedules = await db.schedules.filter(t => !t.synced).toArray();
    pushToBatch('schedules', unsyncedSchedules);

    // 9. Routines
    const unsyncedRoutines = await db.routines.filter(t => !t.synced).toArray();
    pushToBatch('routines', unsyncedRoutines);

    // Commit if there's anything
    if (operationCount > 0) {
      await batch.commit();

      // Mark as synced locally
      if (unsyncedTx.length) await Promise.all(unsyncedTx.map(t => db.transactions.update(t.id!, { synced: true })));
      if (unsyncedTodos.length) await Promise.all(unsyncedTodos.map(t => db.todos.update(t.id!, { synced: true })));
      if (unsyncedNotes.length) await Promise.all(unsyncedNotes.map(t => db.notes.update(t.id!, { synced: true })));
      if (unsyncedBudgets.length) await Promise.all(unsyncedBudgets.map(t => db.budgets.update(t.id!, { synced: true })));
      if (unsyncedBills.length) await Promise.all(unsyncedBills.map(t => db.bills.update(t.id!, { synced: true })));
      if (unsyncedWishlists.length) await Promise.all(unsyncedWishlists.map(t => db.wishlists.update(t.id!, { synced: true })));
      if (unsyncedProjects.length) await Promise.all(unsyncedProjects.map(t => db.projects.update(t.id!, { synced: true })));
      if (unsyncedSchedules.length) await Promise.all(unsyncedSchedules.map(t => db.schedules.update(t.id!, { synced: true })));
      if (unsyncedRoutines.length) await Promise.all(unsyncedRoutines.map(t => db.routines.update(t.id!, { synced: true })));

      console.log(`[Sync] Successfully synced ${operationCount} records to Firestore.`);
    }
  } catch (error) {
    console.error('[Sync] Error syncing to cloud:', error);
  }
}
