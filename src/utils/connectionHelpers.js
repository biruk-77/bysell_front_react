// ========================================
// PART 1: Mutual Connections Calculator
// ========================================

/**
 * Calculate mutual connections between current user and target user
 * @param {Array} myConnections - Current user's connections
 * @param {Object} targetUser - The user to check mutuals with
 * @returns {Array} - Array of mutual connection objects
 */
export const getMutualConnections = (myConnections, targetUser) => {
  if (!myConnections || !targetUser?.connections) return [];
  
  const myConnectionIds = myConnections.map(conn => {
    const otherId = conn.requester?.id === conn.requesterId ? conn.receiver?.id : conn.requester?.id;
    return otherId;
  }).filter(Boolean);

  const targetConnectionIds = targetUser.connections || [];
  
  const mutualIds = myConnectionIds.filter(id => targetConnectionIds.includes(id));
  
  return myConnections.filter(conn => {
    const otherId = conn.requester?.id === conn.requesterId ? conn.receiver?.id : conn.requester?.id;
    return mutualIds.includes(otherId);
  });
};

/**
 * Get count of mutual connections
 */
export const getMutualCount = (myConnections, targetUser) => {
  return getMutualConnections(myConnections, targetUser).length;
};

// ========================================
// PART 2: People You May Know Algorithm
// ========================================

/**
 * Generate smart suggestions based on network
 * @param {Array} myConnections - Current user's connections
 * @param {Array} allUsers - All available users
 * @param {Object} currentUser - Current logged in user
 * @returns {Array} - Suggested users with scores
 */
export const getPeopleYouMayKnow = (myConnections, allUsers, currentUser) => {
  const suggestions = [];
  
  // Get IDs of current connections
  const connectedIds = myConnections.map(conn => {
    return conn.requester?.id === currentUser.id ? conn.receiver?.id : conn.requester?.id;
  }).filter(Boolean);
  
  connectedIds.push(currentUser.id); // Exclude self
  
  allUsers.forEach(user => {
    if (connectedIds.includes(user.id)) return; // Skip already connected
    
    let score = 0;
    let reasons = [];
    
    // Reason 1: Mutual connections (highest weight)
    const mutualCount = getMutualCount(myConnections, user);
    if (mutualCount > 0) {
      score += mutualCount * 10;
      reasons.push(`${mutualCount} mutual connection${mutualCount > 1 ? 's' : ''}`);
    }
    
    // Reason 2: Same role
    if (user.role === currentUser.role) {
      score += 5;
      reasons.push(`Also a ${user.role}`);
    }
    
    // Reason 3: Same location
    if (user.location && user.location === currentUser.location) {
      score += 8;
      reasons.push(`From ${user.location}`);
    }
    
    // Reason 4: Recently active
    if (user.lastActive) {
      const hoursSinceActive = (Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) {
        score += 3;
        reasons.push('Recently active');
      }
    }
    
    if (score > 0) {
      suggestions.push({
        ...user,
        suggestionScore: score,
        suggestionReasons: reasons
      });
    }
  });
  
  // Sort by score descending
  return suggestions.sort((a, b) => b.suggestionScore - a.suggestionScore);
};

// ========================================
// PART 3: Network Insights & Analytics
// ========================================

/**
 * Calculate network statistics
 */
export const getNetworkInsights = (myConnections) => {
  const insights = {
    total: myConnections.length,
    byRole: {},
    recentGrowth: 0,
    topConnectors: [],
    avgConnectionsPerUser: 0
  };
  
  // Count by role
  myConnections.forEach(conn => {
    const other = conn.requester?.id === conn.requesterId ? conn.receiver : conn.requester;
    const role = other?.role || 'unknown';
    insights.byRole[role] = (insights.byRole[role] || 0) + 1;
  });
  
  // Recent growth (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  insights.recentGrowth = myConnections.filter(conn => {
    return new Date(conn.createdAt) > sevenDaysAgo;
  }).length;
  
  return insights;
};

/**
 * Get connection strength indicator
 */
export const getConnectionStrength = (connection) => {
  let strength = 0;
  
  // More interactions = stronger connection
  if (connection.messageCount > 10) strength += 3;
  else if (connection.messageCount > 5) strength += 2;
  else if (connection.messageCount > 0) strength += 1;
  
  // Older connections = stronger
  const daysSinceConnection = (Date.now() - new Date(connection.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceConnection > 90) strength += 3;
  else if (daysSinceConnection > 30) strength += 2;
  else if (daysSinceConnection > 7) strength += 1;
  
  return strength; // 0-6 scale
};

// ========================================
// PART 4: Related Connections Finder
// ========================================

/**
 * Find all related connections for a user
 */
export const getRelatedConnections = (myConnections, targetUser, allUsers) => {
  const related = {
    mutual: [],
    secondDegree: [],
    sameRole: [],
    sameLocation: []
  };
  
  // Mutual connections
  related.mutual = getMutualConnections(myConnections, targetUser);
  
  // Second degree (friends of friends)
  if (targetUser.connections) {
    const targetConnectionIds = targetUser.connections;
    const myConnectionIds = myConnections.map(conn => {
      return conn.requester?.id === conn.requesterId ? conn.receiver?.id : conn.requester?.id;
    });
    
    related.secondDegree = allUsers.filter(u => 
      targetConnectionIds.includes(u.id) && 
      !myConnectionIds.includes(u.id) &&
      u.id !== targetUser.id
    ).slice(0, 10);
  }
  
  // Same role connections
  related.sameRole = allUsers.filter(u => 
    u.role === targetUser.role && 
    u.id !== targetUser.id
  ).slice(0, 10);
  
  // Same location
  if (targetUser.location) {
    related.sameLocation = allUsers.filter(u => 
      u.location === targetUser.location && 
      u.id !== targetUser.id
    ).slice(0, 10);
  }
  
  return related;
};

/**
 * Format connection path (how you're connected)
 */
export const getConnectionPath = (currentUser, targetUser, myConnections) => {
  const mutuals = getMutualConnections(myConnections, targetUser);
  
  if (mutuals.length === 0) {
    return `Suggested based on ${targetUser.role} network`;
  }
  
  if (mutuals.length === 1) {
    const mutual = mutuals[0];
    const mutualUser = mutual.requester?.id === mutual.requesterId ? mutual.receiver : mutual.requester;
    return `Connected through ${mutualUser?.username}`;
  }
  
  return `Connected through ${mutuals.length} mutual friends`;
};
