import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { AccessState } from '../components/views/AccessGate';

export function profileToAccessState(profile: UserProfile): AccessState {
  if (profile.role === 'admin') {
    return { groupIds: 'all', isMaster: true, isStaff: false, nome: profile.name };
  }
  if (profile.role === 'staff') {
    const gids = profile.groupIds;
    return {
      groupIds: gids === 'all' ? 'all' : (Array.isArray(gids) ? gids : []),
      isMaster: false,
      isStaff: true,
      nome: profile.name,
    };
  }
  // client
  const gids = profile.groupIds;
  return {
    groupIds: Array.isArray(gids) ? gids : [],
    isMaster: false,
    isStaff: false,
    nome: profile.name,
  };
}

export function useAuth() {
  const [loading, setLoading]       = useState(true);
  const [accessState, setAccess]    = useState<AccessState | null>(null);
  const [profile, setProfile]       = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAccess(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const p = snap.data() as UserProfile;
          setProfile(p);
          setAccess(profileToAccessState(p));
        }
      } catch {
        // Firestore unavailable — user must sign in fresh
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setAccess(null);
    setProfile(null);
  };

  return { loading, accessState, profile, logout };
}
