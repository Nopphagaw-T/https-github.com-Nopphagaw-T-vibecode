/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';

interface AvatarGroupProps {
  userIds: string[];
  allUsers: User[];
  max?: number;
}

export default function AvatarGroup({ userIds, allUsers, max = 3 }: AvatarGroupProps) {
  const members = userIds
    .map((id) => allUsers.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  const shownMembers = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex -space-x-1.5 overflow-hidden select-none items-center">
      {shownMembers.map((member) => (
        <div
          key={member.id}
          className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-bold text-[10px] text-slate-700 shadow-2xs shrink-0 cursor-pointer"
          title={member.name}
        >
          {member.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center font-bold text-[9px] text-slate-500 shadow-2xs shrink-0 cursor-pointer"
          title={`${overflow} more members`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
