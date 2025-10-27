import React from 'react';
import { Users } from 'lucide-react';

export default function MutualConnectionsBadge({ count, names = [] }) {
  if (count === 0) return null;
  
  const displayNames = names.slice(0, 2);
  const remaining = count - displayNames.length;
  
  return (
    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2">
      <Users className="w-3 h-3" />
      {count === 1 && (
        <span>{displayNames[0] ? `1 mutual: ${displayNames[0]}` : '1 mutual connection'}</span>
      )}
      {count > 1 && displayNames.length > 0 && (
        <span>
          {displayNames.join(', ')}
          {remaining > 0 && ` +${remaining} more`}
        </span>
      )}
      {count > 1 && displayNames.length === 0 && (
        <span>{count} mutual connections</span>
      )}
    </div>
  );
}
