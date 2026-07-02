import React, { useEffect, useState } from 'react';
import { Users, Shield, User, Check, X } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, UserRole, GroupData, GROUPS_CONFIG } from '../../types';

interface Props {
  groups: GroupData[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin:  'text-brand-purple2 bg-brand-purple/10 border-brand-purple/20',
  staff:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  client: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export function UsersAdminView({ groups }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // All known groups (merge GROUPS_CONFIG with any Firestore groups)
  const knownGroups = [
    ...GROUPS_CONFIG,
    ...groups.filter(g => !GROUPS_CONFIG.find(c => c.id === g.id)).map(g => ({
      id: g.id, name: g.name, color: g.color,
    })),
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const list = snap.docs.map(d => d.data() as UserProfile);
      list.sort((a, b) => {
        const order: Record<UserRole, number> = { admin: 0, staff: 1, client: 2 };
        return order[a.role] - order[b.role] || a.name.localeCompare(b.name, 'pt-BR');
      });
      setUsers(list);
    });
    return unsub;
  }, []);

  const getUserGroupIds = (user: UserProfile): string[] => {
    if (user.groupIds === 'all') return knownGroups.map(g => g.id);
    return Array.isArray(user.groupIds) ? user.groupIds : [];
  };

  const toggleGroup = async (user: UserProfile, groupId: string) => {
    if (user.role === 'admin') return; // admin always has 'all'
    const current = getUserGroupIds(user);
    const next = current.includes(groupId)
      ? current.filter(id => id !== groupId)
      : [...current, groupId];
    setSaving(prev => ({ ...prev, [user.uid]: true }));
    try {
      await updateDoc(doc(db, 'users', user.uid), { groupIds: next });
    } finally {
      setSaving(prev => ({ ...prev, [user.uid]: false }));
    }
  };

  const setAllGroups = async (user: UserProfile, all: boolean) => {
    if (user.role === 'admin') return;
    setSaving(prev => ({ ...prev, [user.uid]: true }));
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        groupIds: all ? knownGroups.map(g => g.id) : [],
      });
    } finally {
      setSaving(prev => ({ ...prev, [user.uid]: false }));
    }
  };

  const changeRole = async (user: UserProfile, role: UserRole) => {
    setSaving(prev => ({ ...prev, [user.uid]: true }));
    try {
      const update: Partial<UserProfile> = { role };
      if (role === 'admin') update.groupIds = 'all';
      await updateDoc(doc(db, 'users', user.uid), update);
    } finally {
      setSaving(prev => ({ ...prev, [user.uid]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie os acessos e grupos de cada colaborador.
        </p>
      </div>

      <div className="space-y-3">
        {users.length === 0 && (
          <div className="bg-brand-medium border border-brand-light rounded-xl p-8 text-center">
            <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Nenhum usuário cadastrado ainda.</p>
          </div>
        )}

        {users.map(user => {
          const userGroupIds = getUserGroupIds(user);
          const isAdmin = user.role === 'admin';
          const isSaving = saving[user.uid];

          return (
            <div key={user.uid} className="bg-brand-medium border border-brand-light rounded-xl p-5 space-y-4">
              {/* User header */}
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-light border border-brand-light flex items-center justify-center shrink-0">
                    {isAdmin
                      ? <Shield className="w-4 h-4 text-brand-purple2" />
                      : <User className="w-4 h-4 text-gray-500" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border border-brand-purple border-t-transparent rounded-full animate-spin" />
                  )}
                  <select
                    value={user.role}
                    onChange={e => changeRole(user, e.target.value as UserRole)}
                    disabled={isAdmin}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-widest bg-transparent cursor-pointer disabled:cursor-default ${ROLE_COLORS[user.role]}`}
                  >
                    <option value="admin">Administrador</option>
                    <option value="staff">Gestor</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>
              </div>

              {/* Group assignment */}
              {!isAdmin && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Grupos</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAllGroups(user, true)}
                        className="text-[10px] font-bold text-brand-purple2 hover:text-brand-purple transition-colors"
                      >
                        Todos
                      </button>
                      <span className="text-gray-700 text-[10px]">·</span>
                      <button
                        onClick={() => setAllGroups(user, false)}
                        className="text-[10px] font-bold text-gray-600 hover:text-gray-400 transition-colors"
                      >
                        Nenhum
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {knownGroups.map(group => {
                      const active = userGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          onClick={() => toggleGroup(user, group.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            active
                              ? 'bg-brand-light border-brand-light text-white'
                              : 'bg-transparent border-brand-light text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          {active
                            ? <Check className="w-3 h-3" style={{ color: group.color }} />
                            : <X className="w-3 h-3" />
                          }
                          {group.name.replace('Grupo ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isAdmin && (
                <p className="text-[10px] text-gray-600 italic">
                  Acesso total a todos os grupos e funcionalidades.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
