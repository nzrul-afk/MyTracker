import { useEffect } from 'react';
import { auth } from '../lib/firebase';
import { syncToCloud } from '../lib/sync';
import { onAuthStateChanged } from 'firebase/auth';

export function useSync() {
  useEffect(() => {
    let authUnsubscribe: () => void;

    const attemptSync = () => {
      if (navigator.onLine && auth.currentUser) {
        syncToCloud();
      }
    };

    // Listen to network changes
    window.addEventListener('online', attemptSync);
    
    // Sync every 2 minutes as a fallback
    const interval = setInterval(attemptSync, 2 * 60 * 1000);

    // Sync immediately when Auth State changes (user logs in)
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) attemptSync();
    });

    return () => {
      window.removeEventListener('online', attemptSync);
      clearInterval(interval);
      if (authUnsubscribe) authUnsubscribe();
    };
  }, []);
}
