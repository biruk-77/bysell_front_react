import React, { useMemo } from 'react';
import { X, Users, MapPin, Briefcase, TrendingUp } from 'lucide-react';
import { getRelatedConnections, getConnectionPath } from '../../utils/connectionHelpers';

export default function RelatedConnectionsModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  myConnections,
  allUsers,
  currentUser,
  onConnect
}) {
  const related = useMemo(() => {
    if (!isOpen || !targetUser) return null;
    return getRelatedConnections(myConnections, targetUser, allUsers);
  }, [isOpen, targetUser, myConnections, allUsers]);

  const connectionPath = useMemo(() => {
    if (!targetUser || !currentUser) return '';
    return getConnectionPath(currentUser, targetUser, myConnections);
  }, [targetUser, currentUser, myConnections]);

  if (!isOpen || !targetUser || !related) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Related Connections</h2>
              <p className="text-gray-600 mt-1">{connectionPath}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Target User Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {targetUser.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{targetUser.username}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {targetUser.role}
                  </span>
                  {targetUser.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {targetUser.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Mutual Connections */}
          {related.mutual.length > 0 && (
            <Section
              title="Mutual Connections"
              count={related.mutual.length}
              icon={Users}
              color="blue"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {related.mutual.map(conn => {
                  const mutualUser = conn.requester?.id === conn.requesterId ? conn.receiver : conn.requester;
                  return (
                    <MiniUserCard key={conn.id} user={mutualUser} badge="Mutual" />
                  );
                })}
              </div>
            </Section>
          )}

          {/* Second Degree */}
          {related.secondDegree.length > 0 && (
            <Section
              title="Friends of Friends"
              count={related.secondDegree.length}
              icon={TrendingUp}
              color="purple"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {related.secondDegree.map(user => (
                  <MiniUserCard 
                    key={user.id} 
                    user={user} 
                    badge="2nd Degree"
                    onConnect={() => onConnect(user)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Same Role */}
          {related.sameRole.length > 0 && (
            <Section
              title={`Other ${targetUser.role}s`}
              count={related.sameRole.length}
              icon={Briefcase}
              color="green"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {related.sameRole.slice(0, 6).map(user => (
                  <MiniUserCard 
                    key={user.id} 
                    user={user} 
                    badge="Same Role"
                    onConnect={() => onConnect(user)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Same Location */}
          {related.sameLocation.length > 0 && (
            <Section
              title={`From ${targetUser.location}`}
              count={related.sameLocation.length}
              icon={MapPin}
              color="orange"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {related.sameLocation.slice(0, 6).map(user => (
                  <MiniUserCard 
                    key={user.id} 
                    user={user} 
                    badge="Nearby"
                    onConnect={() => onConnect(user)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* No related connections */}
          {related.mutual.length === 0 && 
           related.secondDegree.length === 0 && 
           related.sameRole.length === 0 && 
           related.sameLocation.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No related connections found</h3>
              <p className="text-gray-600">Be the first to connect!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Section Component
function Section({ title, count, icon: Icon, color, children }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">({count})</span>
      </div>
      {children}
    </div>
  );
}

// Mini User Card Component
function MiniUserCard({ user, badge, onConnect }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{user?.username || 'Unknown'}</p>
          <p className="text-xs text-gray-600 capitalize truncate">{user?.role || 'User'}</p>
        </div>
        {badge && (
          <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 whitespace-nowrap">
            {badge}
          </span>
        )}
        {onConnect && (
          <button
            onClick={onConnect}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
