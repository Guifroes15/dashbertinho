import { useState, useEffect } from 'react';
import { GroupData } from '../types';
import { GROUPS } from '../data';
import { subscribeToGroups } from '../services/groupService';

export function useGroups() {
  const [groups, setGroups] = useState<GroupData[]>(GROUPS);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const unsub = subscribeToGroups(
      (firestoreGroups) => {
        if (firestoreGroups.length > 0) {
          setGroups(firestoreGroups);
          setSeeded(true);
        } else {
          setGroups(GROUPS);
          setSeeded(false);
        }
      },
      () => {
        // Firestore error — keep hardcoded data
        setGroups(GROUPS);
      }
    );
    return unsub;
  }, []);

  return { groups, seeded };
}
