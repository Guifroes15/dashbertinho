import { db } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { GroupData, MonthData } from '../types';

const GROUP_ORDER = ['yamcol', 'barbosa', 'paralelas', 'lupo', 'ferracini'];

export function subscribeToGroups(
  callback: (groups: GroupData[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(db, 'groups'),
    (snapshot) => {
      const groups: GroupData[] = [];
      snapshot.forEach((d) => groups.push(d.data() as GroupData));
      groups.sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a.id);
        const bi = GROUP_ORDER.indexOf(b.id);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
      callback(groups);
    },
    (err) => onError?.(err)
  );
}

export async function seedGroupsToFirestore(groups: GroupData[]): Promise<void> {
  for (const group of groups) {
    await setDoc(doc(db, 'groups', group.id), group);
  }
}

export async function addOrUpdateMonthData(
  groupId: string,
  storeId: string,
  monthData: MonthData
): Promise<void> {
  const groupRef = doc(db, 'groups', groupId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(groupRef);
    if (!snap.exists()) throw new Error('Grupo não encontrado');

    const groupData = snap.data() as GroupData;
    const storeIdx = groupData.stores.findIndex((s) => s.id === storeId);
    if (storeIdx === -1) throw new Error('Loja não encontrada');

    const store = { ...groupData.stores[storeIdx] };
    const hist = [...store.historico];
    const existingIdx = hist.findIndex((h) => h.chave === monthData.chave);

    if (existingIdx >= 0) {
      hist[existingIdx] = monthData;
    } else {
      hist.push(monthData);
      hist.sort((a, b) => a.chave.localeCompare(b.chave));
    }

    const newStores = [...groupData.stores];
    newStores[storeIdx] = { ...store, historico: hist };
    tx.update(groupRef, { stores: newStores });
  });
}
